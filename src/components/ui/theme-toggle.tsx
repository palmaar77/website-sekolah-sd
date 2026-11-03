"use client";

import * as React from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [isDark, setIsDark] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const storedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = storedTheme === "dark" || (!storedTheme && prefersDark);

    if (shouldBeDark) {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  if (!mounted) {
    return (
      <button
        type="button"
        className={`p-2 rounded-xl text-slate-400 hover:text-slate-600 transition-colors ${className}`}
        aria-label="Ubah mode tampilan"
      >
        <Moon className="h-4 w-4" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`inline-flex items-center justify-center p-2 rounded-xl text-slate-600 dark:text-amber-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all ${className}`}
      aria-label={isDark ? "Beralih ke mode terang" : "Beralih ke mode gelap"}
      title={isDark ? "Mode Terang" : "Mode Gelap"}
    >
      {isDark ? (
        <Sun className="h-4 w-4 transition-transform hover:rotate-45" />
      ) : (
        <Moon className="h-4 w-4 transition-transform hover:-rotate-12" />
      )}
    </button>
  );
}

