'use client';

import { useState } from 'react';
import RecordingButton from './RecordingButton';
import { Copy, Check, Mic, FileText, Loader2, X } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

type RewriteStyle = 'shorter' | 'detailed' | 'clearer' | 'professional' | 'structured' | 'summary';

const REWRITE_OPTIONS: Array<{ id: RewriteStyle; label: string; description: string }> = [
  { id: 'shorter', label: 'Daha Kısa', description: 'Öz ve kısa hale getir' },
  { id: 'detailed', label: 'Daha Detaylı', description: 'Detayları genişlet' },
  { id: 'clearer', label: 'Daha Anlaşılır', description: 'Basit ve net ifadeler' },
  { id: 'professional', label: 'Profesyonel', description: 'Tıbbi not formatı' },
  { id: 'structured', label: 'Yapılandırılmış', description: 'Başlıklar ve maddeler' },
  { id: 'summary', label: 'Özet', description: 'Ana noktaları özetle' },
];

interface DoctorNoteCreatorProps {
  initialText?: string;
  onSave: (text: string) => void;
  onCancel: () => void;
}

export default function DoctorNoteCreator({ initialText = '', onSave, onCancel }: DoctorNoteCreatorProps) {
  const [step, setStep] = useState<'recording' | 'editing'>(initialText ? 'editing' : 'recording');
  const [text, setText] = useState<string>(initialText);
  const [editedText, setEditedText] = useState<string>(initialText);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        throw new Error(errorData.error || 'Transkript oluşturulamadı');
      }

      const { transcript: newTranscript } = await transcribeResponse.json();
      
      if (!newTranscript || newTranscript.trim().length === 0) {
        throw new Error('Transkript boş geldi. Lütfen ses kaydını kontrol edin.');
      }

      setText(newTranscript);
      setEditedText(newTranscript);
      setStep('editing');
    } catch (err: any) {
      console.error('Processing error:', err);
      setError(err.message || 'Bir hata oluştu');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRewrite = async (style: RewriteStyle) => {
    if (!editedText) return;
    
    setIsRewriting(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/rewrite-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: editedText, style }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Metin düzenlenemedi');
      }

      const { rewrittenText } = await response.json();
      setEditedText(rewrittenText);
    } catch (err: any) {
      console.error('Rewrite error:', err);
      setError(err.message || 'Metin düzenlenemedi');
    } finally {
      setIsRewriting(false);
    }
  };

  const handleCopy = async () => {
    if (!editedText) return;
    
    try {
      await navigator.clipboard.writeText(editedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
      setError('Kopyalama başarısız oldu');
    }
  };

  const handleSave = () => {
    if (!editedText.trim()) {
      setError('Not metni boş olamaz');
      return;
    }
    onSave(editedText);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6 border-2 border-purple-200">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Mic className="w-6 h-6 text-purple-600" />
          Doktor Notu Oluştur
        </h2>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          title="Kapat"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {step === 'recording' && (
        <div className="flex flex-col items-center justify-center py-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-6 text-center">
            Mikrofonu aktif edin ve notunuzu söyleyin
          </h3>
          <RecordingButton
            onRecordingComplete={handleRecordingComplete}
            onReset={() => {
              setText('');
              setEditedText('');
              setStep('recording');
            }}
            disabled={isProcessing}
          />
          {isProcessing && (
            <div className="mt-6 flex items-center gap-2 text-gray-600">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Transkript oluşturuluyor...</span>
            </div>
          )}
        </div>
      )}

      {step === 'editing' && (
        <div className="space-y-6">
          {/* Text Display */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Not Metni
              </h3>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors text-sm"
                title="Metni kopyala"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-green-600">Kopyalandı!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Kopyala</span>
                  </>
                )}
              </button>
            </div>
            
            <textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-y min-h-[200px]"
              placeholder={t("doctorNotes.placeholder")}
            />
            
            <div className="mt-2 text-sm text-gray-500">
              {editedText.length} karakter
            </div>
          </div>

          {/* Rewrite Options */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              AI ile Düzenle
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {REWRITE_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleRewrite(option.id)}
                  disabled={isRewriting || !editedText}
                  className="p-3 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="font-semibold text-gray-800 mb-1 text-sm">
                    {option.label}
                  </div>
                  <div className="text-xs text-gray-600">
                    {option.description}
                  </div>
                </button>
              ))}
            </div>
            
            {isRewriting && (
              <div className="mt-4 flex items-center gap-2 text-purple-600">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Metin düzenleniyor...</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4 border-t">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              <Check className="w-5 h-5" />
              Kaydet ve Kullan
            </button>
            
            <button
              onClick={() => {
                setText('');
                setEditedText('');
                setStep('recording');
              }}
              className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              <Mic className="w-5 h-5" />
              Yeni Kayıt
            </button>
            
            <button
              onClick={onCancel}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              İptal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

