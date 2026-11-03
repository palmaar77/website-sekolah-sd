"use client";

import * as React from "react";

interface AnimatedCounterProps {
  target: number;
  suffix?: string;
  prefix?: string;
  duration?: number; // Durasi dalam ms (default 1500ms)
  className?: string;
}

export function AnimatedCounter({
  target,
  suffix = "",
  prefix = "",
  duration = 1500,
  className = "",
}: AnimatedCounterProps) {
  const [count, setCount] = React.useState(0);
  const [hasStarted, setHasStarted] = React.useState(false);
  const containerRef = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCount(target);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [hasStarted, target]);

  React.useEffect(() => {
    if (!hasStarted) return;

    let startTime: number | null = null;
    let animationFrameId: number;

    const easeOutCubic = (x: number): number => {
      return 1 - Math.pow(1 - x, 3);
    };

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);

      setCount(Math.round(easedProgress * target));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [hasStarted, target, duration]);

  return (
    <span ref={containerRef} className={className}>
      {prefix}
      {count.toLocaleString("id-ID")}
      {suffix}
    </span>
  );
}

