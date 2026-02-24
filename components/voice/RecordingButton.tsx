"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, Pause, Play, X } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

interface RecordingButtonProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  onRecordingStart?: () => void;
  onReset?: () => void;
  disabled?: boolean;
}

export default function RecordingButton({
  onRecordingComplete,
  onRecordingStart,
  onReset,
  disabled = false,
}: RecordingButtonProps) {
  const { t } = useLanguage();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isCancelledRef = useRef<boolean>(false);

  useEffect(() => {
    if (isRecording && !isPaused) {
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
  }, [isRecording, isPaused]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const startRecording = async () => {
    try {
      // Optimized audio constraints for better sensitivity
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: false, // Disable to improve sensitivity
          autoGainControl: true, // Automatically adjust gain
          sampleRate: 48000, // Higher sample rate for better quality
          channelCount: 1, // Mono recording
          // Chrome-specific optimizations (cast to any to avoid TypeScript errors)
          ...({
            googEchoCancellation: false,
            googAutoGainControl: true,
            googNoiseSuppression: false,
            googHighpassFilter: false,
            googTypingNoiseDetection: false,
          } as any),
        },
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
        audioBitsPerSecond: 128000, // Higher bitrate for better quality
      });

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      // Request data more frequently for better responsiveness
      mediaRecorder.start(100); // Collect data every 100ms

      mediaRecorder.onstop = () => {
        // Only complete recording if not cancelled
        if (!isCancelledRef.current) {
          const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
          onRecordingComplete(audioBlob);
        }
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      isCancelledRef.current = false; // Reset cancel flag
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);
      onRecordingStart?.();
    } catch (error) {
      console.error("Error starting recording:", error);
      alert(
        "Mikrofon erişimi reddedildi. Lütfen tarayıcı ayarlarından izin verin."
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    }
  };

  const handleReset = () => {
    isCancelledRef.current = true; // Mark as cancelled
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
    }
    setIsRecording(false);
    setIsPaused(false);
    setRecordingTime(0);
    chunksRef.current = [];
    onReset?.();
  };

  return (
    <div className="relative w-full min-h-[400px] flex items-center justify-center">
      {/* Timer - Top Right Corner */}
      {isRecording && (
        <div className="absolute top-8 right-8 flex flex-col items-end gap-2">
          <div className="text-4xl font-mono font-bold text-theme-text tracking-tight">
            {formatTime(recordingTime)}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <p className="text-xs text-theme-text-secondary">
              {isPaused ? t("recording.paused") : t("recording.recording")}
            </p>
          </div>
        </div>
      )}

      {/* Cancel Button - Top Right (below timer) */}
      {isRecording && (
        <button
          onClick={handleReset}
          className="absolute top-24 right-8 p-2 text-theme-text-secondary hover:text-theme-danger transition-colors"
          title={t("recording.stop") || "Kaydı iptal et"}>
          <X className="w-5 h-5" />
        </button>
      )}

      {/* CENTER: Main Record Button */}
      <div className="relative flex items-center justify-center">
        {/* Pulse animation when NOT recording */}
        {!isRecording && (
          <>
            <div className="absolute w-32 h-32 bg-theme-primary rounded-full opacity-20 animate-ping"></div>
            <div className="absolute w-28 h-28 bg-theme-primary rounded-full opacity-30 animate-pulse"></div>
          </>
        )}
        
        {/* Pulse animation when recording */}
        {isRecording && !isPaused && (
          <div className="absolute w-32 h-32 bg-red-500 rounded-full opacity-20 animate-ping"></div>
        )}
        
        {/* Sound waves when recording */}
        {isRecording && !isPaused && (
          <>
            <div className="absolute flex items-center gap-0.5 -left-16">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1 bg-red-500 rounded-full animate-sound-wave opacity-60"
                  style={{
                    height: `${8 + i * 4}px`,
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              ))}
            </div>
            <div className="absolute flex items-center gap-0.5 -right-16">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1 bg-red-500 rounded-full animate-sound-wave opacity-60"
                  style={{
                    height: `${8 + i * 4}px`,
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              ))}
            </div>
          </>
        )}

        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={disabled}
          className={`
            relative z-10 rounded-full flex items-center justify-center
            transition-all duration-300
            ${
              isRecording
                ? "w-20 h-20 bg-theme-danger hover:bg-theme-danger-hover"
                : "w-24 h-24 bg-theme-primary hover:bg-theme-primary-hover hover:scale-105 animate-gentle-pulse"
            }
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            focus:outline-none focus:ring-4 focus:ring-theme-primary/30
            shadow-2xl
          `}
          aria-label={isRecording ? "Kaydı durdur" : "Kaydı başlat"}>
          {isRecording ? (
            <Square className="w-8 h-8 text-white" fill="white" />
          ) : (
            <Mic className="w-10 h-10 text-white" />
          )}
        </button>
      </div>

      {/* BOTTOM: Pause/Resume Control */}
      {isRecording && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <button
            onClick={isPaused ? resumeRecording : pauseRecording}
            className="px-4 py-2 text-sm text-theme-text-secondary hover:text-theme-text bg-theme-card hover:bg-theme-primary-light border border-theme-border rounded-full transition-all flex items-center gap-2 shadow-md">
            {isPaused ? (
              <>
                <Play className="w-4 h-4" />
                <span>{t("recording.resume")}</span>
              </>
            ) : (
              <>
                <Pause className="w-4 h-4" />
                <span>{t("recording.pause")}</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
