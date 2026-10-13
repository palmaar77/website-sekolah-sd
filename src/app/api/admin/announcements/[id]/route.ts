import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { announcementSchema } from "@/lib/validations/news";
import { logActivity } from "@/lib/audit";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const parsed = announcementSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Validasi gagal", errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updated = await prisma.announcement.update({
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

    await logActivity({
      adminId: session.userId,
      adminName: session.name,
      action: "UPDATE_ANNOUNCEMENT",
      details: `Memperbarui pengumuman: "${updated.title}"`,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "UNAUTHORIZED") {
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
    const session = await requireAuth();
    const { id } = await params;
    const existing = await prisma.announcement.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ success: false, message: "Pengumuman tidak ditemukan" }, { status: 404 });
    }

    await prisma.announcement.delete({ where: { id } });

    await logActivity({
      adminId: session.userId,
      adminName: session.name,
      action: "DELETE_ANNOUNCEMENT",
      details: `Menghapus pengumuman: "${existing.title}"`,
    });

    return NextResponse.json({ success: true, message: "Pengumuman berhasil dihapus" });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, message: "Akses ditolak" }, { status: 401 });
    }
    return NextResponse.json({ success: false, message: "Gagal menghapus pengumuman" }, { status: 500 });
  }
}
