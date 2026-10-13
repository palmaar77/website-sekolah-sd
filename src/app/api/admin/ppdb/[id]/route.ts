import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { updatePPDBStatusSchema } from "@/lib/validations/ppdb";
import { logActivity } from "@/lib/audit";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const item = await prisma.pPDBRegistration.findUnique({
      where: { id },
      include: {
        documents: true,
      },
    });

    if (!item) {
      return NextResponse.json({ success: false, message: "Pendaftar tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: item });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, message: "Akses ditolak" }, { status: 401 });
    }
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
    const parsed = updatePPDBStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Validasi gagal", errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { status, verificationNotes } = parsed.data;

    const updated = await prisma.pPDBRegistration.update({
      where: { id },
      data: {
        status,
        verificationNotes: verificationNotes || null,
        verifiedBy: session.name,
        verifiedAt: new Date(),
      },
    });

    await logActivity({
      adminId: session.userId,
      adminName: session.name,
      action: "UPDATE_PPDB_STATUS",
      details: `Mengubah status pendaftar ${updated.registrationNumber} (${updated.fullName}) menjadi ${status}`,
    });

    return NextResponse.json({
      success: true,
      message: "Status pendaftaran berhasil diperbarui",
      data: updated,
    });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, message: "Akses ditolak" }, { status: 401 });
    }
    console.error("Update PPDB status error:", error);
    return NextResponse.json({ success: false, message: "Gagal memperbarui status pendaftar" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const existing = await prisma.pPDBRegistration.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ success: false, message: "Pendaftar tidak ditemukan" }, { status: 404 });
    }

    await prisma.pPDBRegistration.delete({ where: { id } });

    await logActivity({
      adminId: session.userId,
      adminName: session.name,
      action: "DELETE_PPDB",
      details: `Menghapus pendaftar ${existing.registrationNumber} (${existing.fullName})`,
    });

    return NextResponse.json({ success: true, message: "Pendaftar berhasil dihapus" });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, message: "Akses ditolak" }, { status: 401 });
    }
    return NextResponse.json({ success: false, message: "Gagal menghapus pendaftar" }, { status: 500 });
  }
}
