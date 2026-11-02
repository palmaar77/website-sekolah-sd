import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { announcementSchema } from "@/lib/validations/news";
import { logActivity } from "@/lib/audit";
import { getAllAnnouncements, createAnnouncement } from "@/lib/storage/db";
import { sanitizeInput } from "@/lib/security/sanitize";
import { apiCreated, apiSuccess, handleApiError } from "@/lib/api-response";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    await requireAuth(["SUPER_ADMIN", "ADMIN", "STAFF"]);
    const data = getAllAnnouncements();
    return apiSuccess(data);
  } catch (error: unknown) {
    return handleApiError(error, "Gagal mengambil data pengumuman");
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(["SUPER_ADMIN", "ADMIN", "STAFF"]);
    const body = await request.json();
    const parsed = announcementSchema.safeParse(body);

    if (!parsed.success) {
      return handleApiError(parsed.error);
    }

    // Sanitasi teks pengumuman (OWASP A03)
    const cleanTitle = sanitizeInput(parsed.data.title);
    const cleanContent = sanitizeInput(parsed.data.content);

    // 1. Simpan ke sistem penyimpanan nyata
    const item = createAnnouncement({
      title: cleanTitle,
      content: cleanContent,
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
          title: cleanTitle,
          content: cleanContent,
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

    return apiCreated(item, "Pengumuman berhasil dibuat.");
  } catch (error: unknown) {
    return handleApiError(error, "Gagal membuat pengumuman");
  }
}
