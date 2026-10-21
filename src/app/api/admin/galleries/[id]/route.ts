import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { logActivity } from "@/lib/audit";
import {
  getGalleryById,
  updateGallery,
  deleteGallery,
  getGalleryCategories,
} from "@/lib/storage/db";
import { galleryItemSchema } from "@/lib/validations/gallery";

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
      return NextResponse.json({ success: false, message: "Foto galeri tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: item });
  } catch {
    return NextResponse.json({ success: false, message: "Kesalahan server" }, { status: 500 });
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
      return NextResponse.json(
        { success: false, message: "Validasi gagal: periksa kelengkapan isian", errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    let updated: any;
    try {
      updated = updateGallery(id, {
        title: parsed.data.title.trim(),
        imageUrl: parsed.data.imageUrl.trim(),
        description: parsed.data.description?.trim() || null,
        categoryId: parsed.data.categoryId,
        isFeatured: parsed.data.isFeatured,
      });
    } catch {}

    try {
      const prismaUpdated = await prisma.gallery.update({
        where: { id },
        data: {
          title: parsed.data.title.trim(),
          imageUrl: parsed.data.imageUrl.trim(),
          description: parsed.data.description?.trim() || null,
          categoryId: parsed.data.categoryId,
          isFeatured: parsed.data.isFeatured,
        },
      });
      if (!updated) updated = prismaUpdated;
    } catch {}

    if (!updated) {
      return NextResponse.json({ success: false, message: "Foto galeri tidak ditemukan untuk diperbarui" }, { status: 404 });
    }

    await logActivity({
      adminId: session.userId,
      adminName: session.name,
      action: "UPDATE_GALLERY",
      details: `Memperbarui foto galeri: "${updated.title}"`,
    });

    return NextResponse.json({ success: true, message: "Foto galeri berhasil diperbarui", data: updated });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, message: "Akses ditolak" }, { status: 401 });
    }
    return NextResponse.json({ success: false, message: "Gagal memperbarui foto galeri" }, { status: 500 });
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

    const deleted = deleteGallery(id);

    try {
      await prisma.gallery.delete({ where: { id } });
    } catch {}

    await logActivity({
      adminId: session.userId,
      adminName: session.name,
      action: "DELETE_GALLERY",
      details: `Menghapus foto galeri: "${title || id}"`,
    });

    return NextResponse.json({ success: true, message: "Foto galeri berhasil dihapus" });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, message: "Akses ditolak" }, { status: 401 });
    }
    return NextResponse.json({ success: false, message: "Gagal menghapus foto galeri" }, { status: 500 });
  }
}
