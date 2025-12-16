'use client';

import { useState } from 'react';
import RecordingButton from './RecordingButton';
import { X, Loader2 } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { useTheme } from '@/lib/ThemeContext';

interface AddOrAdjustModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (text: string, action: 'add' | 'replace') => void;
  currentText?: string;
  fieldLabel?: string;
}

export default function AddOrAdjustModal({
  isOpen,
  onClose,
  onAdd,
  currentText = '',
  fieldLabel = 'Metin',
}: AddOrAdjustModalProps) {
  const { t } = useLanguage();
  const { themeId } = useTheme();
  const isDark = themeId === 'dark';
  const [step, setStep] = useState<'recording' | 'review'>('recording');
  const [transcribedText, setTranscribedText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRecordingComplete = async (blob: Blob) => {
    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('audio', blob, 'recording.webm');

      const transcribeResponse = await fetch('/api/ai/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!transcribeResponse.ok) {
        const errorData = await transcribeResponse.json().catch(() => ({}));
        throw new Error(errorData.error || t('consultation.transcriptionError'));
      }

      const { transcript } = await transcribeResponse.json();
      
      if (!transcript || transcript.trim().length === 0) {
        throw new Error(t('consultation.transcriptionEmpty'));
      }

      setTranscribedText(transcript);
      setStep('review');
    } catch (err: any) {
      console.error('Transcription error:', err);
      setError(err.message || t('consultation.errorOccurred'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAdd = () => {
    if (transcribedText.trim()) {
      // Sadece transkript edilen metni gönder, ekleme mantığı parent'ta yapılacak
      onAdd(transcribedText.trim(), 'add');
      handleClose();
    }
  };

  const handleReplace = () => {
    if (transcribedText.trim()) {
      // Transkript edilen metni direkt gönder, değiştirme mantığı parent'ta yapılacak
      onAdd(transcribedText.trim(), 'replace');
      handleClose();
    }
  };

  const handleClose = () => {
    setStep('recording');
    setTranscribedText('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-theme-card rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-theme-border">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-theme-border">
          <h2 className="text-xl font-semibold text-theme-text">
            {currentText ? t('consultation.addOrAdjustTitle') : t('consultation.addTextTitle')}
          </h2>
          <button
            onClick={handleClose}
            className="text-theme-text-secondary hover:text-theme-text transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'recording' && (
            <div className="space-y-6">
              {currentText && (
                <div>
                  <label className="block text-sm font-medium text-theme-text mb-2">
                    {t('consultation.currentField')} {fieldLabel}:
                  </label>
                  <div className="bg-theme-primary-light p-4 rounded-lg border border-theme-border max-h-40 overflow-y-auto">
                    <p className="text-sm text-theme-text whitespace-pre-wrap">{currentText}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-theme-text mb-4">
                  {currentText ? t('consultation.addOrAdjustWithVoice') : t('consultation.addWithVoice')}:
                </label>
                <div className="flex flex-col items-center justify-center py-8">
                  {isProcessing ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-12 h-12 text-theme-accent animate-spin" />
                      <p className="text-theme-text-secondary">{t('consultation.processingAudio')}</p>
                    </div>
                  ) : (
                    <RecordingButton
                      onRecordingComplete={handleRecordingComplete}
                      onRecordingStart={() => {}}
                      onReset={() => {}}
                      disabled={isProcessing}
                    />
                  )}
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  {error}
                </div>
              )}
            </div>
          )}

          {step === 'review' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-theme-text mb-2">
                  {t('consultation.transcribedText')}:
                </label>
                <textarea
                  value={transcribedText}
                  onChange={(e) => setTranscribedText(e.target.value)}
                  className={`w-full min-h-[200px] p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-transparent resize-y ${
                    isDark 
                      ? 'bg-gray-800 text-white border-gray-600 placeholder:text-gray-400' 
                      : 'bg-theme-card text-theme-text border-theme-border placeholder:text-theme-text-secondary'
                  }`}
                  placeholder={t('consultation.transcribedTextPlaceholder')}
                />
              </div>

              {currentText && (
                <div className="flex gap-3">
                  <button
                    onClick={handleAdd}
                    className="flex-1 px-4 py-2 bg-theme-accent text-white rounded-lg hover:bg-theme-accent/90 transition-colors"
                  >
                    {t('consultation.addToExisting')}
                  </button>
                  <button
                    onClick={handleReplace}
                    className="flex-1 px-4 py-2 bg-theme-primary text-white rounded-lg hover:bg-theme-primary-dark transition-colors"
                  >
                    {t('consultation.replaceExisting')}
                  </button>
                </div>
              )}

              {!currentText && (
                <button
                  onClick={handleAdd}
                  className="w-full px-4 py-2 bg-theme-accent text-white rounded-lg hover:bg-theme-accent/90 transition-colors"
                >
                  {t('consultation.add')}
                </button>
              )}

              <button
                onClick={() => setStep('recording')}
                className="w-full px-4 py-2 bg-theme-primary-light text-theme-text rounded-lg hover:bg-theme-primary-light/80 transition-colors"
              >
                {t('consultation.recordAgain')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

