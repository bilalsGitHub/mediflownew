"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { useToast } from "@/lib/ToastContext";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  onInterimTranscript?: (text: string) => void; // Real-time interim results
  className?: string;
  buttonSize?: "sm" | "md" | "lg";
}

// Web Speech API types
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function VoiceInput({
  onTranscript,
  onInterimTranscript,
  className = "",
  buttonSize = "md",
}: VoiceInputProps) {
  const { t, language } = useLanguage();
  const { showError } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef<string>("");

  const startRecording = async () => {
    try {
      // Check if Web Speech API is available
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognition) {
        // Use Web Speech API for real-time transcription
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;

        // Set language based on app language
        const speechLang =
          language === "de" ? "de-DE" : language === "en" ? "en-US" : "tr-TR";
        recognition.lang = speechLang;

        recognition.onresult = (event: any) => {
          let interimTranscript = "";
          let finalTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + " ";
            } else {
              interimTranscript += transcript;
            }
          }

          // Update final transcript
          if (finalTranscript) {
            finalTranscriptRef.current += finalTranscript;
            // Send final transcript immediately
            onTranscript(finalTranscript.trim());
          }

          // Send only the new interim transcript (not the full text)
          // DocumentGenerator will add it at cursor position
          if (onInterimTranscript && interimTranscript) {
            onInterimTranscript(interimTranscript);
          } else if (onInterimTranscript && !interimTranscript) {
            // Clear interim when there's no interim text
            onInterimTranscript("");
          }
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          if (event.error === "not-allowed") {
            showError(t("voiceInput.microphoneAccessFailed"));
          } else if (event.error !== "no-speech") {
            // Fallback to MediaRecorder if speech recognition fails
            startMediaRecorder();
          }
        };

        recognition.onend = () => {
          // If still recording, restart recognition
          if (isRecording) {
            try {
              recognition.start();
            } catch (e) {
              console.error("Error restarting recognition:", e);
            }
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
        setIsRecording(true);
        finalTranscriptRef.current = "";
      } else {
        // Fallback to MediaRecorder if Web Speech API not available
        startMediaRecorder();
      }
    } catch (error) {
      console.error("Error starting recording:", error);
      showError(t("voiceInput.microphoneAccessFailed"));
    }
  };

  const startMediaRecorder = async () => {
    try {
      // Optimized audio constraints for better sensitivity
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: false,
          autoGainControl: true,
          sampleRate: 48000,
          channelCount: 1,
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
        audioBitsPerSecond: 128000,
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

      mediaRecorder.start(100);
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting MediaRecorder:", error);
      showError(t("voiceInput.microphoneAccessFailed"));
    }
  };

  const stopRecording = () => {
    // Stop Web Speech API if active
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    // Stop MediaRecorder if active
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }

    setIsRecording(false);
    finalTranscriptRef.current = "";

    // Clear interim transcript
    if (onInterimTranscript) {
      onInterimTranscript("");
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

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
      showError(t("voiceInput.processingError") + " " + error.message);
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
      id="voice-input-button"
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
          ? t("voiceInput.processing")
          : isRecording
          ? t("voiceInput.stopRecording")
          : t("voiceInput.startRecording")
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
