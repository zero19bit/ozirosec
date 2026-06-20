import { useState, useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';

export function useLabTimer(labId: string) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const { getBestTime, saveBestTime } = useAppStore();
  const bestTime = getBestTime(labId);

  const startTimer = useCallback(() => {
    if (!isRunning) {
      setIsRunning(true);
      setIsActive(true);
      startTimeRef.current = Date.now() - elapsedSeconds * 1000;
    }
  }, [isRunning, elapsedSeconds]);

  const stopTimer = useCallback(() => {
    const hasStarted = startTimeRef.current > 0;
    const finalSeconds = hasStarted
      ? Math.max(1, Math.floor((Date.now() - startTimeRef.current) / 1000))
      : elapsedSeconds;

    setIsRunning(false);

    if (finalSeconds > 0) {
      setElapsedSeconds(finalSeconds);
      saveBestTime(labId, finalSeconds);
      return finalSeconds;
    }

    return null;
  }, [elapsedSeconds, labId, saveBestTime]);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setElapsedSeconds(0);
    setIsActive(false);
    startTimeRef.current = 0;
  }, []);

  const toggleMode = useCallback(() => {
    if (isActive) {
      resetTimer();
    } else {
      setIsActive(true);
    }
  }, [isActive, resetTimer]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return {
    elapsedSeconds,
    isRunning,
    isActive,
    bestTime,
    startTimer,
    stopTimer,
    resetTimer,
    toggleMode,
    formattedTime: formatTime(elapsedSeconds),
    formattedBestTime: bestTime !== null ? formatTime(bestTime) : null
  };
}

