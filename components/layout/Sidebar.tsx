'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronDown, MoreVertical, User, X, Trash2 } from 'lucide-react';
import { storage, Consultation } from '@/lib/storage';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { useTheme } from '@/lib/ThemeContext';
import { useLanguage } from '@/lib/LanguageContext';
import ConfirmDialog from '@/components/ConfirmDialog';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth(); // Get user from AuthContext instead of calling getUser()
  const { themeId } = useTheme();
  const { t, language } = useLanguage();
  const [isEncountersOpen, setIsEncountersOpen] = useState(true);
  const [hoveredConsultationId, setHoveredConsultationId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [consultationToDelete, setConsultationToDelete] = useState<string | null>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isDark = themeId === 'dark';

  // Load consultations - only on mount and when user is available
  useEffect(() => {
    if (!user) {
      setConsultations([]);
      setIsLoading(false);
      return;
    }

    const loadConsultations = async () => {
      try {
        setIsLoading(true);
        // Fetch only consultation data, not nested ICD10 codes and documents
        // This reduces the request size significantly
        const { data, error } = await supabase
          .from("consultations")
          .select("id, patient_name, status, created_at, analysis")
          .eq("doctor_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching consultations:", error);
          setConsultations([]);
          return;
        }

        // Map to Consultation format (minimal data for sidebar)
        const consultations = (data || []).map((row: any) => ({
          id: row.id,
          patientName: row.patient_name || undefined,
          status: row.status || "not_transferred",
          createdAt: row.created_at,
          analysis: row.analysis || undefined,
          // Don't load ICD10 codes and documents for sidebar - not needed
          icd10Codes: undefined,
          documents: undefined,
        }));

        setConsultations(consultations);
      } catch (error) {
        console.error('Error loading consultations:', error);
        setConsultations([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadConsultations();

    // Listen for consultation updates (e.g., status changes)
    const handleConsultationUpdate = (event: CustomEvent) => {
      const { consultationId, status } = event.detail;
      // Update the specific consultation's status in the list
      setConsultations(prev => prev.map(consultation => 
        consultation.id === consultationId 
          ? { ...consultation, status }
          : consultation
      ));
    };

    window.addEventListener('consultation-updated', handleConsultationUpdate as EventListener);

    return () => {
      window.removeEventListener('consultation-updated', handleConsultationUpdate as EventListener);
    };
  }, [user?.id]); // Only reload when user ID changes (not on every render)

  // Refresh consultations only when explicitly needed (after delete)
  // Don't refresh on every pathname change - this prevents unnecessary API calls
  const refreshConsultations = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("consultations")
        .select("id, patient_name, status, created_at, analysis")
        .eq("doctor_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        const consultations = (data || []).map((row: any) => ({
          id: row.id,
          patientName: row.patient_name || undefined,
          status: row.status || "not_transferred",
          createdAt: row.created_at,
          analysis: row.analysis || undefined,
          icd10Codes: undefined,
          documents: undefined,
        }));
        setConsultations(consultations);
      }
    } catch (error) {
      console.error('Error refreshing consultations:', error);
    }
  };

  // Group consultations by date
  const groupedConsultations = consultations.reduce((acc: any, consultation) => {
    const date = new Date(consultation.createdAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let dateKey: string;
    if (date.toDateString() === today.toDateString()) {
      dateKey = t('sidebar.today');
    } else if (date.toDateString() === yesterday.toDateString()) {
      dateKey = t('sidebar.yesterday');
    } else {
      dateKey = date.toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US', { day: 'numeric', month: 'long' });
    }

    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(consultation);
    return acc;
  }, {});

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(language === 'de' ? 'de-DE' : 'en-US', { hour: '2-digit', minute: '2-digit' });
  };

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

  const getStatusTint = (status: string) => {
    switch (status) {
      case 'transferred':
      case 'approved':
        return 'bg-theme-success-light';
      case 'not_transferred':
        return 'bg-theme-info-light';
      case 'rejected':
        return 'bg-red-50 dark:bg-red-900/20';
      case 'draft':
        return 'bg-theme-warning-light';
      case 'completed':
      default:
        return '';
    }
  };

  const getStatusBorder = (status: string) => {
    switch (status) {
      case 'transferred':
      case 'approved':
        return 'border-l-2 border-theme-success';
      case 'not_transferred':
        return 'border-l-2 border-theme-info';
      case 'rejected':
        return 'border-l-2 border-theme-danger';
      case 'draft':
        return 'border-l-2 border-theme-warning';
      case 'completed':
      default:
        return 'border-l-2 border-theme-neutral';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'transferred':
        return t('status.transferred');
      case 'completed':
        return t('status.completed');
      case 'not_transferred':
        return t('status.not_transferred');
      case 'approved':
        return t('status.approved');
      case 'rejected':
        return t('status.rejected');
      case 'draft':
      default:
        return t('status.draft');
    }
  };

  const handleDeleteConsultation = (e: React.MouseEvent, consultationId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setConsultationToDelete(consultationId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!consultationToDelete) return;

    try {
      await storage.delete(consultationToDelete);

      // If we're on the deleted consultation page, redirect to another one
      if (pathname === `/consultation/${consultationToDelete}`) {
        const allConsultations = await storage.getAll();
        const sortedConsultations = allConsultations.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        if (sortedConsultations.length > 0) {
          router.push(`/consultation/${sortedConsultations[0].id}`);
        } else {
          router.push('/new-consultation');
        }
      } else {
        // Refresh consultations list (lightweight, no nested data)
        await refreshConsultations();
      }
    } catch (error) {
      console.error('Error deleting consultation:', error);
    }
    
    setDeleteDialogOpen(false);
    setConsultationToDelete(null);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-theme-card border-r border-theme-border z-50
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
          w-64 flex flex-col
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-theme-border">
          <h2 className="text-lg font-semibold text-theme-text">{t('sidebar.doctorAssistant')}</h2>
          <button
            onClick={onClose}
            className="lg:hidden p-1 hover:bg-theme-primary-light rounded"
          >
            <X className="w-5 h-5 text-theme-text" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="pt-0">
            <button
              onClick={() => setIsEncountersOpen(!isEncountersOpen)}
              className="flex items-center justify-between w-full px-3 py-2 text-theme-text hover:bg-theme-primary-light rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="font-medium">{t('sidebar.allConsultations')}</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${isEncountersOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isEncountersOpen && (
              <div className="mt-2 space-y-1 max-h-[60vh] overflow-y-auto pr-2">
                {isLoading ? (
                  <div className="ml-4 px-3 py-2 text-sm text-theme-text-secondary">
                    {t('common.loading') || 'Loading...'}
                  </div>
                ) : consultations.length === 0 ? (
                  <div className="ml-4 px-3 py-2 text-sm text-theme-text-secondary">
                    {t('sidebar.noConsultations') || 'No consultations yet'}
                  </div>
                ) : (
                  Object.entries(groupedConsultations).map(([dateKey, consultations]: [string, any]) => (
                  <div key={dateKey} className="ml-4">
                    <div className="text-xs font-semibold text-theme-text-secondary uppercase tracking-wide px-3 py-2">
                      {dateKey}
                    </div>
                    {consultations.map((consultation: any) => {
                      const isActive = pathname === `/consultation/${consultation.id}`;
                      const isHovered = hoveredConsultationId === consultation.id;
                      return (
                        <div
                          key={consultation.id}
                          className={`
                            flex items-center justify-between px-3 py-2 rounded-lg transition-colors mb-1 group
                            ${getStatusTint(consultation.status)}
                            ${getStatusBorder(consultation.status)}
                            ${isActive ? 'bg-theme-primary-light border-l-2 border-theme-primary' : 'hover:bg-theme-primary-light'}
                          `}
                          onMouseEnter={() => setHoveredConsultationId(consultation.id)}
                          onMouseLeave={() => setHoveredConsultationId(null)}
                        >
                          <Link
                            href={`/consultation/${consultation.id}`}
                            className="flex-1 min-w-0"
                            onClick={onClose}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-theme-text'}`}>
                                  {formatTime(consultation.createdAt)}
                                </span>
                                <span className={`text-xs ${isDark ? 'text-white' : 'text-theme-text-secondary'}`}>-</span>
                                <span className={`text-xs truncate ${isDark ? 'text-white' : 'text-theme-text-secondary'}`}>
                                  {consultation.patientName || consultation.analysis?.patient_complaint || t('sidebar.notSpecified')}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span
                                  className={`w-2 h-2 rounded-full ${getStatusColor(consultation.status)}`}
                                />
                                <span className={`text-xs ${isDark ? 'text-white' : 'text-theme-text-secondary'}`}>
                                  {getStatusText(consultation.status)}
                                </span>
                              </div>
                            </div>
                          </Link>
                          <button
                            onClick={(e) => handleDeleteConsultation(e, consultation.id)}
                            className={`ml-2 p-1.5 rounded transition-colors ${
                              isHovered || isActive
                                ? 'opacity-100 text-theme-danger hover:bg-theme-danger-light'
                                : 'opacity-0 group-hover:opacity-100 text-theme-danger hover:bg-theme-danger-light'
                            }`}
                            title={t('sidebar.deleteTooltip')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ))
                )}
              </div>
            )}
          </div>
        </nav>
        
        <ConfirmDialog
          isOpen={deleteDialogOpen}
          onClose={() => {
            setDeleteDialogOpen(false);
            setConsultationToDelete(null);
          }}
          onConfirm={handleConfirmDelete}
          title={t('sidebar.deleteTitle')}
          message={t('sidebar.deleteMessage')}
        />
      </aside>
    </>
  );
}

