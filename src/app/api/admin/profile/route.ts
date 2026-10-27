import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { schoolProfileSchema } from "@/lib/validations/profile";
import { logActivity } from "@/lib/audit";

export async function GET() {
  try {
    let profile = await prisma.schoolProfile.findUnique({
      where: { id: "default-profile" },
    });

    if (!profile) {
      profile = await prisma.schoolProfile.findFirst();
    }

    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data profil sekolah" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const parsed = schoolProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validasi data profil gagal",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Cari profil yang sudah ada untuk memperbarui ID yang tepat
    const existing =
      (await prisma.schoolProfile.findUnique({
        where: { id: "default-profile" },
      })) || (await prisma.schoolProfile.findFirst());

    const profileId = existing ? existing.id : "default-profile";

    const updated = await prisma.schoolProfile.upsert({
      where: { id: profileId },
      update: data,
      create: {
        id: profileId,
        ...data,
      },
    });

    await logActivity({
      adminId: session.userId,
      adminName: session.name,
      action: "UPDATE_PROFILE",
      details: "Memperbarui informasi profil, visi, misi, dan identitas sekolah",
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, message: "Akses ditolak. Silakan login kembali." },
        { status: 401 }
      );
    }
    console.error("Update profile error:", error);
    return NextResponse.json(
      {
        success: false,
        message: err.message || "Gagal memperbarui profil sekolah",
      },
      { status: 500 }
    );
  }
}
