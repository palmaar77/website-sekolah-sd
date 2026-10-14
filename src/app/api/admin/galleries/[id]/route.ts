import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { logActivity } from "@/lib/audit";
import { getGalleryById, deleteGallery } from "@/lib/storage/db";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    // Cek di persistent storage db.ts
    const existing = getGalleryById(id);
    let title = existing ? existing.title : "";

    // Coba cek juga di Prisma
    if (!existing) {
      try {
        const prismaItem = await prisma.gallery.findUnique({ where: { id } });
        if (prismaItem) {
          title = prismaItem.title;
        }
      } catch {
        // Abaikan
      }
    }

    if (!existing && !title) {
      return NextResponse.json({ success: false, message: "Foto galeri tidak ditemukan" }, { status: 404 });
    }

    // Hapus dari persistent file database
    deleteGallery(id);

    // Hapus dari Prisma jika aktif
    try {
      await prisma.gallery.delete({ where: { id } });
    } catch {
      // Abaikan jika prisma offline
    }

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

