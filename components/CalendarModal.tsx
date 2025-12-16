'use client';

import { useState, useEffect, useMemo } from 'react';
import { X, ChevronLeft, ChevronRight, Calendar as CalendarIcon, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { useTheme } from '@/lib/ThemeContext';
import { storage, Consultation } from '@/lib/storage';
import { useRouter } from 'next/navigation';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DayConsultations {
  date: Date;
  consultations: Consultation[];
}

export default function CalendarModal({ isOpen, onClose }: CalendarModalProps) {
  const { t, language } = useLanguage();
  const { themeId } = useTheme();
  const isDark = themeId === 'dark';
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);

  // Load consultations
  useEffect(() => {
    const loadConsultations = async () => {
      if (isOpen) {
        try {
          const allConsultations = await storage.getAll();
          setConsultations(allConsultations);
        } catch (error) {
          console.error("Error loading consultations:", error);
          setConsultations([]);
        }
      }
    };
    loadConsultations();
  }, [isOpen]);

  // Group consultations by date
  const consultationsByDate = useMemo(() => {
    const grouped: Map<string, Consultation[]> = new Map();

    consultations.forEach((consultation) => {
      // Use createdAt or updatedAt as fallback
      const dateString = consultation.createdAt || consultation.updatedAt;
      if (!dateString) return;
      
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) return;
      
      // Use local date to avoid timezone issues
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`; // YYYY-MM-DD (local time)

      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(consultation);
    });

    return grouped;
  }, [consultations]);

  // Get consultations for a specific date
  const getConsultationsForDate = (date: Date): Consultation[] => {
    // Use local date to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;
    return consultationsByDate.get(dateKey) || [];
  };

  // Calendar helpers
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  // Navigate months
  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Navigate days
  const previousDay = () => {
    if (!selectedDate) {
      // If no date selected, start from today
      const today = new Date();
      today.setDate(today.getDate() - 1);
      setSelectedDate(today);
      // Update month if needed
      if (today.getMonth() !== currentMonth.getMonth() || today.getFullYear() !== currentMonth.getFullYear()) {
        setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
      }
    } else {
      const prevDay = new Date(selectedDate);
      prevDay.setDate(prevDay.getDate() - 1);
      setSelectedDate(prevDay);
      setSelectedConsultation(null);
      // Update month if needed
      if (prevDay.getMonth() !== currentMonth.getMonth() || prevDay.getFullYear() !== currentMonth.getFullYear()) {
        setCurrentMonth(new Date(prevDay.getFullYear(), prevDay.getMonth(), 1));
      }
    }
  };

  const nextDay = () => {
    if (!selectedDate) {
      // If no date selected, start from today
      const today = new Date();
      today.setDate(today.getDate() + 1);
      setSelectedDate(today);
      // Update month if needed
      if (today.getMonth() !== currentMonth.getMonth() || today.getFullYear() !== currentMonth.getFullYear()) {
        setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
      }
    } else {
      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);
      setSelectedDate(nextDay);
      setSelectedConsultation(null);
      // Update month if needed
      if (nextDay.getMonth() !== currentMonth.getMonth() || nextDay.getFullYear() !== currentMonth.getFullYear()) {
        setCurrentMonth(new Date(nextDay.getFullYear(), nextDay.getMonth(), 1));
      }
    }
  };

  const goToToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setSelectedConsultation(null);
    // Update month if needed
    if (today.getMonth() !== currentMonth.getMonth() || today.getFullYear() !== currentMonth.getFullYear()) {
      setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    }
  };

  // Get month name - support all languages
  const monthNames = useMemo(() => {
    if (language === 'de') {
      return ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
    } else if (language === 'tr') {
      return ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    } else {
      return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    }
  }, [language]);

  const dayNames = useMemo(() => {
    if (language === 'de') {
      return ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    } else if (language === 'tr') {
      return ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
    } else {
      return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    }
  }, [language]);

  // Handle date click
  const handleDateClick = (date: Date) => {
    const dayConsultations = getConsultationsForDate(date);
    setSelectedDate(date);
    if (dayConsultations.length === 1) {
      setSelectedConsultation(dayConsultations[0]);
    } else {
      setSelectedConsultation(null);
    }
  };

  // Handle consultation click
  const handleConsultationClick = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
  };

  // Check if date has consultations
  const hasConsultations = (date: Date): boolean => {
    return getConsultationsForDate(date).length > 0;
  };

  // Check if date is today
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Check if date is selected
  const isSelected = (date: Date): boolean => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  // Render calendar days
  const renderCalendarDays = () => {
    const days = [];
    
    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(
        <div key={`empty-${i}`} className="aspect-square" />
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const hasConsults = hasConsultations(date);
      const isTodayDate = isToday(date);
      const isSelectedDate = isSelected(date);
      const consultCount = getConsultationsForDate(date).length;

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(date)}
          className={`
            aspect-square p-1 rounded-lg transition-all relative cursor-pointer
            ${isSelectedDate 
              ? 'bg-theme-primary text-white' 
              : isTodayDate
              ? 'bg-theme-accent-light text-theme-text font-semibold hover:bg-theme-accent-light/80'
              : hasConsults
              ? 'bg-theme-primary-light hover:bg-theme-primary-light/80 text-theme-text'
              : isDark
              ? 'hover:bg-theme-primary-light text-theme-text'
              : 'hover:bg-theme-primary-light text-theme-text'
            }
          `}
        >
          <div className="text-sm font-medium">{day}</div>
          {hasConsults && (
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
              <div className={`
                w-1.5 h-1.5 rounded-full
                ${isSelectedDate ? 'bg-white' : 'bg-theme-primary'}
              `} />
            </div>
          )}
          {consultCount > 1 && (
            <div className={`
              absolute top-0.5 right-0.5 text-xs font-bold
              ${isSelectedDate ? 'text-white' : 'text-theme-primary'}
            `}>
              {consultCount}
            </div>
          )}
        </button>
      );
    }

    return days;
  };

  // Get selected date consultations
  const selectedDateConsultations = selectedDate 
    ? getConsultationsForDate(selectedDate)
    : [];

  // Status helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'transferred':
        return 'bg-theme-success';
      case 'completed':
        return 'bg-theme-neutral';
      case 'not_transferred':
        return 'bg-theme-info';
      case 'approved':
        return 'bg-theme-success';
      case 'rejected':
        return 'bg-theme-danger';
      case 'draft':
      default:
        return 'bg-theme-warning';
    }
  };

  const getStatusText = (status: string) => {
    // Use translation system for status texts
    const statusKey = `status.${status}` as keyof typeof t;
    const translated = t(statusKey as any);
    if (translated && translated !== statusKey) {
      return translated;
    }
    // Fallback to hardcoded translations if translation not found
    switch (status) {
      case 'transferred':
        return language === 'de' ? 'Übertragen' : language === 'tr' ? 'Transfer Edildi' : 'Transferred';
      case 'completed':
        return language === 'de' ? 'Abgeschlossen' : language === 'tr' ? 'Tamamlandı' : 'Completed';
      case 'not_transferred':
        return language === 'de' ? 'Nicht übertragen' : language === 'tr' ? 'Transfer Edilmedi' : 'Not transferred';
      case 'approved':
        return language === 'de' ? 'Genehmigt' : language === 'tr' ? 'Onaylandı' : 'Approved';
      case 'rejected':
        return language === 'de' ? 'Abgelehnt' : language === 'tr' ? 'Reddedildi' : 'Rejected';
      case 'draft':
      default:
        return language === 'de' ? 'Entwurf' : language === 'tr' ? 'Taslak' : 'Draft';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`
        relative w-full max-w-6xl mx-4 max-h-[90vh] overflow-hidden
        ${isDark ? 'bg-theme-card' : 'bg-theme-card'} rounded-lg shadow-xl border border-theme-border
        flex flex-col
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-theme-border">
          <div className="flex items-center gap-3">
            <CalendarIcon className={`w-5 h-5 ${isDark ? 'text-white' : 'text-theme-text'}`} />
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-theme-text'}`}>
              {t('calendar.title') || 'Kalender'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg hover:bg-theme-primary-light transition-colors ${isDark ? 'text-theme-text-secondary hover:text-theme-text' : 'text-theme-text-secondary hover:text-theme-text'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Calendar Section */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={previousMonth}
                className={`p-2 rounded-lg hover:bg-theme-primary-light transition-colors text-theme-text`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-theme-text'}`}>
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h3>
              <button
                onClick={nextMonth}
                className={`p-2 rounded-lg hover:bg-theme-primary-light transition-colors text-theme-text`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Day Names */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map((day) => (
                <div
                  key={day}
                  className={`text-center text-xs font-medium py-2 text-theme-text-secondary`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {renderCalendarDays()}
            </div>
          </div>

          {/* Patients List Section */}
          <div className={`
            w-80 border-l border-theme-border overflow-y-auto
            ${isDark ? 'bg-theme-card' : 'bg-theme-primary-light'}
          `}>
            {selectedDate ? (
              <div className="p-4">
                {/* Date Navigation */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`text-sm font-medium text-theme-text-secondary`}>
                      {t('calendar.selectedDate') || 'Ausgewähltes Datum'}
                    </h3>
                    <button
                      onClick={goToToday}
                      className={`text-xs px-2 py-1 rounded transition-colors ${isDark ? 'bg-theme-card border border-theme-border hover:bg-theme-primary-light text-theme-text' : 'bg-theme-primary-light hover:bg-theme-primary-light/80 text-theme-text'}`}
                    >
                      {t('calendar.today') || 'Heute'}
                    </button>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <button
                      onClick={previousDay}
                      className={`p-1.5 rounded-lg hover:bg-theme-primary-light transition-colors ${isDark ? 'text-gray-300 hover:text-white' : 'text-theme-text'}`}
                      title={t('calendar.previousDay') || 'Vorheriger Tag'}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-theme-text'}`}>
                      {selectedDate.toLocaleDateString(
                        language === 'de' ? 'de-DE' : language === 'tr' ? 'tr-TR' : 'en-US',
                        {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        }
                      )}
                    </p>
                    <button
                      onClick={nextDay}
                      className={`p-1.5 rounded-lg hover:bg-theme-primary-light transition-colors ${isDark ? 'text-gray-300 hover:text-white' : 'text-theme-text'}`}
                      title={t('calendar.nextDay') || 'Nächster Tag'}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {selectedDateConsultations.length > 0 ? (
                  <div className="space-y-2">
                    {selectedDateConsultations.map((consultation) => (
                      <button
                        key={consultation.id}
                        onClick={() => handleConsultationClick(consultation)}
                        className={`
                          w-full text-left p-3 rounded-lg transition-colors
                          ${selectedConsultation?.id === consultation.id
                            ? 'bg-theme-primary text-white'
                            : isDark
                            ? 'bg-theme-card border border-theme-border hover:bg-theme-primary-light text-theme-text'
                            : 'bg-theme-card hover:bg-theme-primary-light text-theme-text border border-theme-border'
                          }
                        `}
                      >
                        <div className="font-medium">
                          {consultation.patientName || t('calendar.unnamedPatient') || 'Unbenannter Patient'}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`w-2 h-2 rounded-full ${getStatusColor(consultation.status || 'draft')}`} />
                          <span className={`text-xs ${selectedConsultation?.id === consultation.id ? 'text-white/80' : isDark ? 'text-gray-400' : 'text-theme-text-secondary'}`}>
                            {getStatusText(consultation.status || 'draft')}
                          </span>
                        </div>
                        {consultation.analysis?.patient_complaint && (
                          <div className={`text-xs mt-1 ${selectedConsultation?.id === consultation.id ? 'text-white/80' : isDark ? 'text-gray-400' : 'text-theme-text-secondary'}`}>
                            {consultation.analysis.patient_complaint}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-theme-text-secondary'}`}>
                    {t('calendar.noPatients') || 'Keine Patienten an diesem Tag'}
                  </p>
                )}
              </div>
            ) : (
              <div className="p-4">
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-theme-text-secondary'}`}>
                  {t('calendar.selectDate') || 'Wählen Sie ein Datum aus, um Patienten zu sehen'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Patient Detail Popup */}
      {selectedConsultation && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedConsultation(null)}
          />
          <div className={`
            relative w-full max-w-2xl mx-4 bg-theme-card rounded-lg shadow-xl border border-theme-border
            ${isDark ? 'bg-gray-900' : 'bg-white'}
          `}>
            {/* Popup Header */}
            <div className="flex items-center justify-between p-4 border-b border-theme-border">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-theme-text'}`}>
                {selectedConsultation.patientName || t('calendar.unnamedPatient') || 'Unbenannter Patient'}
              </h3>
              <button
                onClick={() => setSelectedConsultation(null)}
                className={`p-1 rounded-lg hover:bg-theme-primary-light transition-colors ${isDark ? 'text-theme-text-secondary hover:text-theme-text' : 'text-theme-text-secondary hover:text-theme-text'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Popup Content */}
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {/* Status */}
              {selectedConsultation.status && (
                <div>
                  <h4 className={`text-sm font-semibold mb-2 ${isDark ? 'text-white' : 'text-theme-text'}`}>
                    {t('calendar.status') || 'Status'}
                  </h4>
                  <div className={`flex items-center gap-2 p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-theme-primary-light'}`}>
                    <span className={`w-2 h-2 rounded-full ${getStatusColor(selectedConsultation.status)}`} />
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-theme-text'}`}>
                      {getStatusText(selectedConsultation.status)}
                    </span>
                  </div>
                </div>
              )}

              {/* Symptoms */}
              {selectedConsultation.analysis?.symptoms && selectedConsultation.analysis.symptoms.length > 0 && (
                <div>
                  <h4 className={`text-sm font-semibold mb-2 ${isDark ? 'text-white' : 'text-theme-text'}`}>
                    {t('calendar.symptoms') || 'Symptome'}
                  </h4>
                  <div className={`
                    p-3 rounded-lg
                    ${isDark ? 'bg-gray-800' : 'bg-theme-primary-light'}
                  `}>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedConsultation.analysis.symptoms.map((symptom, index) => (
                        <li key={index} className={`text-sm ${isDark ? 'text-gray-300' : 'text-theme-text'}`}>
                          {symptom}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Patient Complaint */}
              {selectedConsultation.analysis?.patient_complaint && (
                <div>
                  <h4 className={`text-sm font-semibold mb-2 ${isDark ? 'text-white' : 'text-theme-text'}`}>
                    {t('calendar.complaint') || 'Beschwerde'}
                  </h4>
                  <div className={`
                    p-3 rounded-lg
                    ${isDark ? 'bg-gray-800' : 'bg-theme-primary-light'}
                  `}>
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-theme-text'}`}>
                      {selectedConsultation.analysis.patient_complaint}
                    </p>
                  </div>
                </div>
              )}

              {/* Doctor Recommendations */}
              {selectedConsultation.analysis?.doctor_notes_draft && (
                <div>
                  <h4 className={`text-sm font-semibold mb-2 ${isDark ? 'text-white' : 'text-theme-text'}`}>
                    {t('calendar.recommendations') || 'Empfehlungen'}
                  </h4>
                  <div className={`
                    p-3 rounded-lg
                    ${isDark ? 'bg-gray-800' : 'bg-theme-primary-light'}
                  `}>
                    <p className={`text-sm whitespace-pre-wrap ${isDark ? 'text-gray-300' : 'text-theme-text'}`}>
                      {selectedConsultation.analysis.doctor_notes_draft}
                    </p>
                  </div>
                </div>
              )}

              {/* No data message */}
              {!selectedConsultation.analysis?.symptoms?.length && 
               !selectedConsultation.analysis?.patient_complaint && 
               !selectedConsultation.analysis?.doctor_notes_draft && (
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-theme-text-secondary'}`}>
                  {t('calendar.noData') || 'Keine Daten verfügbar'}
                </p>
              )}
            </div>

            {/* Popup Footer */}
            <div className="p-4 border-t border-theme-border flex justify-end">
              <button
                onClick={() => {
                  router.push(`/consultation/${selectedConsultation.id}`);
                  onClose();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-theme-primary text-white rounded-lg hover:bg-theme-primary-dark transition-colors"
              >
                <span>{t('calendar.goToDetails') || 'Zu Details'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

