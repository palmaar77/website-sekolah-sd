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
 * Format: PPDB-YYYY-XXXXX
 * Menggunakan CSPRNG (Cryptographically Secure Pseudo-Random Number Generator)
 * untuk mencegah tebakan nomor acak (OWASP A02: Cryptographic Failures)
 */
export function generateRegistrationNumber(prefix = "PPDB"): string {
  const year = new Date().getFullYear();
  let randomChars = "";
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const bytes = new Uint8Array(4);
    crypto.getRandomValues(bytes);
    randomChars = Array.from(bytes)
      .map((b) => b.toString(36))
      .join("")
      .substring(0, 5)
      .toUpperCase();
  } else {
    // Fallback yang tetap konsisten
    randomChars = Math.random().toString(36).substring(2, 7).toUpperCase();
  }

  // Pastikan panjang tepat 5 karakter
  if (randomChars.length < 5) {
    randomChars = randomChars.padEnd(5, "X");
  }

  return `${prefix}-${year}-${randomChars}`;
}

/**
 * Format angka rupiah atau angka biasa dengan pemisah ribuan
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("id-ID").format(num);
}

/**
 * Format angka rupiah dengan prefix Rp
 * Contoh: Rp 350.000
 */
export function formatRupiah(amount: number): string {
  return "Rp " + new Intl.NumberFormat("id-ID").format(amount);
}

/**
 * Konversi angka nominal ke kalimat terbilang bahasa Indonesia resmi
 * Contoh: 350000 -> "Tiga Ratus Lima Puluh Ribu Rupiah"
 */
export function terbilang(num: number): string {
  if (num === 0) return "Nol Rupiah";

  function terbilangCore(n: number): string {
    const words = [
      "",
      "Satu",
      "Dua",
      "Tiga",
      "Empat",
      "Lima",
      "Enam",
      "Tujuh",
      "Delapan",
      "Sembilan",
      "Sepuluh",
      "Sebelas",
    ];
    const val = Math.floor(Math.abs(n));
    if (val < 12) return words[val];
    if (val < 20) return (words[val - 10] + " Belas").trim();
    if (val < 100)
      return (words[Math.floor(val / 10)] + " Puluh " + terbilangCore(val % 10)).trim();
    if (val < 200) return ("Seratus " + terbilangCore(val - 100)).trim();
    if (val < 1000)
      return (words[Math.floor(val / 100)] + " Ratus " + terbilangCore(val % 100)).trim();
    if (val < 2000) return ("Seribu " + terbilangCore(val - 1000)).trim();
    if (val < 1000000)
      return (
        terbilangCore(Math.floor(val / 1000)) +
        " Ribu " +
        terbilangCore(val % 1000)
      ).trim();
    if (val < 1000000000)
      return (
        terbilangCore(Math.floor(val / 1000000)) +
        " Juta " +
        terbilangCore(val % 1000000)
      ).trim();
    if (val < 1000000000000)
      return (
        terbilangCore(Math.floor(val / 1000000000)) +
        " Miliar " +
        terbilangCore(val % 1000000000)
      ).trim();
    return String(val);
  }

  return (terbilangCore(num) + " Rupiah").replace(/\s+/g, " ");
}

/**
 * Buat nomor struk pembayaran transaksi / kasir digital
 * Contoh: STR-2026-SPP-8X92K atau STR-2026-00382
 */
export function generateStrukNumber(invoiceNumber?: string, receiptNumber?: string): string {
  if (receiptNumber) {
    return receiptNumber.replace(/^KW-/i, "STR-");
  }
  if (invoiceNumber) {
    return invoiceNumber.replace(/^INV-/i, "STR-");
  }
  const currentYear = new Date().getFullYear();
  const randomDigits = Math.floor(10000 + Math.random() * 90000);
  return `STR-${currentYear}-${randomDigits}`;
}
