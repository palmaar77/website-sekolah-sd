import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { facilitySchema } from "@/lib/validations/profile";
import { logActivity } from "@/lib/audit";

export async function GET() {
  try {
    const data = await prisma.facility.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Facilities error:", error);
    return NextResponse.json({ success: false, message: "Gagal mengambil data fasilitas" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const parsed = facilitySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Validasi gagal", errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const item = await prisma.facility.create({
      data: parsed.data,
    });

    await logActivity({
      adminId: session.userId,
      adminName: session.name,
      action: "CREATE_FACILITY",
      details: `Menambahkan fasilitas: "${item.name}"`,
    });

    return NextResponse.json({ success: true, data: item });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, message: "Akses ditolak" }, { status: 401 });
    }
    return NextResponse.json({ success: false, message: "Gagal menambahkan fasilitas" }, { status: 500 });
  }
}
