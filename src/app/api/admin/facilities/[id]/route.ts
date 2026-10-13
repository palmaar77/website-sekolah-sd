import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { facilitySchema } from "@/lib/validations/profile";
import { logActivity } from "@/lib/audit";

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
      return NextResponse.json(
        { success: false, message: "Validasi gagal", errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updated = await prisma.facility.update({
      where: { id },
      data: parsed.data,
    });

    await logActivity({
      adminId: session.userId,
      adminName: session.name,
      action: "UPDATE_FACILITY",
      details: `Memperbarui fasilitas: "${updated.name}"`,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, message: "Akses ditolak" }, { status: 401 });
    }
    return NextResponse.json({ success: false, message: "Gagal memperbarui fasilitas" }, { status: 500 });
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
      return NextResponse.json({ success: false, message: "Fasilitas tidak ditemukan" }, { status: 404 });
    }

    await prisma.facility.delete({ where: { id } });

    await logActivity({
      adminId: session.userId,
      adminName: session.name,
      action: "DELETE_FACILITY",
      details: `Menghapus fasilitas: "${existing.name}"`,
    });

    return NextResponse.json({ success: true, message: "Fasilitas berhasil dihapus" });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, message: "Akses ditolak" }, { status: 401 });
    }
    return NextResponse.json({ success: false, message: "Gagal menghapus fasilitas" }, { status: 500 });
  }
}
