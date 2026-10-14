import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { announcementSchema } from "@/lib/validations/news";
import { logActivity } from "@/lib/audit";
import {
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
} from "@/lib/storage/db";
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
      return NextResponse.json(
        { success: false, message: "Validasi gagal", errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // 1. Simpan ke sistem penyimpanan nyata
    let updated;
    try {
      updated = updateAnnouncement(id, {
        title: parsed.data.title,
        content: parsed.data.content,
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
          title: parsed.data.title,
          content: parsed.data.content,
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
        details: `Memperbarui pengumuman: "${parsed.data.title}"`,
      });
    } catch {}

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "UNAUTHORIZED" || (err as any).name === "AuthorizationError") {
      return NextResponse.json({ success: false, message: "Akses ditolak" }, { status: 401 });
    }
    return NextResponse.json({ success: false, message: "Gagal memperbarui pengumuman" }, { status: 500 });
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

    return NextResponse.json({
      success: true,
      message: deleted ? "Pengumuman berhasil dihapus dari sistem" : "Pengumuman telah dihapus",
    });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "UNAUTHORIZED" || (err as any).name === "AuthorizationError") {
      return NextResponse.json({ success: false, message: "Akses ditolak" }, { status: 401 });
    }
    return NextResponse.json({ success: false, message: "Gagal menghapus pengumuman" }, { status: 500 });
  }
}
