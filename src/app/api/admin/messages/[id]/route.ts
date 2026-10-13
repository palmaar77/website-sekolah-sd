import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import prisma from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const body = await request.json();

    const updated = await prisma.contactMessage.update({
      where: { id },
      data: {
        isRead: body.isRead !== undefined ? Boolean(body.isRead) : true,
        replyNotes: body.replyNotes || undefined,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, message: "Akses ditolak" }, { status: 401 });
    }
    return NextResponse.json({ success: false, message: "Gagal memperbarui status pesan" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    await prisma.contactMessage.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Pesan berhasil dihapus" });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, message: "Akses ditolak" }, { status: 401 });
    }
    return NextResponse.json({ success: false, message: "Gagal menghapus pesan" }, { status: 500 });
  }
}
