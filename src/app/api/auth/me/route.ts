import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Belum login" },
        { status: 401 }
      );
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

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json(
      { success: false, message: "Kesalahan server saat memverifikasi sesi" },
      { status: 500 }
    );
  }
}
