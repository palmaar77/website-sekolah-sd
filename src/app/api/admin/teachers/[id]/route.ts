import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { teacherSchema } from "@/lib/validations/teacher";
import { logActivity } from "@/lib/audit";
import { sanitizeInput } from "@/lib/security/sanitize";
import { apiNotFound, apiSuccess, handleApiError } from "@/lib/api-response";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const parsed = teacherSchema.safeParse(body);

    if (!parsed.success) {
      return handleApiError(parsed.error);
    }

    const cleanData = {
      ...parsed.data,
      name: sanitizeInput(parsed.data.name),
      nip: parsed.data.nip ? parsed.data.nip.trim() : null,
      role: sanitizeInput(parsed.data.role),
      subject: parsed.data.subject ? sanitizeInput(parsed.data.subject) : null,
      education: parsed.data.education ? sanitizeInput(parsed.data.education) : null,
    };

    const updated = await prisma.teacher.update({
      where: { id },
      data: cleanData,
    });

    await logActivity({
      adminId: session.userId,
      adminName: session.name,
      action: "UPDATE_TEACHER",
      details: `Memperbarui guru/staf: "${updated.name}"`,
    });

    return apiSuccess(updated);
  } catch (error: unknown) {
    return handleApiError(error, "Gagal memperbarui data guru");
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const existing = await prisma.teacher.findUnique({ where: { id } });

    if (!existing) {
      return apiNotFound("Guru tidak ditemukan");
    }

    await prisma.teacher.delete({ where: { id } });

    await logActivity({
      adminId: session.userId,
      adminName: session.name,
      action: "DELETE_TEACHER",
      details: `Menghapus guru/staf: "${existing.name}"`,
    });

    return apiSuccess({ message: "Data guru berhasil dihapus" });
  } catch (error: unknown) {
    return handleApiError(error, "Gagal menghapus data guru");
  }
}
