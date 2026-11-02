import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { facilitySchema } from "@/lib/validations/profile";
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
    const parsed = facilitySchema.safeParse(body);

    if (!parsed.success) {
      return handleApiError(parsed.error);
    }

    const cleanData = {
      ...parsed.data,
      name: sanitizeInput(parsed.data.name),
      description: sanitizeInput(parsed.data.description),
    };

    const updated = await prisma.facility.update({
      where: { id },
      data: cleanData,
    });

    await logActivity({
      adminId: session.userId,
      adminName: session.name,
      action: "UPDATE_FACILITY",
      details: `Memperbarui fasilitas: "${updated.name}"`,
    });

    return apiSuccess(updated);
  } catch (error: unknown) {
    return handleApiError(error, "Gagal memperbarui fasilitas");
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const existing = await prisma.facility.findUnique({ where: { id } });

    if (!existing) {
      return apiNotFound("Fasilitas tidak ditemukan");
    }

    await prisma.facility.delete({ where: { id } });

    await logActivity({
      adminId: session.userId,
      adminName: session.name,
      action: "DELETE_FACILITY",
      details: `Menghapus fasilitas: "${existing.name}"`,
    });

    return apiSuccess({ message: "Fasilitas berhasil dihapus" });
  } catch (error: unknown) {
    return handleApiError(error, "Gagal menghapus fasilitas");
  }
}
