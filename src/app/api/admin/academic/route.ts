import { NextRequest, NextResponse } from "next/server";
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
    return NextResponse.json({ success: false, message: "Gagal mengambil data akademik" }, { status: 500 });
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
          { success: false, message: "Validasi kalender gagal", errors: parsed.error.flatten().fieldErrors },
          { status: 400 }
        );
      }

      const item = await prisma.academicCalendar.create({
        data: {
          semester: parsed.data.semester,
          academicYear: parsed.data.academicYear,
          eventDate: new Date(parsed.data.eventDate),
          endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
          eventName: parsed.data.eventName,
          description: parsed.data.description,
          isHoliday: parsed.data.isHoliday,
        },
      });

      await logActivity({
        adminId: session.userId,
        adminName: session.name,
        action: "CREATE_CALENDAR",
        details: `Menambahkan agenda kalender: "${item.eventName}"`,
      });

      return NextResponse.json({ success: true, data: item });
    }

    if (type === "extracurricular") {
      const parsed = extracurricularSchema.safeParse(body.data);
      if (!parsed.success) {
        return NextResponse.json(
          { success: false, message: "Validasi ekstrakurikuler gagal", errors: parsed.error.flatten().fieldErrors },
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

      return NextResponse.json({ success: true, data: item });
    }

    return NextResponse.json({ success: false, message: "Tipe tidak valid" }, { status: 400 });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, message: "Akses ditolak" }, { status: 401 });
    }
    return NextResponse.json({ success: false, message: "Gagal menyimpan data" }, { status: 500 });
  }
}
