import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { announcementSchema } from "@/lib/validations/news";
import { logActivity } from "@/lib/audit";

export async function GET() {
  try {
    await requireAuth();
    let data: any[] = [];
    try {
      data = await prisma.announcement.findMany({
        orderBy: { createdAt: "desc" },
      });
    } catch {
      data = [
        {
          id: "ann-demo-1",
          title: "Pengumuman Jadwal Verifikasi Berkas PPDB Gelombang I",
          content: "Verifikasi berkas fisik dilaksanakan mulai 20 Mei s.d. 25 Mei 2025 di ruang panitia PPDB.",
          isImportant: true,
          isActive: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: "ann-demo-2",
          title: "Edaran Pembagian Rapor Semester Genap dan Libur Akhir Tahun Ajaran",
          content: "Pembagian buku rapor siswa dilaksanakan serentak pada hari Jumat, 20 Juni 2025.",
          isImportant: false,
          isActive: true,
          createdAt: new Date().toISOString(),
        },
      ];
    }
    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, message: "Akses ditolak" }, { status: 401 });
    }
    return NextResponse.json({ success: false, message: "Gagal mengambil data pengumuman" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const parsed = announcementSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Validasi gagal", errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const item = await prisma.announcement.create({
      data: {
        title: parsed.data.title,
        content: parsed.data.content,
        isImportant: parsed.data.isImportant,
        isActive: parsed.data.isActive,
        startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : new Date(),
        endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
      },
    });

    await logActivity({
      adminId: session.userId,
      adminName: session.name,
      action: "CREATE_ANNOUNCEMENT",
      details: `Menambahkan pengumuman: "${item.title}"`,
    });

    return NextResponse.json({ success: true, data: item });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, message: "Akses ditolak" }, { status: 401 });
    }
    return NextResponse.json({ success: false, message: "Gagal membuat pengumuman" }, { status: 500 });
  }
}
