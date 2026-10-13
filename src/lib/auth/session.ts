import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, verifySessionToken, type SessionPayload } from "./jwt";
import prisma from "../prisma";

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
 * Memastikan request dilakukan oleh admin yang valid, melempar error / mengembalikan null jika tidak berhak
 */
export async function requireAuth(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
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
    if (err.message === "UNAUTHORIZED") {
      throw err;
    }
    // Jika DB offline, izinkan session token JWT yang valid
  }

  return session;
}
