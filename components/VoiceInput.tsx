"use client";

import { useState, useRef } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  className?: string;
  buttonSize?: "sm" | "md" | "lg";
}

export default function VoiceInput({
  onTranscript,
  className = "",
  buttonSize = "md",
}: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

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

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((track) => track.stop());
        await processAudio(blob);
      };

      // Request data more frequently for better responsiveness
      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      alert("Mikrofon erişimi başarısız. Lütfen mikrofon izni verin.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (blob: Blob) => {
    setIsProcessing(true);
    try {
      // Convert to MP3 or WAV for OpenAI Whisper
      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");

      const response = await fetch("/api/ai/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Transcription failed");
      }

      const { transcript } = await response.json();
      if (transcript) {
        onTranscript(transcript);
      }
    } catch (error: any) {
      console.error("Transcription error:", error);
      alert("Ses işleme hatası: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  const iconSizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isProcessing}
      className={`${
        sizeClasses[buttonSize]
      } rounded-full flex items-center justify-center transition-all ${
        isRecording
          ? "bg-red-500 hover:bg-red-600 animate-pulse"
          : isProcessing
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-purple-600 hover:bg-purple-700"
      } text-white shadow-lg ${className}`}
      title={
        isProcessing
          ? "İşleniyor..."
          : isRecording
          ? "Kaydı durdur"
          : "Ses kaydı başlat"
      }>
      {isProcessing ? (
        <Loader2 className={`${iconSizeClasses[buttonSize]} animate-spin`} />
      ) : isRecording ? (
        <MicOff className={iconSizeClasses[buttonSize]} />
      ) : (
        <Mic className={iconSizeClasses[buttonSize]} />
      )}
    </button>
  );
}
