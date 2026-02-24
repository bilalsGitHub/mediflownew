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
    <div className="relative flex flex-col items-center gap-8 py-8">
      {/* Cancel Button - Top Right */}
      {isRecording && (
        <button
          onClick={handleReset}
          className="absolute top-0 right-0 p-2 text-theme-text-secondary hover:text-theme-text transition-colors"
          title={t("recording.stop") || "Kaydı iptal et"}>
          <X className="w-5 h-5" />
        </button>
      )}

      {/* TOP SECTION: Status & Timer - Main Focus */}
      <div className="flex flex-col items-center gap-3">
        {isRecording ? (
          <>
            {/* Large Timer - Main Focus */}
            <div className="text-6xl font-mono font-bold text-theme-text tracking-tight">
              {formatTime(recordingTime)}
            </div>
            {/* Simple Status Indicator */}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <p className="text-sm text-theme-text-secondary">
                {isPaused ? t("recording.paused") : t("recording.recording")}
              </p>
            </div>
          </>
        ) : (
          <p className="text-sm text-theme-text-secondary cursor-pointer">
            {t("recording.activateMicrophone")}
          </p>
        )}
      </div>

      {/* MIDDLE SECTION: Main Record Button - Simplified */}
      <div className="relative flex items-center justify-center">
        {/* Single subtle ring when recording */}
        {isRecording && !isPaused && (
          <div className="absolute w-16 h-16 bg-red-500 rounded-full opacity-20 animate-ping"></div>
        )}
        
        {/* Minimal sound wave - only when recording */}
        {isRecording && !isPaused && (
          <div className="absolute flex items-center gap-0.5 -left-12">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-0.5 bg-red-500 rounded-full animate-sound-wave"
                style={{
                  height: `${6 + i * 2}px`,
                  animationDelay: `${i * 0.15}s`,
                }}
              />
            ))}
          </div>
        )}

        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={disabled}
          className={`
            relative z-10 w-14 h-14 rounded-full flex items-center justify-center
            transition-all duration-200
            ${
              isRecording
                ? "bg-red-500 hover:bg-red-600"
                : "bg-theme-primary hover:bg-theme-primary-dark"
            }
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-primary
            shadow-lg
          `}
          aria-label={isRecording ? "Kaydı durdur" : "Kaydı başlat"}>
          {isRecording ? (
            <Square className="w-5 h-5 text-white" fill="white" />
          ) : (
            <Mic className="w-5 h-5 text-white" />
          )}
        </button>

        {/* Minimal sound wave on the right */}
        {isRecording && !isPaused && (
          <div className="absolute flex items-center gap-0.5 -right-12">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-0.5 bg-red-500 rounded-full animate-sound-wave"
                style={{
                  height: `${6 + i * 2}px`,
                  animationDelay: `${i * 0.15}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* BOTTOM SECTION: Controls - Subtle */}
      {isRecording && (
        <div className="flex items-center gap-3">
          <button
            onClick={isPaused ? resumeRecording : pauseRecording}
            className="px-3 py-1.5 text-xs text-theme-text-secondary hover:text-theme-text transition-colors flex items-center gap-1.5">
            {isPaused ? (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>{t("recording.resume")}</span>
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>{t("recording.pause")}</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
