/**
 * OWASP Top 10 CSRF (Cross-Site Request Forgery) & Origin Validation
 * Memvalidasi header Origin & Referer pada setiap request HTTP mutasi (POST, PUT, PATCH, DELETE)
 * untuk memastikan request berasal dari domain sekolah yang sah.
 */

import type { NextRequest } from "next/server";

export interface OriginValidationResult {
  isValid: boolean;
  reason?: string;
}

/**
 * Memvalidasi apakah request mutasi berasal dari domain yang sama (Same-Origin)
 */
export function validateSameOrigin(request: NextRequest): OriginValidationResult {
  const method = request.method.toUpperCase();

  // Request aman (idempotent / read-only) tidak memerlukan pengecekan origin
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return { isValid: true };
  }

  const hostHeader = request.headers.get("host") || "";
  const originHeader = request.headers.get("origin");
  const refererHeader = request.headers.get("referer");

  // Jika ada Origin header, periksa kecocokan dengan Host
  if (originHeader) {
    try {
      const originUrl = new URL(originHeader);
      if (originUrl.host.toLowerCase() === hostHeader.toLowerCase()) {
        return { isValid: true };
      }
      return {
        isValid: false,
        reason: `Origin tidak cocok. Permintaan dari ${originUrl.host} ditolak untuk host ${hostHeader}.`,
      };
    } catch {
      return { isValid: false, reason: "Format Origin header tidak valid." };
    }
  }

  // Jika Origin tidak tersedia, fallback ke Referer header
  if (refererHeader) {
    try {
      const refererUrl = new URL(refererHeader);
      if (refererUrl.host.toLowerCase() === hostHeader.toLowerCase()) {
        return { isValid: true };
      }
      return {
        isValid: false,
        reason: `Referer tidak cocok. Permintaan dari ${refererUrl.host} ditolak untuk host ${hostHeader}.`,
      };
    } catch {
      return { isValid: false, reason: "Format Referer header tidak valid." };
    }
  }

  // Jika kedua header tidak disediakan di lingkungan non-browser (misal Postman / server-to-server)
  // Di production, izinkan jika berasal dari internal API atau fetch same-site
  const secFetchSite = request.headers.get("sec-fetch-site");
  if (secFetchSite && secFetchSite !== "same-origin" && secFetchSite !== "none") {
    return {
      isValid: false,
      reason: `Sec-Fetch-Site tidak diizinkan: ${secFetchSite}.`,
    };
  }

  return { isValid: true };
}
