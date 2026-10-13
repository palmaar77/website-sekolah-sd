import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { verifyPassword, hashPassword } from "@/lib/auth/password";
import { logActivity } from "@/lib/audit";
import { z } from "zod";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Password saat ini wajib diisi"),
  newPassword: z.string().min(8, "Password baru minimal 8 karakter"),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const parsed = changePasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Validasi gagal", errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = parsed.data;

    const user = await prisma.adminUser.findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: "Pengguna tidak ditemukan" }, { status: 404 });
    }

    const isMatch = await verifyPassword(currentPassword, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Password saat ini tidak cocok" },
        { status: 400 }
      );
    }

    const newHashed = await hashPassword(newPassword);
    await prisma.adminUser.update({
      where: { id: user.id },
      data: { passwordHash: newHashed },
    });

    await logActivity({
      adminId: user.id,
      adminName: user.name,
      action: "CHANGE_PASSWORD",
      details: "Admin berhasil memperbarui kata sandi",
    });

    return NextResponse.json({ success: true, message: "Password berhasil diperbarui" });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, message: "Akses ditolak" }, { status: 401 });
    }
    return NextResponse.json({ success: false, message: "Gagal memperbarui password" }, { status: 500 });
  }
}
