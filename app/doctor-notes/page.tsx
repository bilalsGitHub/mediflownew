'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import RecordingButton from '@/components/RecordingButton';
import MainLayout from '@/components/layout/MainLayout';
import { Copy, Check, Save, Loader2, Mic, FileText } from 'lucide-react';
import { useTheme } from '@/lib/ThemeContext';
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

export default function DoctorNotesPage() {
  const router = useRouter();
  const { themeId } = useTheme();
  const { t } = useLanguage();
  const isDark = themeId === 'dark';
  const [step, setStep] = useState<'recording' | 'editing'>('recording');
  const [text, setText] = useState<string>('');
  const [editedText, setEditedText] = useState<string>('');
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
    if (!text) return;
    
    setIsRewriting(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/rewrite-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, style }),
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

    // Save to localStorage for now
    const note = {
      id: Date.now().toString(),
      text: editedText,
      originalText: text,
      createdAt: new Date().toISOString(),
    };
    
    const savedNotes = JSON.parse(localStorage.getItem('doctorNotes') || '[]');
    savedNotes.push(note);
    localStorage.setItem('doctorNotes', JSON.stringify(savedNotes));
    
    // Show success and navigate
    alert('Not başarıyla kaydedildi!');
    router.push('/doctor-notes/list');
  };

  const handleReset = () => {
    setText('');
    setEditedText('');
    setStep('recording');
    setError(null);
  };

  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Doktor Notu Yaz</h1>
          <p className="text-gray-600">Ses kaydı ile not yazın ve AI ile düzenleyin</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {step === 'recording' && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex flex-col items-center justify-center min-h-[400px]">
              <h2 className="text-xl font-semibold text-gray-700 mb-8 text-center">
                Mikrofonu aktif edin ve notunuzu söyleyin
              </h2>
              <RecordingButton
                onRecordingComplete={handleRecordingComplete}
                onReset={handleReset}
                disabled={isProcessing}
              />
              {isProcessing && (
                <div className="mt-6 flex items-center gap-2 text-gray-600">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Transkript oluşturuluyor...</span>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 'editing' && (
          <div className="space-y-6">
            {/* Text Display */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <FileText className="w-6 h-6" />
                  Not Metni
                </h2>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  title="Metni kopyala"
                >
                  {copied ? (
                    <>
                      <Check className="w-5 h-5 text-green-600" />
                      <span className="text-green-600">Kopyalandı!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      <span>Kopyala</span>
                    </>
                  )}
                </button>
              </div>
              
              <textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className={`w-full p-4 border rounded-md focus:ring-2 focus:ring-theme-primary focus:border-transparent resize-y min-h-[300px] font-mono text-sm ${
                  isDark 
                    ? 'bg-gray-800 text-white border-gray-600 placeholder:text-gray-400' 
                    : 'bg-theme-card text-theme-text border-theme-border placeholder:text-theme-text-secondary'
                }`}
                placeholder={t("doctorNotes.placeholder")}
              />
              
              <div className="mt-2 text-sm text-gray-500">
                {editedText.length} karakter
              </div>
            </div>

            {/* Rewrite Options */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                AI ile Düzenle
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {REWRITE_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleRewrite(option.id)}
                    disabled={isRewriting || !text}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="font-semibold text-gray-800 mb-1">
                      {option.label}
                    </div>
                    <div className="text-sm text-gray-600">
                      {option.description}
                    </div>
                  </button>
                ))}
              </div>
              
              {isRewriting && (
                <div className="mt-4 flex items-center gap-2 text-blue-600">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Metin düzenleniyor...</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg"
              >
                <Save className="w-5 h-5" />
                Kaydet
              </button>
              
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <Mic className="w-5 h-5" />
                Yeni Kayıt
              </button>
              
              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                İptal
              </button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

