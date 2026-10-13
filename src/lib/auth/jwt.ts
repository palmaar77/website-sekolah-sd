import { SignJWT, jwtVerify } from "jose";

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
  [key: string]: unknown;
}

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key-change-in-production-min32chars";
const encodedKey = new TextEncoder().encode(JWT_SECRET);

export const AUTH_COOKIE_NAME = "sd_admin_session";
export const STUDENT_COOKIE_NAME = "sd_student_session";

export interface StudentPayload {
  registrationNumber: string;
  fullName: string;
  status: string;
  role: "STUDENT";
  [key: string]: unknown;
}

/**
 * Buat JWT session token dengan masa berlaku 24 jam untuk admin
 */
export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(encodedKey);
}

/**
 * Verifikasi dan decode JWT session token admin
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

/**
 * Buat JWT session token untuk portal siswa (7 hari)
 */
export async function createStudentSessionToken(payload: StudentPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

/**
 * Verifikasi token portal siswa
 */
export async function verifyStudentSessionToken(token: string): Promise<StudentPayload | null> {
  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload as StudentPayload;
  } catch {
    return null;
  }
}

