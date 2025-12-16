'use client';

import { useState, useEffect, useMemo } from 'react';
import { X, ChevronLeft, ChevronRight, Plus, Edit2, Trash2, Clock } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { useTheme } from '@/lib/ThemeContext';
import { appointmentStorage, Appointment } from '@/lib/storage';
import ConfirmDialog from './ConfirmDialog';

interface AppointmentCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AppointmentCalendarModal({ isOpen, onClose }: AppointmentCalendarModalProps) {
  const { t, language } = useLanguage();
  const { themeId } = useTheme();
  const isDark = themeId === 'dark';
  const [currentWeek, setCurrentWeek] = useState(() => {
    // Start with current week (Monday)
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    return new Date(today.setDate(diff));
  });
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [clickedTimeSlot, setClickedTimeSlot] = useState<{ date: Date; hour: number } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    patientName: '',
    patientNumber: '',
    problem: '',
    startTime: '',
    duration: 25,
  });

  // Load appointments
  useEffect(() => {
    const loadAppointments = async () => {
      if (isOpen) {
        try {
          const allAppointments = await appointmentStorage.getAll();
          setAppointments(allAppointments);
        } catch (error) {
          console.error("Error loading appointments:", error);
          setAppointments([]);
        }
      }
    };
    loadAppointments();
  }, [isOpen]);

  // Get week days (Monday to Sunday)
  const weekDays = useMemo(() => {
    const days: Date[] = [];
    const startOfWeek = new Date(currentWeek);
    startOfWeek.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  }, [currentWeek]);

  // Get appointments for a specific day
  const getAppointmentsForDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return appointments.filter(a => {
      const appointmentDate = new Date(a.startTime).toISOString().split('T')[0];
      return appointmentDate === dateStr;
    }).sort((a, b) => {
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    });
  };

  // Get appointments for a specific hour in a day
  const getAppointmentsForHour = (date: Date, hour: number) => {
    const dayAppointments = getAppointmentsForDay(date);
    return dayAppointments.filter(a => {
      const appointmentDate = new Date(a.startTime);
      const appointmentHour = appointmentDate.getHours();
      const appointmentMinute = appointmentDate.getMinutes();
      const appointmentEnd = new Date(appointmentDate.getTime() + a.duration * 60000);
      const appointmentEndHour = appointmentEnd.getHours();
      
      // Check if appointment overlaps with this hour
      return (appointmentHour <= hour && appointmentEndHour >= hour) ||
             (appointmentHour === hour);
    });
  };

  // Calculate appointment position and height
  const getAppointmentStyle = (appointment: Appointment) => {
    const start = new Date(appointment.startTime);
    const end = new Date(start.getTime() + appointment.duration * 60000);
    const startHour = start.getHours() + start.getMinutes() / 60;
    const endHour = end.getHours() + end.getMinutes() / 60;
    const duration = endHour - startHour;
    
    return {
      top: `${(startHour - 8) * 60}px`, // 8 AM start
      height: `${duration * 60}px`,
    };
  };

  // Navigate weeks
  const previousWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() - 7);
    setCurrentWeek(newWeek);
  };

  const nextWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() + 7);
    setCurrentWeek(newWeek);
  };

  const goToToday = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    setCurrentWeek(new Date(today.setDate(diff)));
  };

  // Handle time slot click
  const handleTimeSlotClick = (date: Date, hour: number) => {
    // Check if there's already an appointment at this time slot
    const clickedDate = new Date(date);
    clickedDate.setHours(hour, 0, 0, 0);
    
    // Find appointments that overlap with this hour
    const dayAppointments = getAppointmentsForDay(date);
    const clickedTime = clickedDate.getTime();
    
    const existingAppointment = dayAppointments.find(a => {
      const appointmentStart = new Date(a.startTime).getTime();
      const appointmentEnd = appointmentStart + (a.duration * 60000);
      
      // Check if clicked time falls within appointment time range
      // Include appointments that start at this hour or overlap with this hour
      return clickedTime >= appointmentStart && clickedTime < appointmentEnd;
    });

    // If appointment exists, show its details
    if (existingAppointment) {
      setEditingAppointment(existingAppointment);
      // Convert ISO time to local datetime-local format
      const appointmentDate = new Date(existingAppointment.startTime);
      const year = appointmentDate.getFullYear();
      const month = String(appointmentDate.getMonth() + 1).padStart(2, '0');
      const day = String(appointmentDate.getDate()).padStart(2, '0');
      const hours = String(appointmentDate.getHours()).padStart(2, '0');
      const minutes = String(appointmentDate.getMinutes()).padStart(2, '0');
      const localTimeString = `${year}-${month}-${day}T${hours}:${minutes}`;
      
      setFormData({
        name: existingAppointment.name,
        patientName: existingAppointment.patientName,
        patientNumber: existingAppointment.patientNumber,
        problem: existingAppointment.problem || '',
        startTime: localTimeString,
        duration: existingAppointment.duration,
      });
      setShowAppointmentForm(true);
      return;
    }

    // Otherwise, create new appointment at clicked time
    // Use local time string format (YYYY-MM-DDTHH:mm) to avoid timezone issues
    const year = clickedDate.getFullYear();
    const month = String(clickedDate.getMonth() + 1).padStart(2, '0');
    const day = String(clickedDate.getDate()).padStart(2, '0');
    const hours = String(hour).padStart(2, '0');
    const minutes = '00';
    const localTimeString = `${year}-${month}-${day}T${hours}:${minutes}`;
    
    setClickedTimeSlot({ date, hour });
    setFormData({
      name: '',
      patientName: '',
      patientNumber: '',
      problem: '',
      startTime: localTimeString,
      duration: 25,
    });
    setEditingAppointment(null);
    setShowAppointmentForm(true);
  };

  // Handle appointment click
  const handleAppointmentClick = (appointment: Appointment, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingAppointment(appointment);
    // Convert ISO time to local datetime-local format
    const appointmentDate = new Date(appointment.startTime);
    const year = appointmentDate.getFullYear();
    const month = String(appointmentDate.getMonth() + 1).padStart(2, '0');
    const day = String(appointmentDate.getDate()).padStart(2, '0');
    const hours = String(appointmentDate.getHours()).padStart(2, '0');
    const minutes = String(appointmentDate.getMinutes()).padStart(2, '0');
    const localTimeString = `${year}-${month}-${day}T${hours}:${minutes}`;
    
    setFormData({
      name: appointment.name,
      patientName: appointment.patientName,
      patientNumber: appointment.patientNumber,
      problem: appointment.problem || '',
      startTime: localTimeString,
      duration: appointment.duration,
    });
    setShowAppointmentForm(true);
  };

  // Handle delete appointment
  const handleDeleteAppointment = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAppointmentToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDeleteAppointment = async () => {
    if (!appointmentToDelete) return;
    try {
      await appointmentStorage.delete(appointmentToDelete);
      const updated = await appointmentStorage.getAll();
      setAppointments(updated);
      setDeleteDialogOpen(false);
      setAppointmentToDelete(null);
    } catch (error) {
      console.error("Error deleting appointment:", error);
      alert("Termin silinirken bir hata oluştu.");
    }
  };

  // Handle save appointment
  const handleSaveAppointment = async () => {
    if (!formData.name || !formData.patientName || !formData.patientNumber || !formData.startTime) {
      alert(t('appointments.fillRequired') || 'Lütfen zorunlu alanları doldurun');
      return;
    }

    // Convert local datetime string to ISO string while preserving the time
    // formData.startTime is in format "YYYY-MM-DDTHH:mm" (local time)
    // We need to create a Date object that represents this exact local time
    const [datePart, timePart] = formData.startTime.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes] = timePart.split(':').map(Number);
    
    // Create date with local timezone
    const localDate = new Date(year, month - 1, day, hours, minutes, 0, 0);
    
    // Check if date is valid
    if (isNaN(localDate.getTime())) {
      alert('Geçersiz tarih/saat formatı');
      return;
    }

    const appointment: Appointment = {
      id: editingAppointment?.id || Date.now().toString(),
      name: formData.name,
      patientName: formData.patientName,
      patientNumber: formData.patientNumber,
      problem: formData.problem || undefined,
      startTime: localDate.toISOString(),
      duration: formData.duration,
      createdAt: editingAppointment?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await appointmentStorage.save(appointment);
      const updated = await appointmentStorage.getAll();
      setAppointments(updated);
    } catch (error) {
      console.error("Error saving appointment:", error);
      alert("Termin kaydedilirken bir hata oluştu.");
      return;
    }
    setShowAppointmentForm(false);
    setEditingAppointment(null);
    setClickedTimeSlot(null);
    setFormData({
      name: '',
      patientName: '',
      patientNumber: '',
      problem: '',
      startTime: '',
      duration: 25,
    });
  };

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(language === 'de' ? 'de-DE' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Generate hours (8 AM to 8 PM)
  const hours = Array.from({ length: 13 }, (_, i) => i + 8);

  // Check if date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className={`
        relative w-full max-w-[95vw] h-[90vh] mx-4 bg-theme-card rounded-lg shadow-xl border border-theme-border
        ${isDark ? 'bg-theme-card' : 'bg-theme-card'}
        flex flex-col overflow-hidden
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-theme-border flex-shrink-0">
          <div className="flex items-center gap-4">
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-theme-text'}`}>
              {t('appointments.title') || 'Terminplanung'}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={previousWeek}
                className={`p-1.5 rounded-lg hover:bg-theme-primary-light transition-colors text-theme-text`}
                title={t('calendar.previousDay') || 'Vorherige Woche'}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={goToToday}
                className={`px-3 py-1.5 rounded-lg hover:bg-theme-primary-light transition-colors text-sm text-theme-text`}
              >
                {t('calendar.today') || 'Heute'}
              </button>
              <button
                onClick={nextWeek}
                className={`p-1.5 rounded-lg hover:bg-theme-primary-light transition-colors text-theme-text`}
                title={t('calendar.nextDay') || 'Nächste Woche'}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-theme-text-secondary'}`}>
              {weekDays[0].toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US', { day: 'numeric', month: 'short' })} - 
              {weekDays[6].toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg hover:bg-theme-primary-light transition-colors text-theme-text-secondary hover:text-theme-text`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Weekly View */}
        <div className="flex-1 overflow-auto">
          <div className="flex min-h-full">
            {/* Time Column */}
            <div className="w-16 flex-shrink-0 border-r border-theme-border">
              <div className="h-12 border-b border-theme-border"></div>
              {hours.map((hour) => (
                <div
                  key={hour}
                  className={`h-16 border-b border-theme-border flex items-start justify-end pr-2 pt-1 text-theme-text-secondary`}
                >
                  <span className="text-xs font-medium">
                    {hour.toString().padStart(2, '0')}:00
                  </span>
                </div>
              ))}
            </div>

            {/* Days Columns */}
            {weekDays.map((day, dayIndex) => {
              const dayAppointments = getAppointmentsForDay(day);
              const isTodayDate = isToday(day);
              
              return (
                <div
                  key={day.toISOString()}
                  className="flex-1 border-r border-theme-border last:border-r-0 relative"
                >
                  {/* Day Header */}
                  <div className={`
                    h-12 border-b border-theme-border flex flex-col items-center justify-center
                    ${isTodayDate ? 'bg-theme-primary-light' : ''}
                  `}>
                    <div className={`text-xs font-medium text-theme-text-secondary`}>
                      {day.toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US', { weekday: 'short' })}
                    </div>
                    <div className={`
                      text-lg font-semibold
                      ${isTodayDate ? 'text-theme-primary' : isDark ? 'text-white' : 'text-theme-text'}
                    `}>
                      {day.getDate()}
                    </div>
                  </div>

                  {/* Time Slots */}
                  <div className="relative" style={{ height: `${hours.length * 64}px` }}>
                    {hours.map((hour) => (
                      <div
                        key={hour}
                        onClick={() => handleTimeSlotClick(day, hour)}
                        className={`
                          h-16 border-b border-theme-border cursor-pointer hover:bg-theme-primary-light/20 transition-colors
                          ${isDark ? 'border-gray-700' : 'border-gray-200'}
                        `}
                      />
                    ))}

                    {/* Appointments */}
                    {dayAppointments.map((appointment) => {
                      const style = getAppointmentStyle(appointment);
                      const start = new Date(appointment.startTime);
                      const isOverlapping = dayAppointments.some(a => {
                        if (a.id === appointment.id) return false;
                        const aStart = new Date(a.startTime);
                        const aEnd = new Date(aStart.getTime() + a.duration * 60000);
                        const appStart = new Date(appointment.startTime);
                        const appEnd = new Date(appStart.getTime() + appointment.duration * 60000);
                        return (aStart < appEnd && aEnd > appStart);
                      });

                      return (
                        <div
                          key={appointment.id}
                          onClick={(e) => handleAppointmentClick(appointment, e)}
                          className={`
                            absolute left-0 right-0 mx-1 rounded-lg p-2 cursor-pointer
                            shadow-sm border-l-4 transition-all hover:shadow-md
                            ${isDark 
                              ? 'bg-theme-card border-theme-primary text-theme-text' 
                              : 'bg-theme-primary-light border-theme-primary text-theme-text'
                            }
                            ${isOverlapping ? 'opacity-90' : ''}
                          `}
                          style={{
                            top: style.top,
                            height: style.height,
                            minHeight: '40px',
                          }}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-medium mb-0.5 truncate">
                                {formatTime(appointment.startTime)}
                              </div>
                              <div className="text-sm font-semibold truncate">
                                {appointment.name}
                              </div>
                              <div className="text-xs truncate opacity-80">
                                {appointment.patientName}
                              </div>
                            </div>
                            <button
                              onClick={(e) => handleDeleteAppointment(appointment.id, e)}
                              className="p-1 rounded hover:bg-red-500/20 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                              title={t('appointments.delete') || 'Löschen'}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Appointment Form Modal */}
      {showAppointmentForm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setShowAppointmentForm(false);
              setEditingAppointment(null);
              setClickedTimeSlot(null);
            }}
          />
          <div className={`
            relative w-full max-w-md mx-4 bg-theme-card rounded-lg shadow-xl border border-theme-border
            ${isDark ? 'bg-theme-card' : 'bg-theme-card'}
            max-h-[90vh] overflow-y-auto
          `}>
            <div className="flex items-center justify-between p-4 border-b border-theme-border sticky top-0 bg-theme-card z-10">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-theme-text'}`}>
                {editingAppointment ? (t('appointments.edit') || 'Termin bearbeiten') : (t('appointments.new') || 'Neuer Termin')}
              </h3>
              <button
                onClick={() => {
                  setShowAppointmentForm(false);
                  setEditingAppointment(null);
                  setClickedTimeSlot(null);
                }}
                className={`p-1 rounded-lg hover:bg-theme-primary-light transition-colors text-theme-text-secondary hover:text-theme-text`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-white' : 'text-theme-text'}`}>
                  {t('appointments.name') || 'Termin Name'} *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark 
                      ? 'bg-theme-card border-theme-border text-theme-text' 
                      : 'bg-white border-theme-border text-theme-text'
                  } focus:outline-none focus:ring-2 focus:ring-theme-primary`}
                  placeholder={t('appointments.namePlaceholder') || 'z.B. Kontrolluntersuchung'}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-white' : 'text-theme-text'}`}>
                  {t('appointments.patientName') || 'Patientenname'} *
                </label>
                <input
                  type="text"
                  value={formData.patientName}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark 
                      ? 'bg-theme-card border-theme-border text-theme-text' 
                      : 'bg-white border-theme-border text-theme-text'
                  } focus:outline-none focus:ring-2 focus:ring-theme-primary`}
                  placeholder={t('appointments.patientNamePlaceholder') || 'Max Mustermann'}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-white' : 'text-theme-text'}`}>
                  {t('appointments.patientNumber') || 'Patientennummer'} *
                </label>
                <input
                  type="text"
                  value={formData.patientNumber}
                  onChange={(e) => setFormData({ ...formData, patientNumber: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark 
                      ? 'bg-theme-card border-theme-border text-theme-text' 
                      : 'bg-white border-theme-border text-theme-text'
                  } focus:outline-none focus:ring-2 focus:ring-theme-primary`}
                  placeholder={t('appointments.patientNumberPlaceholder') || '12345'}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-white' : 'text-theme-text'}`}>
                  {t('appointments.startTime') || 'Startzeit'} *
                </label>
                <input
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark 
                      ? 'bg-theme-card border-theme-border text-theme-text' 
                      : 'bg-white border-theme-border text-theme-text'
                  } focus:outline-none focus:ring-2 focus:ring-theme-primary`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-white' : 'text-theme-text'}`}>
                  {t('appointments.duration') || 'Dauer (Minuten)'}
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 25 })}
                  min="5"
                  max="120"
                  step="5"
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark 
                      ? 'bg-theme-card border-theme-border text-theme-text' 
                      : 'bg-white border-theme-border text-theme-text'
                  } focus:outline-none focus:ring-2 focus:ring-theme-primary`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-white' : 'text-theme-text'}`}>
                  {t('appointments.problem') || 'Problem (optional)'}
                </label>
                <textarea
                  value={formData.problem}
                  onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
                  rows={3}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark 
                      ? 'bg-theme-card border-theme-border text-theme-text' 
                      : 'bg-white border-theme-border text-theme-text'
                  } focus:outline-none focus:ring-2 focus:ring-theme-primary resize-none`}
                  placeholder={t('appointments.problemPlaceholder') || 'Kurze Beschreibung des Problems...'}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowAppointmentForm(false);
                    setEditingAppointment(null);
                    setClickedTimeSlot(null);
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                    isDark
                      ? 'border-gray-700 text-gray-300 hover:bg-gray-800'
                      : 'border-theme-border text-theme-text hover:bg-gray-50'
                  }`}
                >
                  {t('common.cancel') || 'Abbrechen'}
                </button>
                <button
                  onClick={handleSaveAppointment}
                  className="flex-1 px-4 py-2 bg-theme-primary text-white rounded-lg hover:bg-theme-primary-dark transition-colors"
                >
                  {t('common.save') || 'Speichern'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Appointment Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setAppointmentToDelete(null);
        }}
        onConfirm={handleConfirmDeleteAppointment}
        title={t('appointments.confirmDelete') || 'Termin löschen'}
        message={t('appointments.confirmDelete') || 'Möchten Sie diesen Termin wirklich löschen?'}
      />
    </div>
  );
}
