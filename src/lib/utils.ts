import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Gabungkan class Tailwind secara dinamis dengan aman
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format tanggal ke format bahasa Indonesia
 * Contoh: 14 Oktober 2025
 */
export function formatDateIndo(
  date: Date | string | number | null | undefined,
  includeTime = false
): string {
  if (!date) return "-";
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "-";

  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...(includeTime
      ? {
          hour: "2-digit",
          minute: "2-digit",
        }
      : {}),
  };

  return new Intl.DateTimeFormat("id-ID", options).format(d);
}

/**
 * Format string slug yang aman untuk URL dan SEO
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Ganti spasi dengan -
    .replace(/[^\w-]+/g, "") // Hapus karakter non-word selain -
    .replace(/--+/g, "-") // Ganti double hyphens
    .replace(/^-+/, "") // Trim hyphens di awal
    .replace(/-+$/, ""); // Trim hyphens di akhir
}

/**
 * Generate nomor pendaftaran PPDB yang unik dan ramah dibaca
 * Format: PPDB-2025-XXXXX
 */
export function generateRegistrationNumber(prefix = "PPDB"): string {
  const year = new Date().getFullYear();
  const randomChars = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${prefix}-${year}-${randomChars}`;
}

/**
 * Format angka rupiah atau angka biasa dengan pemisah ribuan
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("id-ID").format(num);
}
