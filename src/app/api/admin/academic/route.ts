import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { calendarSchema, extracurricularSchema } from "@/lib/validations/academic";
import { logActivity } from "@/lib/audit";

export async function GET() {
  try {
    const [calendars, extracurriculars, achievements] = await Promise.all([
      prisma.academicCalendar.findMany({
        orderBy: { eventDate: "asc" },
      }),
      prisma.extracurricular.findMany({
        orderBy: { createdAt: "asc" },
      }),
      prisma.achievement.findMany({
        orderBy: { year: "desc" },
      }),
    ]);

    return NextResponse.json({
      success: true,
      calendars,
      extracurriculars,
      achievements,
    });
  } catch (error) {
    console.error("Academic GET error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data akademik" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const type = body.type; // "calendar" | "extracurricular"

    if (type === "calendar") {
      const parsed = calendarSchema.safeParse(body.data);
      if (!parsed.success) {
        return NextResponse.json(
          {
            success: false,
            message: "Validasi kalender gagal",
            errors: parsed.error.flatten().fieldErrors,
          },
          { status: 400 }
        );
      }

      const item = await prisma.academicCalendar.create({
        data: {
          semester: parsed.data.semester.trim(),
          academicYear: parsed.data.academicYear.trim(),
          eventDate: new Date(parsed.data.eventDate),
          endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
          eventName: parsed.data.eventName.trim(),
          description: parsed.data.description ? parsed.data.description.trim() : null,
          isHoliday: parsed.data.isHoliday,
        },
      });

      await logActivity({
        adminId: session.userId,
        adminName: session.name,
        action: "CREATE_CALENDAR",
        details: `Menambahkan agenda kalender: "${item.eventName}"`,
      });

      // Purge cache agar kalender baru langsung tampil di portal dan halaman akademik publik
      revalidatePath("/");
      revalidatePath("/akademik");

      return NextResponse.json({ success: true, data: item });
    }

    if (type === "extracurricular") {
      const parsed = extracurricularSchema.safeParse(body.data);
      if (!parsed.success) {
        return NextResponse.json(
          {
            success: false,
            message: "Validasi ekstrakurikuler gagal",
            errors: parsed.error.flatten().fieldErrors,
          },
          { status: 400 }
        );
      }

      const item = await prisma.extracurricular.create({
        data: parsed.data,
      });

      await logActivity({
        adminId: session.userId,
        adminName: session.name,
        action: "CREATE_EXTRACURRICULAR",
        details: `Menambahkan ekstrakurikuler: "${item.name}"`,
      });

      revalidatePath("/");
      revalidatePath("/akademik");

      return NextResponse.json({ success: true, data: item });
    }

    return NextResponse.json({ success: false, message: "Tipe tidak valid" }, { status: 400 });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, message: "Akses ditolak" }, { status: 401 });
    }
    console.error("Academic POST error:", error);
    return NextResponse.json(
      { success: false, message: err.message || "Gagal menyimpan data" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type"); // "calendar" | "extracurricular"

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID wajib disertakan" },
        { status: 400 }
      );
    }

    if (type === "calendar") {
      const existing = await prisma.academicCalendar.findUnique({ where: { id } });
      if (!existing) {
        return NextResponse.json(
          { success: false, message: "Agenda tidak ditemukan" },
          { status: 404 }
        );
      }

      await prisma.academicCalendar.delete({ where: { id } });

      await logActivity({
        adminId: session.userId,
        adminName: session.name,
        action: "DELETE_CALENDAR",
        details: `Menghapus agenda kalender: "${existing.eventName}"`,
      });

      revalidatePath("/");
      revalidatePath("/akademik");

      return NextResponse.json({ success: true, message: "Agenda berhasil dihapus" });
    }

    if (type === "extracurricular") {
      const existing = await prisma.extracurricular.findUnique({ where: { id } });
      if (!existing) {
        return NextResponse.json(
          { success: false, message: "Ekstrakurikuler tidak ditemukan" },
          { status: 404 }
        );
      }

      await prisma.extracurricular.delete({ where: { id } });

      await logActivity({
        adminId: session.userId,
        adminName: session.name,
        action: "DELETE_EXTRACURRICULAR",
        details: `Menghapus ekstrakurikuler: "${existing.name}"`,
      });

      revalidatePath("/");
      revalidatePath("/akademik");

      return NextResponse.json({ success: true, message: "Ekstrakurikuler berhasil dihapus" });
    }

    return NextResponse.json({ success: false, message: "Tipe tidak valid" }, { status: 400 });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, message: "Akses ditolak" }, { status: 401 });
    }
    console.error("Academic DELETE error:", error);
    return NextResponse.json(
      { success: false, message: err.message || "Gagal menghapus data" },
      { status: 500 }
    );
  }
}
