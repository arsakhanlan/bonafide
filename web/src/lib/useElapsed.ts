import { useEffect, useRef, useState } from 'react';

/** 0:07, 1:05, 1:02:05 — stable width for a live timer. */
export function formatElapsed(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
  }
  return `${minutes}:${String(rest).padStart(2, '0')}`;
}

/** Seconds since `active` became true; resets when it turns false. */
export function useElapsed(active: boolean): number {
  const [seconds, setSeconds] = useState(0);
  const startedAt = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      startedAt.current = null;
      setSeconds(0);
      return;
    }

    startedAt.current = Date.now();
    const tick = () => {
      const start = startedAt.current ?? Date.now();
      setSeconds(Math.floor((Date.now() - start) / 1000));
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [active]);

  return seconds;
}
