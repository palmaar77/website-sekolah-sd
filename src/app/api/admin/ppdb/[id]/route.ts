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
    const cleanId = decodeURIComponent(id).trim();

    let item = getPPDBRegistrationById(cleanId);
    if (!item) {
      try {
        item = (await prisma.pPDBRegistration.findFirst({
          where: {
            OR: [
              { id: cleanId },
              { registrationNumber: cleanId },
              { registrationNumber: cleanId.toUpperCase() },
            ],
          },
          include: { documents: true },
        })) as any;
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
    const cleanId = decodeURIComponent(id).trim();
    const body = await request.json();
    const parsed = updatePPDBStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validasi verifikasi gagal: mohon periksa kembali status dan catatan verifikasi.",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { status, verificationNotes } = parsed.data;
    const cleanNotes = verificationNotes && verificationNotes.trim() ? verificationNotes.trim() : null;

    // 1. Simpan perubahan ke persistent storage
    let updated: any;
    try {
      updated = updatePPDBRegistrationStatus(
        cleanId,
        status as any,
        cleanNotes,
        session.name
      );
    } catch {
      // Jika tidak di storage disk, mungkin ada di Prisma
    }

    // 2. Coba update Prisma jika database online
    try {
      const reg = await prisma.pPDBRegistration.findFirst({
        where: {
          OR: [
            { id: cleanId },
            { registrationNumber: cleanId },
            { registrationNumber: cleanId.toUpperCase() },
            ...(updated ? [{ registrationNumber: updated.registrationNumber }] : []),
          ],
        },
      });

      if (reg) {
        const prismaUpdated = await prisma.pPDBRegistration.update({
          where: { id: reg.id },
          data: {
            status: status as any,
            verificationNotes: cleanNotes,
            verifiedBy: session.name,
            verifiedAt: new Date(),
          },
        });
        if (!updated) {
          updated = prismaUpdated;
        }
      }
    } catch {}

    if (!updated) {
      return NextResponse.json(
        { success: false, message: `Pendaftar dengan nomor/ID "${cleanId}" tidak ditemukan.` },
        { status: 404 }
      );
    }

    try {
      await logActivity({
        adminId: session.userId,
        adminName: session.name,
        action: "UPDATE_PPDB_STATUS",
        details: `Mengubah status verifikasi pendaftar ${updated?.registrationNumber || cleanId} menjadi ${status}`,
      });
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Status verifikasi pendaftaran berhasil diperbarui",
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
    const cleanId = decodeURIComponent(id).trim();

    const deleted = deletePPDBRegistration(cleanId);

    try {
      const reg = await prisma.pPDBRegistration.findFirst({
        where: {
          OR: [
            { id: cleanId },
            { registrationNumber: cleanId },
            { registrationNumber: cleanId.toUpperCase() },
          ],
        },
      });
      if (reg) {
        await prisma.pPDBRegistration.delete({ where: { id: reg.id } });
      }
    } catch {}

    try {
      await logActivity({
        adminId: session.userId,
        adminName: session.name,
        action: "DELETE_PPDB",
        details: `Menghapus data pendaftar ID: ${cleanId}`,
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
