/**
 * OWASP Top 10 Sanitization & Protection Utilities
 * Menerapkan mitigasi terhadap:
 * - A03: Injection & Stored/Reflected XSS (CWE-79)
 * - Anti-CSV Formula Injection / Spreadsheet Injection (CWE-1236)
 * - Perlindungan Data Pribadi / Masking Sensitif (UU PDP / GDPR / PII)
 */

/**
 * Karakter berbahaya yang digunakan dalam eksekusi formula spreadsheet:
 * '=', '+', '-', '@', '\t', '\r'
 */
const CSV_FORMULA_CHARACTERS = ["=", "+", "-", "@", "\t", "\r"];

/**
 * Peta karakter HTML untuk escaping XSS
 */
const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "/": "&#x2F;",
  "`": "&#x60;",
};

/**
 * Mengonversi karakter khusus HTML menjadi HTML entity
 * Mencegah serangan Cross-Site Scripting (XSS)
 */
export function escapeHtml(input: string): string {
  if (!input || typeof input !== "string") return "";
  return input.replace(/[&<>"'/`]/g, (char) => HTML_ESCAPE_MAP[char] || char);
}

/**
 * Membersihkan string dari tag HTML berbahaya dan script injections
 */
export function sanitizeInput(input: string | null | undefined): string {
  if (input === null || input === undefined) return "";
  if (typeof input !== "string") return String(input);

  let cleaned = input.trim();
  // Hapus pola javascript: atau vbscript: atau data: URL dalam konten input
  cleaned = cleaned.replace(/javascript\s*:/gi, "");
  cleaned = cleaned.replace(/vbscript\s*:/gi, "");
  // Hapus tag HTML <script>...</script> beserta isinya
  cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  // Escape tag HTML sisa untuk keamanan
  return escapeHtml(cleaned);
}

/**
 * Sanitasi rekursif untuk objek input (misalnya request body)
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  if (!obj || typeof obj !== "object") return obj;

  const result: any = Array.isArray(obj) ? [] : {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      result[key] = sanitizeInput(value);
    } else if (value !== null && typeof value === "object") {
      result[key] = sanitizeObject(value);
    } else {
      result[key] = value;
    }
  }

  return result as T;
}

/**
 * Mencegah serangan CSV / Spreadsheet Formula Injection (CWE-1236)
 * Jika sebuah nilai dimulai dengan karakter formula (=, +, -, @, \t, \r),
 * awalan tanda petik satu (') disematkan agar spreadsheet merendernya sebagai teks murni.
 */
export function sanitizeCsvCell(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) {
    return '""';
  }

  let str = String(value).trim();

  // Jika karakter pertama memicu eksekusi formula spreadsheet
  if (str.length > 0 && CSV_FORMULA_CHARACTERS.includes(str[0])) {
    str = `'${str}`;
  }

  // Escape tanda kutip ganda standar CSV
  return `"${str.replace(/"/g, '""')}"`;
}

/**
 * Sensor Nomor Induk Kependudukan (NIK 16 digit)
 * Menampilkan 4 digit awal dan 4 digit akhir, sisanya disensor dengan asteris (*)
 * Contoh: 3201234567890001 -> 3201********0001
 */
export function maskNIK(nik: string | null | undefined): string {
  if (!nik || typeof nik !== "string") return "-";
  const clean = nik.trim();
  if (clean.length < 8) return clean;
  const start = clean.slice(0, 4);
  const end = clean.slice(-4);
  const maskedCount = Math.max(0, clean.length - 8);
  return `${start}${"*".repeat(maskedCount)}${end}`;
}

/**
 * Sensor Nomor Telepon / WhatsApp
 * Contoh: 081234567890 -> 0812****7890
 */
export function maskPhone(phone: string | null | undefined): string {
  if (!phone || typeof phone !== "string") return "-";
  const clean = phone.trim();
  if (clean.length <= 6) return clean;
  const start = clean.slice(0, 4);
  const end = clean.slice(-4);
  const maskedCount = Math.max(0, clean.length - 8);
  return `${start}${"*".repeat(maskedCount)}${end}`;
}

/**
 * Sensor Alamat Email
 * Contoh: admin@sdharapanbangsa.sch.id -> a***n@sdharapanbangsa.sch.id
 */
export function maskEmail(email: string | null | undefined): string {
  if (!email || typeof email !== "string" || !email.includes("@")) return "-";
  const [localPart, domain] = email.trim().split("@");
  if (localPart.length <= 2) {
    return `${localPart[0]}*@${domain}`;
  }
  const start = localPart[0];
  const end = localPart[localPart.length - 1];
  const maskedCount = Math.max(1, localPart.length - 2);
  return `${start}${"*".repeat(maskedCount)}${end}@${domain}`;
}
