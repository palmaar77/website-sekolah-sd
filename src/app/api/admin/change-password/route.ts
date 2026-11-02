import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { verifyPassword, hashPassword } from "@/lib/auth/password";
import { logActivity } from "@/lib/audit";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  apiBadRequest,
  apiNotFound,
  apiSuccess,
  apiTooManyRequests,
  handleApiError,
} from "@/lib/api-response";
import { z } from "zod";

/**
 * Validasi kata sandi sesuai standar keamanan OWASP:
 * - Minimal 8 karakter
 * - Wajib mengandung kombinasi huruf dan angka/simbol khusus
 */
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Password saat ini wajib diisi"),
  newPassword: z
    .string()
    .min(8, "Password baru minimal 8 karakter")
    .regex(
      /^(?=.*[a-zA-Z])(?=.*[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/,
      "Password baru harus mengombinasikan huruf dengan angka atau simbol khusus"
    ),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();

    // Rate limiting: cegah brute-force perubahan password (maks 5 percobaan per 15 menit)
    const rateCheck = checkRateLimit(`change-password:${session.userId}`, {
      limit: 5,
      windowMs: 15 * 60 * 1000,
    });
    if (!rateCheck.success) {
      return apiTooManyRequests(
        "Terlalu banyak percobaan ganti kata sandi. Silakan tunggu 15 menit."
      );
    }

    const body = await request.json();
    const parsed = changePasswordSchema.safeParse(body);

    if (!parsed.success) {
      return apiBadRequest("Validasi kata sandi gagal", parsed.error.flatten().fieldErrors);
    }

    const { currentPassword, newPassword } = parsed.data;

    const user = await prisma.adminUser.findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      return apiNotFound("Pengguna tidak ditemukan dalam sistem.");
    }

    const isMatch = await verifyPassword(currentPassword, user.passwordHash);
    if (!isMatch) {
      return apiBadRequest("Kata sandi saat ini tidak cocok.");
    }

    if (currentPassword === newPassword) {
      return apiBadRequest("Kata sandi baru tidak boleh sama dengan kata sandi lama.");
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
      details: "Admin berhasil memperbarui kata sandi dengan aman",
    });

    return apiSuccess({ message: "Kata sandi berhasil diperbarui." });
  } catch (error: unknown) {
    return handleApiError(error, "Gagal memperbarui kata sandi akun.");
  }
}
