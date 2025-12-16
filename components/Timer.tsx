'use client';

import { useEffect, useState } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface TimerProps {
  isRecording: boolean;
  onPause?: () => void;
  onResume?: () => void;
  onReset?: () => void;
}

export default function Timer({ isRecording, onPause, onResume, onReset }: TimerProps) {
  const [seconds, setSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!isRecording || isPaused) return;

    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRecording, isPaused]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePause = () => {
    setIsPaused(true);
    onPause?.();
  };

  const handleResume = () => {
    setIsPaused(false);
    onResume?.();
  };

  const handleReset = () => {
    setSeconds(0);
    setIsPaused(false);
    onReset?.();
  };

  if (!isRecording && seconds === 0) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="relative">
        {/* Gradient Background Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-200/30 to-blue-200/30 rounded-full blur-3xl scale-150" />
        
        {/* Timer Display */}
        <div className="relative bg-white rounded-full p-8 shadow-lg">
          <div className="text-6xl font-mono font-bold text-gray-800">
            {formatTime(seconds)}
          </div>
        </div>
      </div>

      {/* Status and Controls */}
      <div className="mt-6 flex flex-col items-center gap-4">
        {isPaused ? (
          <>
            <span className="text-lg font-semibold text-yellow-600">Duraklatıldı</span>
            <div className="flex gap-3">
              <button
                onClick={handleResume}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
              >
                <Play className="w-5 h-5" />
                Devam Et
              </button>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
                Sıfırla
              </button>
            </div>
          </>
        ) : isRecording ? (
          <>
            <span className="text-lg font-semibold text-green-600">Kayıt devam ediyor...</span>
            <button
              onClick={handlePause}
              className="flex items-center gap-2 px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors shadow-md"
            >
              <Pause className="w-5 h-5" />
              Duraklat
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}

