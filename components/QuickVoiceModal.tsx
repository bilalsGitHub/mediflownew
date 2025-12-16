'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Mic, Square, Copy, Check, Loader2 } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { useTheme } from '@/lib/ThemeContext';

interface QuickVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickVoiceModal({ isOpen, onClose }: QuickVoiceModalProps) {
  const { t, language } = useLanguage();
  const { themeId } = useTheme();
  const isDark = themeId === 'dark';
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isCancelledRef = useRef<boolean>(false);

  useEffect(() => {
    if (isRecording && !isProcessing) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording, isProcessing]);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      handleReset();
    }
  }, [isOpen]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: false,
          autoGainControl: true,
          sampleRate: 48000,
          channelCount: 1,
        },
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
        audioBitsPerSecond: 128000,
      });

      chunksRef.current = [];
      isCancelledRef.current = false;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        if (!isCancelledRef.current) {
          const blob = new Blob(chunksRef.current, { type: "audio/webm" });
          await processAudio(blob);
        }
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(100);
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setRecordingTime(0);
      setTranscript('');
    } catch (error) {
      console.error("Error starting recording:", error);
      alert("Mikrofon erişimi reddedildi. Lütfen tarayıcı ayarlarından izin verin.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleReset = () => {
    isCancelledRef.current = true;
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
    }
    setIsRecording(false);
    setRecordingTime(0);
    setTranscript('');
    chunksRef.current = [];
    setCopied(false);
  };

  const processAudio = async (blob: Blob) => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('audio', blob, 'recording.webm');
      formData.append('language', language);

      const response = await fetch('/api/ai/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Transkript oluşturulamadı');
      }

      const { transcript: newTranscript } = await response.json();
      if (newTranscript) {
        setTranscript(newTranscript);
      }
    } catch (error: any) {
      console.error('Transcription error:', error);
      alert('Ses işleme hatası: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = async () => {
    if (transcript) {
      await navigator.clipboard.writeText(transcript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
      <div className={`relative w-full max-w-2xl mx-4 bg-theme-card rounded-lg shadow-xl border border-theme-border ${isDark ? 'bg-theme-card' : 'bg-theme-card'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-theme-border">
          <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-theme-text'}`}>
            {t('quickVoice.title') || 'Schnelle Spracherkennung'}
          </h2>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg hover:bg-theme-primary-light transition-colors ${isDark ? 'text-gray-300 hover:text-white' : 'text-theme-text-secondary hover:text-theme-text'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Recording Section */}
          {!transcript && (
            <div className="flex flex-col items-center gap-6 py-8">
              {/* Timer */}
              {isRecording && (
                <div className="text-4xl font-mono font-bold text-theme-text">
                  {formatTime(recordingTime)}
                </div>
              )}

              {/* Status */}
              {isProcessing ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 text-theme-primary animate-spin" />
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-theme-text-secondary'}`}>
                    {t('quickVoice.processing') || 'Wird verarbeitet...'}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isProcessing}
                    className={`
                      w-16 h-16 rounded-full flex items-center justify-center
                      transition-all duration-200 shadow-lg
                      ${
                        isRecording
                          ? "bg-red-500 hover:bg-red-600"
                          : "bg-theme-primary hover:bg-theme-primary-dark"
                      }
                      ${isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-primary
                    `}
                  >
                    {isRecording ? (
                      <Square className="w-6 h-6 text-white" fill="white" />
                    ) : (
                      <Mic className="w-6 h-6 text-white" />
                    )}
                  </button>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-theme-text-secondary'}`}>
                    {isRecording 
                      ? (t('quickVoice.recording') || 'Aufnahme läuft...')
                      : (t('quickVoice.clickToStart') || 'Klicken Sie, um die Aufnahme zu starten')
                    }
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Transcript Section */}
          {transcript && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className={`text-sm font-medium ${isDark ? 'text-white' : 'text-theme-text'}`}>
                  {t('quickVoice.transcript') || 'Transkript'}
                </h3>
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    copied
                      ? 'bg-theme-accent text-white'
                      : isDark
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-theme-primary-light text-theme-text hover:bg-theme-primary-light/80'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{t('common.copied') || 'Kopiert'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>{t('common.copy') || 'Kopieren'}</span>
                    </>
                  )}
                </button>
              </div>
              <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-theme-primary-light border-theme-border'}`}>
                <p className={`whitespace-pre-wrap ${isDark ? 'text-white' : 'text-theme-text'}`}>
                  {transcript}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                    isDark
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-theme-primary-light text-theme-text hover:bg-theme-primary-light/80'
                  }`}
                >
                  {t('quickVoice.newRecording') || 'Neue Aufnahme'}
                </button>
                <button
                  onClick={onClose}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                    isDark
                      ? 'bg-theme-primary text-white hover:bg-theme-primary-dark'
                      : 'bg-theme-primary text-white hover:bg-theme-primary-dark'
                  }`}
                >
                  {t('common.close') || 'Schließen'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

