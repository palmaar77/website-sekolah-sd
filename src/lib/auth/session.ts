import { cookies } from "next/headers";
import {
  AUTH_COOKIE_NAME,
  STUDENT_COOKIE_NAME,
  verifySessionToken,
  verifyStudentSessionToken,
  type SessionPayload,
  type StudentPayload,
} from "./jwt";
import prisma from "../prisma";
import { assertRole, type AdminRole } from "./rbac";

/**
 * Mengambil sesi admin saat ini dari cookies (Server Component / Route Handler)
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

/**
 * Mengambil sesi siswa saat ini dari cookies (Server Component / Route Handler)
 */
export async function getStudentSession(): Promise<StudentPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(STUDENT_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyStudentSessionToken(token);
}

/**
 * Mengambil sesi aktif apa pun (Admin atau Siswa)
 */
export async function getCurrentSession(): Promise<
  | { type: "admin"; session: SessionPayload }
  | { type: "student"; session: StudentPayload }
  | null
> {
  const admin = await getSession();
  if (admin) return { type: "admin", session: admin };

  const student = await getStudentSession();
  if (student) return { type: "student", session: student };

  return null;
}

/**
 * Memastikan request dilakukan oleh admin yang valid.
 * Mendukung verifikasi Role-Based Access Control (RBAC).
 */
export async function requireAuth(allowedRoles?: AdminRole[]): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }

  // Jika ada pembatasan role tertentu
  if (allowedRoles && allowedRoles.length > 0) {
    assertRole(session.role, allowedRoles);
  }

  // Verifikasi status user aktif di database bila database online
  try {
    const user = await prisma.adminUser.findUnique({
      where: { id: session.userId },
      select: { id: true, isActive: true },
    });

    if (user && !user.isActive) {
      throw new Error("UNAUTHORIZED");
    }
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED" || err.name === "AuthorizationError") {
      throw err;
    }
    // Jika DB offline, izinkan session token JWT yang valid
  }

  return session;
}

/**
 * Memastikan request dilakukan oleh siswa yang valid.
 */
export async function requireStudentAuth(): Promise<StudentPayload> {
  const session = await getStudentSession();
  if (!session || session.role !== "STUDENT") {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}
