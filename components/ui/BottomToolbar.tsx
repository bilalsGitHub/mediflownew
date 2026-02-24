'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, Mic, Copy, RotateCcw, FileText, Loader2 } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

interface BottomToolbarProps {
  onTemplateChange?: (template: string) => void;
  onAddEntry?: () => void;
  onAddOrAdjust?: () => void;
  onCopyNote?: () => void;
  onRegenerate?: () => void;
  currentTemplate?: string;
  noteContent?: string;
  isRegenerating?: boolean;
  isTemplateChanging?: boolean;
}

const templates = [
  { id: 'kurzdokumentation', label: 'Kurzdokumentation' },
  { id: 'dokumentation', label: 'Dokumentation' },
  { id: 'standard', label: 'Standard' },
];

export default function BottomToolbar({
  onTemplateChange,
  onAddEntry,
  onAddOrAdjust,
  onCopyNote,
  onRegenerate,
  currentTemplate = 'dokumentation',
  noteContent = '',
  isRegenerating = false,
  isTemplateChanging = false,
}: BottomToolbarProps) {
  const { t } = useLanguage();
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const templateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (templateRef.current && !templateRef.current.contains(event.target as Node)) {
        setIsTemplateOpen(false);
      }
    };

    if (isTemplateOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTemplateOpen]);

  const selectedTemplate = templates.find(t => t.id === currentTemplate) || templates[1];

  const handleCopyNote = () => {
    if (noteContent) {
      navigator.clipboard.writeText(noteContent);
    }
    if (onCopyNote) {
      onCopyNote();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-theme-card border-t border-theme-border px-6 py-3 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left Side - Template Selector */}
        <div className="relative" ref={templateRef}>
          <div className="relative">
            <button
              onClick={() => !isTemplateChanging && setIsTemplateOpen(!isTemplateOpen)}
              disabled={isTemplateChanging}
              className={`flex items-center gap-2 px-4 py-2 text-sm text-theme-text hover:bg-theme-primary-light rounded-lg transition-all ${
                isTemplateChanging ? 'opacity-50 cursor-not-allowed blur-sm' : ''
              }`}
            >
              <span>{t('consultation.template')}:</span>
              <span className="font-medium">{selectedTemplate.label}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isTemplateOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Loading Overlay */}
            {isTemplateChanging && (
              <div className="absolute inset-0 flex items-center justify-center bg-theme-card bg-opacity-90 rounded-lg z-10">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-5 h-5 text-theme-primary animate-spin" />
                  <span className="text-xs text-theme-text-secondary font-medium">{t('consultation.templateChanging')}</span>
                </div>
              </div>
            )}
          </div>

          {isTemplateOpen && (
            <div className="absolute bottom-full left-0 mb-2 bg-theme-card border border-theme-border rounded-lg shadow-lg min-w-[200px] z-50">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => {
                    if (onTemplateChange) {
                      onTemplateChange(template.id);
                    }
                    setIsTemplateOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-theme-primary-light transition-colors ${
                    currentTemplate === template.id ? 'bg-theme-primary-light font-medium text-theme-text' : 'text-theme-text'
                  }`}
                >
                  {template.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side - Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Regenerate Button */}
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              disabled={isRegenerating}
              className="p-2 text-theme-text-secondary hover:text-theme-text hover:bg-theme-primary-light rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={t('consultation.regenerate')}
            >
              {isRegenerating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <RotateCcw className="w-5 h-5" />
              )}
            </button>
          )}

          {/* Add Entry Button */}
          {onAddEntry && (
            <button
              onClick={onAddEntry}
              className="flex items-center gap-2 px-4 py-2 text-sm text-theme-text hover:bg-theme-primary-light rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{t('consultation.addEntry')}</span>
            </button>
          )}

          {/* Add or Adjust Button */}
          {onAddOrAdjust && (
            <button
              onClick={onAddOrAdjust}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-theme-accent text-white hover:bg-theme-accent/90 rounded-lg transition-colors"
            >
              <Mic className="w-4 h-4" />
              <span>{t('consultation.addOrAdjust')}</span>
            </button>
          )}

          {/* Copy Note Button */}
          {onCopyNote && (
            <button
              onClick={handleCopyNote}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-theme-text text-white hover:bg-theme-text/90 rounded-lg transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>{t('consultation.copyNote')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

