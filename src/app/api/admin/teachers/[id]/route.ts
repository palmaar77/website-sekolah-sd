import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { teacherSchema } from "@/lib/validations/teacher";
import { logActivity } from "@/lib/audit";

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
      return NextResponse.json(
        { success: false, message: "Validasi gagal", errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updated = await prisma.teacher.update({
      where: { id },
      data: parsed.data,
    });

    await logActivity({
      adminId: session.userId,
      adminName: session.name,
      action: "UPDATE_TEACHER",
      details: `Memperbarui guru/staf: "${updated.name}"`,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, message: "Akses ditolak" }, { status: 401 });
    }
    return NextResponse.json({ success: false, message: "Gagal memperbarui data guru" }, { status: 500 });
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
      return NextResponse.json({ success: false, message: "Guru tidak ditemukan" }, { status: 404 });
    }

    await prisma.teacher.delete({ where: { id } });

    await logActivity({
      adminId: session.userId,
      adminName: session.name,
      action: "DELETE_TEACHER",
      details: `Menghapus guru/staf: "${existing.name}"`,
    });

    return NextResponse.json({ success: true, message: "Data guru berhasil dihapus" });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, message: "Akses ditolak" }, { status: 401 });
    }
    return NextResponse.json({ success: false, message: "Gagal menghapus data guru" }, { status: 500 });
  }
}
