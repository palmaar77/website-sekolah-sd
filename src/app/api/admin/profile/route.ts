import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { schoolProfileSchema } from "@/lib/validations/profile";
import { logActivity } from "@/lib/audit";
import { sanitizeInput } from "@/lib/security/sanitize";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function GET() {
  try {
    let profile = await prisma.schoolProfile.findUnique({
      where: { id: "default-profile" },
    });

    if (!profile) {
      profile = await prisma.schoolProfile.findFirst();
    }

    return apiSuccess(profile);
  } catch (error) {
    return handleApiError(error, "Gagal mengambil data profil sekolah");
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const parsed = schoolProfileSchema.safeParse(body);

    if (!parsed.success) {
      return handleApiError(parsed.error);
    }

    const data = parsed.data;

    // Sanitasi teks profil sekolah
    const cleanData = {
      ...data,
      schoolName: sanitizeInput(data.schoolName),
      address: sanitizeInput(data.address),
      vision: sanitizeInput(data.vision),
      history: sanitizeInput(data.history),
      mission: sanitizeInput(data.mission),
      goals: sanitizeInput(data.goals),
      principalName: sanitizeInput(data.principalName),
      principalMessage: sanitizeInput(data.principalMessage),
    };

    // Cari profil yang sudah ada untuk memperbarui ID yang tepat
    const existing =
      (await prisma.schoolProfile.findUnique({
        where: { id: "default-profile" },
      })) || (await prisma.schoolProfile.findFirst());

    const profileId = existing ? existing.id : "default-profile";

    const updated = await prisma.schoolProfile.upsert({
      where: { id: profileId },
      update: cleanData,
      create: {
        id: profileId,
        ...cleanData,
      },
    });

    await logActivity({
      adminId: session.userId,
      adminName: session.name,
      action: "UPDATE_PROFILE",
      details: "Memperbarui informasi profil, visi, misi, dan identitas sekolah",
    });

    return apiSuccess(updated);
  } catch (error: unknown) {
    return handleApiError(error, "Gagal memperbarui profil sekolah");
  }
}
