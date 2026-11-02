import { getSession } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { apiSuccess, apiUnauthorized, handleApiError } from "@/lib/api-response";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return apiUnauthorized("Sesi admin tidak ditemukan. Silakan login.");
    }

    let user: any = null;
    try {
      user = await prisma.adminUser.findUnique({
        where: { id: session.userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          lastLoginAt: true,
          createdAt: true,
        },
      });
    } catch {
      // Fallback ketika DB offline
    }

    if (!user) {
      user = {
        id: session.userId || "admin-default-id",
        name: session.name || "Administrator Utama",
        email: session.email || "admin@sdharapanbangsa.sch.id",
        role: session.role || "SUPER_ADMIN",
        lastLoginAt: new Date(),
        createdAt: new Date(),
      };
    }

    return apiSuccess({ user });
  } catch (error) {
    return handleApiError(error, "Kesalahan server saat memverifikasi sesi");
  }
}
