import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { teacherSchema } from "@/lib/validations/teacher";
import { logActivity } from "@/lib/audit";
import { sanitizeInput } from "@/lib/security/sanitize";
import { apiCreated, apiSuccess, handleApiError } from "@/lib/api-response";

export async function GET() {
  try {
    let data: any[] = [];
    try {
      data = await prisma.teacher.findMany({
        orderBy: { order: "asc" },
      });
    } catch {
      data = [
        {
          id: "t-1",
          name: "Hj. Siti Aminah, M.Pd.",
          nip: "197508122000032001",
          role: "Kepala Sekolah",
          subject: "Manajemen Pendidikan",
          education: "S2 Magister Pendidikan UNJ",
          photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80",
          order: 1,
          isActive: true,
        },
        {
          id: "t-2",
          name: "Bambang Sudarmono, S.Pd.",
          nip: "198203152006041005",
          role: "Wakil Kepala Sekolah & Guru Kelas 6",
          subject: "Guru Kelas 6",
          education: "S1 PGSD UPI",
          photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80",
          order: 2,
          isActive: true,
        },
      ];
    }
    return apiSuccess(data);
  } catch (error) {
    return handleApiError(error, "Gagal mengambil data guru");
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const parsed = teacherSchema.safeParse(body);

    if (!parsed.success) {
      return handleApiError(parsed.error);
    }

    const cleanData = {
      ...parsed.data,
      name: sanitizeInput(parsed.data.name),
      nip: parsed.data.nip ? parsed.data.nip.trim() : null,
      role: sanitizeInput(parsed.data.role),
      subject: parsed.data.subject ? sanitizeInput(parsed.data.subject) : null,
      education: parsed.data.education ? sanitizeInput(parsed.data.education) : null,
    };

    const item = await prisma.teacher.create({
      data: cleanData,
    });

    await logActivity({
      adminId: session.userId,
      adminName: session.name,
      action: "CREATE_TEACHER",
      details: `Menambahkan guru/staf: "${item.name}"`,
    });

    return apiCreated(item, "Data guru berhasil ditambahkan.");
  } catch (error: unknown) {
    return handleApiError(error, "Gagal menambahkan data guru");
  }
}
