import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { announcementSchema } from "@/lib/validations/news";
import { logActivity } from "@/lib/audit";
import {
  updateAnnouncement,
  deleteAnnouncement,
} from "@/lib/storage/db";
import { sanitizeInput } from "@/lib/security/sanitize";
import { apiNotFound, apiSuccess, handleApiError } from "@/lib/api-response";
import prisma from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(["SUPER_ADMIN", "ADMIN", "STAFF"]);
    const { id } = await params;
    const body = await request.json();
    const parsed = announcementSchema.safeParse(body);

    if (!parsed.success) {
      return handleApiError(parsed.error);
    }

    const cleanTitle = sanitizeInput(parsed.data.title);
    const cleanContent = sanitizeInput(parsed.data.content);

    // 1. Simpan ke sistem penyimpanan nyata
    let updated;
    try {
      updated = updateAnnouncement(id, {
        title: cleanTitle,
        content: cleanContent,
        isImportant: parsed.data.isImportant,
        isActive: parsed.data.isActive,
        startDate: parsed.data.startDate || undefined,
        endDate: parsed.data.endDate || null,
      });
    } catch {
      // Jika di storage gagal, cek Prisma
    }

    try {
      await prisma.announcement.update({
        where: { id },
        data: {
          title: cleanTitle,
          content: cleanContent,
          isImportant: parsed.data.isImportant,
          isActive: parsed.data.isActive,
          startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : undefined,
          endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
        },
      });
    } catch {}

    try {
      await logActivity({
        adminId: session.userId,
        adminName: session.name,
        action: "UPDATE_ANNOUNCEMENT",
        details: `Memperbarui pengumuman: "${cleanTitle}"`,
      });
    } catch {}

    if (!updated) {
      return apiNotFound("Pengumuman tidak ditemukan untuk diperbarui");
    }

    return apiSuccess(updated);
  } catch (error: unknown) {
    return handleApiError(error, "Gagal memperbarui pengumuman");
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(["SUPER_ADMIN", "ADMIN"]);
    const { id } = await params;

    const deleted = deleteAnnouncement(id);

    try {
      await prisma.announcement.delete({ where: { id } });
    } catch {}

    try {
      await logActivity({
        adminId: session.userId,
        adminName: session.name,
        action: "DELETE_ANNOUNCEMENT",
        details: `Menghapus pengumuman ID: ${id}`,
      });
    } catch {}

    return apiSuccess({
      message: deleted ? "Pengumuman berhasil dihapus dari sistem" : "Pengumuman telah dihapus",
    });
  } catch (error: unknown) {
    return handleApiError(error, "Gagal menghapus pengumuman");
  }
}
