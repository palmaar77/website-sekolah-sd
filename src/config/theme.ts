/**
 * Design Tokens & Tema Terpusat (White-Label Ready)
 * 
 * Mengatur seluruh token tipografi, palet warna sekolah, border radius,
 * dan animasi dalam satu file terpusat. Untuk mengganti brand / warna sekolah klien lain,
 * cukup sesuaikan nilai di file ini.
 */

export const THEME_CONFIG = {
  // Identitas Brand Klien
  brandName: "Harapan Bangsa Theme",
  version: "1.0.0",

  // Palet Warna Utama (Sekolah Dasar Modern)
  colors: {
    // Primary: Biru Pendidikan / Edukasi Modern
    primary: {
      50: "#eff6ff",
      100: "#dbeafe",
      200: "#bfdbfe",
      300: "#93c5fd",
      400: "#60a5fa",
      500: "#3b82f6",
      600: "#2563eb",
      700: "#1d4ed8",
      800: "#1e40af",
      900: "#1e3a8a",
      950: "#172554",
    },

    // Accent: Emas / Kuning Prestasi & Keceriaan
    accent: {
      50: "#fffbeb",
      100: "#fef3c7",
      200: "#fde68a",
      300: "#fcd34d",
      400: "#fbbf24",
      500: "#f59e0b",
      600: "#d97706",
      700: "#b45309",
      800: "#92400e",
      900: "#78350f",
      950: "#451a03",
    },

    // Secondary / Sukses: Hijau Ramah Anak & Karakter
    secondary: {
      50: "#ecfdf5",
      100: "#d1fae5",
      200: "#a7f3d0",
      300: "#6ee7b7",
      400: "#34d399",
      500: "#10b981",
      600: "#059669",
      700: "#047857",
      800: "#065f46",
      900: "#064e3b",
    },

    // WhatsApp Official Brand Color
    whatsapp: {
      default: "#25D366",
      hover: "#20bd5a",
      dark: "#128C7E",
    },

    // Dark Mode Surfaces (Slate / Navy Nyaman di Mata)
    dark: {
      bg: "#0b1120",        // Background terdalam
      surface: "#111827",   // Card / container
      surfaceElevated: "#1e293b", // Popover / modal
      border: "#1f293d",
      text: "#f8fafc",
      textMuted: "#94a3b8",
    },
  },

  // Tipografi
  typography: {
    fontSans: "var(--font-jakarta), ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    headings: {
      hero: "font-black tracking-tight",
      section: "font-extrabold tracking-tight",
      card: "font-bold",
    },
  },

  // Sudut Lengkung (Border Radius)
  borderRadius: {
    sm: "0.5rem",    // 8px
    md: "0.75rem",   // 12px
    lg: "1rem",      // 16px
    xl: "1.25rem",   // 20px
    "2xl": "1.5rem", // 24px
    "3xl": "2rem",   // 32px
    full: "9999px",
  },

  // Timing & Transisi Animasi Halus
  animation: {
    durationFast: "200ms",
    durationNormal: "400ms",
    durationSlow: "600ms",
    easingDefault: "cubic-bezier(0.16, 1, 0.3, 1)", // Smooth ease-out
    sliderIntervalMs: 6000, // 6 detik per slide
  },
} as const;

export type ThemeConfig = typeof THEME_CONFIG;

