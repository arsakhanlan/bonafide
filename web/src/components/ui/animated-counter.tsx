import React, { useEffect, useState, useRef } from 'react';
import { formatINR } from '@/lib/utils';

interface AnimatedCounterProps {
  value: number;
  formatter?: (val: number) => string;
  duration?: number;
  className?: string;
}

export function AnimatedCounter({
  value,
  formatter = formatINR,
  duration = 750,
  className = '',
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState<number>(value);
  const prevValueRef = useRef<number>(value);
  const startTimeRef = useRef<number | null>(null);
  const startValueRef = useRef<number>(value);
  const targetValueRef = useRef<number>(value);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    startValueRef.current = prevValueRef.current;
    targetValueRef.current = value;
    startTimeRef.current = null;

    // Easing function: easeOutExpo
    const easeOutExpo = (x: number): number => {
      return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
    };

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);
      const easedProgress = easeOutExpo(progress);

      const current = Math.round(
        startValueRef.current + (targetValueRef.current - startValueRef.current) * easedProgress
      );
      setDisplayValue(current);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(targetValueRef.current);
        prevValueRef.current = targetValueRef.current;
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [value, duration]);

  return <span className={`num-tabular font-mono ${className}`}>{formatter(displayValue)}</span>;
}

