import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { logActivity } from "@/lib/audit";
import {
  getGalleryById,
  updateGallery,
  deleteGallery,
} from "@/lib/storage/db";
import { galleryItemSchema } from "@/lib/validations/gallery";
import { sanitizeInput } from "@/lib/security/sanitize";
import { apiNotFound, apiSuccess, handleApiError } from "@/lib/api-response";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let item = getGalleryById(id);
    if (!item) {
      try {
        item = (await prisma.gallery.findUnique({
          where: { id },
          include: { category: true },
        })) as any;
      } catch {}
    }

    if (!item) {
      return apiNotFound("Foto galeri tidak ditemukan");
    }

    return apiSuccess(item);
  } catch (error) {
    return handleApiError(error, "Kesalahan server saat mengambil foto galeri");
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const parsed = galleryItemSchema.safeParse(body);

    if (!parsed.success) {
      return handleApiError(parsed.error);
    }

    const cleanTitle = sanitizeInput(parsed.data.title);
    const cleanDescription = parsed.data.description ? sanitizeInput(parsed.data.description) : null;

    let updated: any;
    try {
      updated = updateGallery(id, {
        title: cleanTitle,
        imageUrl: parsed.data.imageUrl.trim(),
        description: cleanDescription,
        categoryId: parsed.data.categoryId,
        isFeatured: parsed.data.isFeatured,
      });
    } catch {}

    try {
      const prismaUpdated = await prisma.gallery.update({
        where: { id },
        data: {
          title: cleanTitle,
          imageUrl: parsed.data.imageUrl.trim(),
          description: cleanDescription,
          categoryId: parsed.data.categoryId,
          isFeatured: parsed.data.isFeatured,
        },
      });
      if (!updated) updated = prismaUpdated;
    } catch {}

    if (!updated) {
      return apiNotFound("Foto galeri tidak ditemukan untuk diperbarui");
    }

    await logActivity({
      adminId: session.userId,
      adminName: session.name,
      action: "UPDATE_GALLERY",
      details: `Memperbarui foto galeri: "${updated.title}"`,
    });

    return apiSuccess(updated, { message: "Foto galeri berhasil diperbarui" });
  } catch (error: unknown) {
    return handleApiError(error, "Gagal memperbarui foto galeri");
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const existing = getGalleryById(id);
    let title = existing ? existing.title : "";

    if (!existing) {
      try {
        const prismaItem = await prisma.gallery.findUnique({ where: { id } });
        if (prismaItem) {
          title = prismaItem.title;
        }
      } catch {}
    }

    deleteGallery(id);

    try {
      await prisma.gallery.delete({ where: { id } });
    } catch {}

    await logActivity({
      adminId: session.userId,
      adminName: session.name,
      action: "DELETE_GALLERY",
      details: `Menghapus foto galeri: "${title || id}"`,
    });

    return apiSuccess({ message: "Foto galeri berhasil dihapus" });
  } catch (error: unknown) {
    return handleApiError(error, "Gagal menghapus foto galeri");
  }
}
