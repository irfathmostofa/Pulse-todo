// hooks/usePomodoro.js
import { useState, useEffect, useRef, useCallback } from "react";
import { POMODORO_PRESETS, SESSIONS_BEFORE_LONG_BREAK } from "../lib/constants";

export function usePomodoro({ onNotify } = {}) {
  const [mode, setMode] = useState("focus");
  const [durations, setDurations] = useState(POMODORO_PRESETS);
  const [secondsLeft, setSecondsLeft] = useState(POMODORO_PRESETS.focus * 60);
  const [running, setRunning] = useState(false);
  const [sessionIndex, setSessionIndex] = useState(1); // Start at 1
  const [todaySessions, setTodaySessions] = useState(0);
  const [todayFocusSeconds, setTodayFocusSeconds] = useState(0);
  const [monthSessions, setMonthSessions] = useState(0);

  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  // Create audio context for sound
  const playSound = useCallback(() => {
    try {
      // Try using AudioContext for better compatibility
      const audioContext = new (
        window.AudioContext || window.webkitAudioContext
      )();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 880;
      oscillator.type = "sine";

      // Create a beep pattern
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.5,
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);

      // Second beep
      setTimeout(() => {
        const audioContext2 = new (
          window.AudioContext || window.webkitAudioContext
        )();
        const oscillator2 = audioContext2.createOscillator();
        const gainNode2 = audioContext2.createGain();

        oscillator2.connect(gainNode2);
        gainNode2.connect(audioContext2.destination);

        oscillator2.frequency.value = 660;
        oscillator2.type = "sine";

        gainNode2.gain.setValueAtTime(0.3, audioContext2.currentTime);
        gainNode2.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext2.currentTime + 0.5,
        );

        oscillator2.start(audioContext2.currentTime);
        oscillator2.stop(audioContext2.currentTime + 0.5);
      }, 300);
    } catch (error) {
      console.warn("Could not play sound:", error);
    }
  }, []);

  const sendNotification = useCallback(
    (title, body) => {
      // First try to use the onNotify callback
      if (onNotify) {
        onNotify(title, { body });
      }

      // Also try to play sound
      playSound();
    },
    [onNotify, playSound],
  );

  const switchMode = useCallback(
    (newMode) => {
      setRunning(false);
      setMode(newMode);
      setSecondsLeft(durations[newMode] * 60);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    },
    [durations],
  );

  const start = useCallback(() => {
    if (secondsLeft <= 0) {
      setSecondsLeft(durations[mode] * 60);
    }
    setRunning(true);
  }, [secondsLeft, durations, mode]);

  const pause = useCallback(() => {
    setRunning(false);
  }, []);

  const reset = useCallback(() => {
    setRunning(false);
    setSecondsLeft(durations[mode] * 60);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [durations, mode]);

  const setCustomDuration = useCallback(
    (modeKey, minutes) => {
      const newDurations = {
        ...durations,
        [modeKey]: minutes,
      };
      setDurations(newDurations);
      if (mode === modeKey && !running) {
        setSecondsLeft(minutes * 60);
      }
    },
    [mode, running, durations],
  );

  // Main timer logic
  useEffect(() => {
    if (running && secondsLeft > 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          const newSeconds = prev - 1;

          // Check if session is complete
          if (newSeconds === 0) {
            // Session complete!
            const isFocus = mode === "focus";

            // Send notification
            const title = isFocus ? "🎉 Focus Complete!" : "☕ Break Complete!";
            const body = isFocus
              ? "Great job! Time for a break."
              : "Break is over! Ready to focus again?";

            sendNotification(title, body);

            // Update stats for focus sessions
            if (isFocus) {
              setTodaySessions((prevCount) => prevCount + 1);
              setMonthSessions((prevCount) => prevCount + 1);
              setTodayFocusSeconds(
                (prevSeconds) => prevSeconds + durations[mode] * 60,
              );
            }

            // Determine next mode
            let nextMode;
            let nextSessionIndex = sessionIndex;

            if (isFocus) {
              // After focus, check if we need a long break
              if (sessionIndex % SESSIONS_BEFORE_LONG_BREAK === 0) {
                nextMode = "long_break";
              } else {
                nextMode = "short_break";
              }
              nextSessionIndex = sessionIndex + 1;
            } else {
              // After break, go back to focus
              nextMode = "focus";
            }

            // Update state for next session
            setMode(nextMode);
            setSessionIndex(nextSessionIndex);
            setSecondsLeft(durations[nextMode] * 60);
            setRunning(false);

            // Clear interval
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }

            return 0;
          }

          // Send warning notification 10 seconds before end
          if (newSeconds === 10) {
            const isFocus = mode === "focus";
            sendNotification(
              `${isFocus ? "Focus" : "Break"} ending soon!`,
              `10 seconds remaining`,
            );
          }

          return newSeconds;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [running, secondsLeft, mode, sessionIndex, durations, sendNotification]);

  return {
    mode,
    durations,
    secondsLeft,
    running,
    sessionIndex,
    todaySessions,
    todayFocusSeconds,
    monthSessions,
    start,
    pause,
    reset,
    switchMode,
    setCustomDuration,
  };
}
