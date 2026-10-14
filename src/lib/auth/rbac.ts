/**
 * Sistem Role-Based Access Control (RBAC) & Proteksi IDOR Terpusat
 * Menangani validasi otorisasi di tingkat server (backend authorization)
 */

import type { SessionPayload, StudentPayload } from "./jwt.ts";

export type AdminRole = "SUPER_ADMIN" | "ADMIN" | "STAFF";
export type UserRole = AdminRole | "STUDENT";

export const ROLES: Record<string, UserRole> = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  STAFF: "STAFF",
  STUDENT: "STUDENT",
};

export type Permission =
  | "admin:access"
  | "admin:manage_users"
  | "admin:settings"
  | "admin:news"
  | "admin:announcements"
  | "admin:teachers"
  | "admin:ppdb"
  | "admin:academic"
  | "admin:messages"
  | "student:view_own_grades"
  | "student:view_own_profile"
  | "grades:read_all"
  | "grades:write";

/**
 * Matriks Hak Akses (Permissions Matrix) berdasarkan Role
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: [
    "admin:access",
    "admin:manage_users",
    "admin:settings",
    "admin:news",
    "admin:announcements",
    "admin:teachers",
    "admin:ppdb",
    "admin:academic",
    "admin:messages",
    "student:view_own_grades",
    "student:view_own_profile",
    "grades:read_all",
    "grades:write",
  ],
  ADMIN: [
    "admin:access",
    "admin:news",
    "admin:announcements",
    "admin:teachers",
    "admin:ppdb",
    "admin:academic",
    "admin:messages",
    "student:view_own_grades",
    "student:view_own_profile",
    "grades:read_all",
    "grades:write",
  ],
  STAFF: [
    "admin:access",
    "admin:news",
    "admin:announcements",
    "admin:ppdb",
    "admin:academic",
    "grades:read_all",
    "student:view_own_grades",
    "student:view_own_profile",
  ],
  STUDENT: [
    "student:view_own_grades",
    "student:view_own_profile",
  ],
};

/**
 * Error khusus otorisasi & pelanggaran IDOR
 */
export class AuthorizationError extends Error {
  public statusCode: number;
  public code: string;

  constructor(message: string, statusCode: number = 403, code: string = "FORBIDDEN") {
    super(message);
    this.name = "AuthorizationError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

/**
 * Memeriksa apakah role memiliki izin (permission) tertentu
 */
export function hasPermission(role: UserRole | string | undefined, permission: Permission): boolean {
  if (!role) return false;
  const permissions = ROLE_PERMISSIONS[role as UserRole];
  if (!permissions) return false;
  return permissions.includes(permission);
}

/**
 * Memeriksa apakah role user termasuk dalam daftar role yang diizinkan
 */
export function hasRole(userRole: string | undefined, allowedRoles: UserRole[]): boolean {
  if (!userRole) return false;
  return allowedRoles.includes(userRole as UserRole);
}

/**
 * Validasi role di server: melempar AuthorizationError jika tidak berhak
 */
export function assertRole(userRole: string | undefined, allowedRoles: UserRole[]): void {
  if (!userRole || !hasRole(userRole, allowedRoles)) {
    throw new AuthorizationError(
      `Akses ditolak. Anda memerlukan salah satu peran berikut: ${allowedRoles.join(", ")}`,
      403,
      "ROLE_UNAUTHORIZED"
    );
  }
}

/**
 * Validasi Kepemilikan Data Siswa (IDOR Protection)
 * Memastikan siswa HANYA dapat membaca nilai atau data miliknya sendiri.
 * Admin/Guru (SUPER_ADMIN, ADMIN, STAFF) diizinkan membaca data seluruh siswa.
 *
 * @param session - Sesi pengguna saat ini (bisa Admin atau Siswa)
 * @param targetRegistrationNumber - ID / Nomor registrasi yang diminta dalam URL / request
 */
export function assertStudentOwnership(
  session: SessionPayload | StudentPayload | null | undefined,
  targetRegistrationNumber: string
): { isOwner: boolean; isAdmin: boolean } {
  if (!session) {
    throw new AuthorizationError("Sesi tidak valid atau belum masuk sistem.", 401, "UNAUTHORIZED");
  }

  // Jika yang meminta adalah Administrator atau Guru/Staf
  if (session.role === "SUPER_ADMIN" || session.role === "ADMIN" || session.role === "STAFF") {
    return { isOwner: false, isAdmin: true };
  }

  // Jika yang meminta adalah Siswa
  if (session.role === "STUDENT") {
    const studentSession = session as StudentPayload;
    const cleanSessionReg = (studentSession.registrationNumber || "").trim().toUpperCase();
    const cleanTargetReg = (targetRegistrationNumber || "").trim().toUpperCase();

    if (!cleanTargetReg || cleanSessionReg !== cleanTargetReg) {
      throw new AuthorizationError(
        `Akses ditolak: Anda tidak memiliki wewenang untuk membaca nilai atau data siswa lain (${targetRegistrationNumber}).`,
        403,
        "IDOR_FORBIDDEN"
      );
    }

    return { isOwner: true, isAdmin: false };
  }

  throw new AuthorizationError("Peran pengguna tidak dikenali.", 403, "UNKNOWN_ROLE");
}
