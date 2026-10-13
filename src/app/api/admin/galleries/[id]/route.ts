import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { logActivity } from "@/lib/audit";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const existing = await prisma.gallery.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ success: false, message: "Foto galeri tidak ditemukan" }, { status: 404 });
    }

    await prisma.gallery.delete({ where: { id } });

    await logActivity({
      adminId: session.userId,
      adminName: session.name,
      action: "DELETE_GALLERY",
      details: `Menghapus foto galeri: "${existing.title}"`,
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
