/**
 * Standardized Clean API Response Helper
 * Menerapkan prinsip Clean Code (DRY & SRP):
 * - Format respon JSON yang seragam di seluruh API route
 * - Penanganan error terpusat yang aman dari Information Disclosure (OWASP A05)
 */

import { NextResponse } from "next/server.js";
import { ZodError } from "zod";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  code?: string;
  errors?: Record<string, string[]>;
  meta?: Record<string, unknown>;
}

/**
 * Respon sukses standar (HTTP 200 OK)
 */
export function apiSuccess<T>(
  data: T,
  meta?: Record<string, unknown>,
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(meta ? { meta } : {}),
    },
    { status }
  );
}

/**
 * Respon sukses saat sumber daya baru dibuat (HTTP 201 Created)
 */
export function apiCreated<T>(
  data: T,
  message = "Data berhasil dibuat"
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status: 201 }
  );
}

/**
 * Respon kegagalan validasi atau permintaan tidak valid (HTTP 400 Bad Request)
 */
export function apiBadRequest(
  message = "Data formulir tidak lengkap atau format salah.",
  errors?: Record<string, string[]>,
  code = "BAD_REQUEST"
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      code,
      message,
      ...(errors ? { errors } : {}),
    },
    { status: 400 }
  );
}

/**
 * Respon ketika pengguna belum terautentikasi (HTTP 401 Unauthorized)
 */
export function apiUnauthorized(
  message = "Akses tidak diizinkan. Silakan login terlebih dahulu."
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      code: "UNAUTHORIZED",
      message,
    },
    { status: 401 }
  );
}

/**
 * Respon ketika pengguna tidak memiliki hak akses yang cukup (HTTP 403 Forbidden)
 */
export function apiForbidden(
  message = "Akses ditolak. Anda tidak memiliki izin untuk mengakses data ini.",
  code = "FORBIDDEN"
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      code,
      message,
    },
    { status: 403 }
  );
}

/**
 * Respon ketika data tidak ditemukan (HTTP 404 Not Found)
 */
export function apiNotFound(
  message = "Data yang Anda cari tidak ditemukan."
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      code: "NOT_FOUND",
      message,
    },
    { status: 404 }
  );
}

/**
 * Respon pembatasan laju / Rate Limit (HTTP 429 Too Many Requests)
 */
export function apiTooManyRequests(
  message = "Terlalu banyak permintaan. Silakan tunggu beberapa saat.",
  retryAfterSeconds?: number
): NextResponse<ApiResponse> {
  const headers = new Headers();
  if (retryAfterSeconds) {
    headers.set("Retry-After", String(retryAfterSeconds));
  }

  return NextResponse.json(
    {
      success: false,
      code: "RATE_LIMIT_EXCEEDED",
      message,
    },
    { status: 429, headers }
  );
}

/**
 * Respon kesalahan internal server (HTTP 500 Internal Server Error)
 * Pesan kesalahan sensitif disembunyikan untuk mencegah kebocoran informasi teknis.
 */
export function apiInternalError(
  message = "Terjadi kesalahan internal pada sistem sekolah."
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      code: "INTERNAL_SERVER_ERROR",
      message,
    },
    { status: 500 }
  );
}

/**
 * Handler error terpusat yang aman untuk Route Handlers
 * Menangkap error Zod, AuthorizationError, dan error umum
 */
export function handleApiError(
  error: unknown,
  fallbackMessage = "Terjadi kesalahan saat memproses permintaan."
): NextResponse<ApiResponse> {
  // 1. Tangani Zod Validation Error
  if (error instanceof ZodError) {
    return apiBadRequest(
      "Validasi data gagal. Mohon periksa kembali isian formulir.",
      error.flatten().fieldErrors,
      "VALIDATION_ERROR"
    );
  }

  // 2. Tangani Authorization / RBAC Error
  if (
    error &&
    typeof error === "object" &&
    "name" in error &&
    (error as any).name === "AuthorizationError"
  ) {
    const authErr = error as { statusCode?: number; message?: string; code?: string };
    if (authErr.statusCode === 401) {
      return apiUnauthorized(authErr.message);
    }
    return apiForbidden(authErr.message, authErr.code);
  }

  // 3. Tangani Error standar JavaScript
  if (error instanceof Error) {
    if (error.message === "UNAUTHORIZED") {
      return apiUnauthorized();
    }
    if (error.message === "FORBIDDEN") {
      return apiForbidden();
    }
  }

  // Log error di console server (tidak dibocorkan ke client)
  console.error("Unhandled API Error:", error);

  return apiInternalError(fallbackMessage);
}
