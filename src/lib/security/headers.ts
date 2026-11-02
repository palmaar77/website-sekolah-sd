/**
 * OWASP Top 10 Security Headers Configuration
 * Menerapkan standar header keamanan HTTP untuk memitigasi:
 * - A05: Security Misconfiguration
 * - A03: Injection & XSS (Content-Security-Policy, X-XSS-Protection)
 * - Clickjacking (X-Frame-Options)
 * - MIME Sniffing (X-Content-Type-Options)
 */

export interface SecurityHeader {
  key: string;
  value: string;
}

/**
 * Daftar header keamanan HTTP sesuai rekomendasi OWASP Secure Headers Project
 */
export const SECURITY_HEADERS: SecurityHeader[] = [
  // 1. Mencegah Clickjacking: melarang website di-embed dalam iframe dari domain luar
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  // 2. Mencegah MIME-sniffing: browser harus mematuhi Content-Type yang dideklarasikan
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  // 3. Batasi pengiriman header Referer ke domain eksternal
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  // 4. Pembatasan akses fitur perangkat (kamera, mikrofon, geolokasi)
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  // 5. Filter XSS legacy pada browser lama
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  // 6. Kontrol DNS Prefetching
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  // 7. Enforce HTTPS via HSTS (HTTP Strict Transport Security) selama 2 tahun
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // 8. Content Security Policy (CSP): batasi sumber skrip, gambar, dan gaya
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https://images.unsplash.com https://*.unsplash.com",
      "connect-src 'self' https:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

/**
 * Menerapkan daftar security header ke instance Headers atau Response
 */
export function applySecurityHeaders(headers: Headers): Headers {
  for (const header of SECURITY_HEADERS) {
    if (!headers.has(header.key)) {
      headers.set(header.key, header.value);
    }
  }
  return headers;
}
