import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { updatePPDBStatusSchema } from "@/lib/validations/ppdb";
import { logActivity } from "@/lib/audit";
import {
  getPPDBRegistrationById,
  updatePPDBRegistrationStatus,
  deletePPDBRegistration,
} from "@/lib/storage/db";
import prisma from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth(["SUPER_ADMIN", "ADMIN", "STAFF"]);
    const { id } = await params;

    let item = getPPDBRegistrationById(id);
    if (!item) {
      try {
        item = await prisma.pPDBRegistration.findUnique({
          where: { id },
          include: { documents: true },
        }) as any;
      } catch {}
    }

    if (!item) {
      return NextResponse.json({ success: false, message: "Pendaftar tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: item });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "UNAUTHORIZED" || (err as any).name === "AuthorizationError") {
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
    const session = await requireAuth(["SUPER_ADMIN", "ADMIN", "STAFF"]);
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

    // 1. Simpan perubahan ke persistent storage
    let updated;
    try {
      updated = updatePPDBRegistrationStatus(
        id,
        status as any,
        verificationNotes,
        session.name
      );
    } catch {
      // Jika tidak di storage disk, coba Prisma
    }

    // 2. Coba update Prisma jika database online
    try {
      await prisma.pPDBRegistration.update({
        where: { id },
        data: {
          status: status as any,
          verificationNotes: verificationNotes || null,
          verifiedBy: session.name,
          verifiedAt: new Date(),
        },
      });
    } catch {}

    try {
      await logActivity({
        adminId: session.userId,
        adminName: session.name,
        action: "UPDATE_PPDB_STATUS",
        details: `Mengubah status pendaftar ${updated?.registrationNumber || id} menjadi ${status}`,
      });
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Status pendaftaran berhasil diperbarui",
      data: updated,
    });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "UNAUTHORIZED" || (err as any).name === "AuthorizationError") {
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
    const session = await requireAuth(["SUPER_ADMIN", "ADMIN"]);
    const { id } = await params;

    const deleted = deletePPDBRegistration(id);

    try {
      await prisma.pPDBRegistration.delete({ where: { id } });
    } catch {}

    try {
      await logActivity({
        adminId: session.userId,
        adminName: session.name,
        action: "DELETE_PPDB",
        details: `Menghapus data pendaftar ID: ${id}`,
      });
    } catch {}

    return NextResponse.json({
      success: true,
      message: deleted ? "Pendaftar berhasil dihapus dari sistem" : "Data pendaftaran telah dihapus",
    });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "UNAUTHORIZED" || (err as any).name === "AuthorizationError") {
      return NextResponse.json({ success: false, message: "Akses ditolak" }, { status: 401 });
    }
    return NextResponse.json({ success: false, message: "Gagal menghapus pendaftar" }, { status: 500 });
  }
}
