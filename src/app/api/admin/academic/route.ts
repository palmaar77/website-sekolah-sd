import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { calendarSchema, extracurricularSchema } from "@/lib/validations/academic";
import { logActivity } from "@/lib/audit";
import { sanitizeInput } from "@/lib/security/sanitize";
import {
  apiBadRequest,
  apiCreated,
  apiNotFound,
  apiSuccess,
  handleApiError,
} from "@/lib/api-response";

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

    return apiSuccess({
      calendars,
      extracurriculars,
      achievements,
    });
  } catch (error) {
    return handleApiError(error, "Gagal mengambil data akademik");
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
        return handleApiError(parsed.error);
      }

      const item = await prisma.academicCalendar.create({
        data: {
          semester: sanitizeInput(parsed.data.semester),
          academicYear: sanitizeInput(parsed.data.academicYear),
          eventDate: new Date(parsed.data.eventDate),
          endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
          eventName: sanitizeInput(parsed.data.eventName),
          description: parsed.data.description ? sanitizeInput(parsed.data.description) : null,
          isHoliday: parsed.data.isHoliday,
        },
      });

      await logActivity({
        adminId: session.userId,
        adminName: session.name,
        action: "CREATE_CALENDAR",
        details: `Menambahkan agenda kalender: "${item.eventName}"`,
      });

      revalidatePath("/");
      revalidatePath("/akademik");

      return apiCreated(item, "Agenda kalender berhasil ditambahkan.");
    }

    if (type === "extracurricular") {
      const parsed = extracurricularSchema.safeParse(body.data);
      if (!parsed.success) {
        return handleApiError(parsed.error);
      }

      const cleanData = {
        ...parsed.data,
        name: sanitizeInput(parsed.data.name),
        description: sanitizeInput(parsed.data.description),
        coach: parsed.data.coach ? sanitizeInput(parsed.data.coach) : null,
        schedule: parsed.data.schedule ? sanitizeInput(parsed.data.schedule) : null,
      };

      const item = await prisma.extracurricular.create({
        data: cleanData,
      });

      await logActivity({
        adminId: session.userId,
        adminName: session.name,
        action: "CREATE_EXTRACURRICULAR",
        details: `Menambahkan ekstrakurikuler: "${item.name}"`,
      });

      revalidatePath("/");
      revalidatePath("/akademik");

      return apiCreated(item, "Ekstrakurikuler berhasil ditambahkan.");
    }

    return apiBadRequest("Tipe data tidak valid. Harus 'calendar' atau 'extracurricular'.");
  } catch (error: unknown) {
    return handleApiError(error, "Gagal menyimpan data akademik");
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type"); // "calendar" | "extracurricular"

    if (!id) {
      return apiBadRequest("ID wajib disertakan.");
    }

    if (type === "calendar") {
      const existing = await prisma.academicCalendar.findUnique({ where: { id } });
      if (!existing) {
        return apiNotFound("Agenda tidak ditemukan.");
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

      return apiSuccess({ message: "Agenda berhasil dihapus." });
    }

    if (type === "extracurricular") {
      const existing = await prisma.extracurricular.findUnique({ where: { id } });
      if (!existing) {
        return apiNotFound("Ekstrakurikuler tidak ditemukan.");
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

      return apiSuccess({ message: "Ekstrakurikuler berhasil dihapus." });
    }

    return apiBadRequest("Tipe tidak valid. Harus 'calendar' atau 'extracurricular'.");
  } catch (error: unknown) {
    return handleApiError(error, "Gagal menghapus data akademik");
  }
}
