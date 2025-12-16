'use client';

import { ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect, memo } from 'react';
import { useLanguage } from '@/lib/LanguageContext';

type Status = 'not_transferred' | 'transferred' | 'completed' | 'draft' | 'approved' | 'rejected';

interface StatusBadgeProps {
  status: Status;
  onStatusChange?: (newStatus: Status) => void;
  editable?: boolean;
}

const statusConfig: Record<Status, { labelKey: string; color: string; dotColor: string }> = {
  not_transferred: {
    labelKey: 'status.not_transferred',
    color: 'text-theme-text-secondary',
    dotColor: 'bg-theme-info',
  },
  transferred: {
    labelKey: 'status.transferred',
    color: 'text-theme-text-secondary',
    dotColor: 'bg-theme-success',
  },
  completed: {
    labelKey: 'status.completed',
    color: 'text-theme-text-secondary',
    dotColor: 'bg-theme-neutral',
  },
  draft: {
    labelKey: 'status.draft',
    color: 'text-theme-text-secondary',
    dotColor: 'bg-theme-warning',
  },
  approved: {
    labelKey: 'status.approved',
    color: 'text-theme-text-secondary',
    dotColor: 'bg-theme-success',
  },
  rejected: {
    labelKey: 'status.rejected',
    color: 'text-theme-text-secondary',
    dotColor: 'bg-theme-danger',
  },
};

function StatusBadge({ status, onStatusChange, editable = false }: StatusBadgeProps) {
  console.log('🏷️ [StatusBadge] RENDER - Status:', status, '| Editable:', editable);
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const config = statusConfig[status];
  const allStatuses: Status[] = ['not_transferred', 'transferred', 'completed', 'draft', 'approved', 'rejected'];

  const handleStatusSelect = (newStatus: Status) => {
    if (onStatusChange) {
      onStatusChange(newStatus);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => editable && setIsOpen(!isOpen)}
        className={`flex items-center gap-2 ${editable ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
        disabled={!editable}
      >
        <span className={`w-2 h-2 rounded-full ${config.dotColor}`}></span>
        <span className={`text-sm ${config.color}`}>{t(config.labelKey)}</span>
        {editable && (
          <ChevronDown className={`w-4 h-4 ${config.color} transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        )}
      </button>

      {isOpen && editable && (
        <div className="absolute top-full left-0 mt-2 bg-theme-card border border-theme-border rounded-lg shadow-lg z-50 min-w-[180px]">
          {allStatuses.map((s) => {
            const sConfig = statusConfig[s];
            return (
              <button
                key={s}
                onClick={() => handleStatusSelect(s)}
                className={`w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-theme-primary-light transition-colors ${
                  s === status ? 'bg-theme-primary-light' : ''
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${sConfig.dotColor}`}></span>
                <span className={`text-sm ${sConfig.color}`}>{t(sConfig.labelKey)}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default memo(StatusBadge);
