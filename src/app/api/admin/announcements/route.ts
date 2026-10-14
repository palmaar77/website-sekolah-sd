import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { announcementSchema } from "@/lib/validations/news";
import { logActivity } from "@/lib/audit";
import { getAllAnnouncements, createAnnouncement } from "@/lib/storage/db";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    await requireAuth(["SUPER_ADMIN", "ADMIN", "STAFF"]);
    const data = getAllAnnouncements();
    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "UNAUTHORIZED" || (err as any).name === "AuthorizationError") {
      return NextResponse.json({ success: false, message: "Akses ditolak" }, { status: 401 });
    }
    return NextResponse.json({ success: false, message: "Gagal mengambil data pengumuman" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(["SUPER_ADMIN", "ADMIN", "STAFF"]);
    const body = await request.json();
    const parsed = announcementSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Validasi gagal", errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // 1. Simpan ke sistem penyimpanan nyata
    const item = createAnnouncement({
      title: parsed.data.title,
      content: parsed.data.content,
      isImportant: parsed.data.isImportant,
      isActive: parsed.data.isActive,
      startDate: parsed.data.startDate || new Date().toISOString(),
      endDate: parsed.data.endDate || null,
      fileAttachment: parsed.data.fileAttachment || null,
    });

    // 2. Coba simpan ke Prisma jika online
    try {
      await prisma.announcement.create({
        data: {
          title: parsed.data.title,
          content: parsed.data.content,
          isImportant: parsed.data.isImportant,
          isActive: parsed.data.isActive,
          startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : new Date(),
          endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
          fileAttachment: parsed.data.fileAttachment || null,
        },
      });
    } catch {}

    try {
      await logActivity({
        adminId: session.userId,
        adminName: session.name,
        action: "CREATE_ANNOUNCEMENT",
        details: `Menambahkan pengumuman baru: "${item.title}"`,
      });
    } catch {}

    return NextResponse.json({ success: true, data: item });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "UNAUTHORIZED" || (err as any).name === "AuthorizationError") {
      return NextResponse.json({ success: false, message: "Akses ditolak" }, { status: 401 });
    }
    console.error("Create announcement error:", error);
    return NextResponse.json({ success: false, message: "Gagal membuat pengumuman" }, { status: 500 });
  }
}
