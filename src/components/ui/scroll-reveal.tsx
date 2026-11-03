"use client";

import * as React from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number; // Delay dalam milidetik (misal 100ms untuk efek bertingkat)
  direction?: "up" | "fade";
}

export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Jika pengguna memilih prefers-reduced-motion, tampilkan langsung tanpa animasi
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  const animationClass =
    direction === "up" ? "animate-fade-in-up" : "animate-fade-in";

  return (
    <div
      ref={ref}
      style={{
        animationDelay: `${delay}ms`,
        animationFillMode: "forwards",
      }}
      className={`${className} ${
        isVisible ? animationClass : "opacity-0"
      }`}
    >
      {children}
    </div>
  );
}

