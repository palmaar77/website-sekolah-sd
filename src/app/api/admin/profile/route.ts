import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { schoolProfileSchema } from "@/lib/validations/profile";
import { logActivity } from "@/lib/audit";
import { sanitizeInput, sanitizeObject } from "@/lib/security/sanitize";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { parseGoogleMapsEmbedUrl } from "@/lib/maps";
import { SCHOOL_CONFIG } from "@/config/school";

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

    // Bersihkan URL embed peta jika ada
    const cleanMapUrl = data.mapEmbedUrl
      ? parseGoogleMapsEmbedUrl(data.mapEmbedUrl, data.address)
      : null;

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
      mapEmbedUrl: cleanMapUrl,
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
      details: "Memperbarui informasi profil, lokasi peta, dan identitas sekolah",
    });

    return apiSuccess(updated);
  } catch (error: unknown) {
    return handleApiError(error, "Gagal memperbarui profil sekolah");
  }
}

/**
 * PATCH /api/admin/profile
 * Pembaruan cepat khusus Peta Lokasi / Kontak Sekolah (bisa dirubah kemana saja dan kapan saja)
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const sanitized = sanitizeObject(body);

    const existing =
      (await prisma.schoolProfile.findUnique({
        where: { id: "default-profile" },
      })) || (await prisma.schoolProfile.findFirst());

    const profileId = existing ? existing.id : "default-profile";

    const updatePayload: Record<string, unknown> = {};

    if (sanitized.mapEmbedUrl !== undefined) {
      updatePayload.mapEmbedUrl = parseGoogleMapsEmbedUrl(
        sanitized.mapEmbedUrl,
        sanitized.address || existing?.address || "SD Negeri Harapan Bangsa"
      );
    }

    if (sanitized.address !== undefined) {
      updatePayload.address = sanitizeInput(sanitized.address);
    }
    if (sanitized.phone !== undefined) {
      updatePayload.phone = sanitizeInput(sanitized.phone);
    }
    if (sanitized.email !== undefined) {
      updatePayload.email = sanitizeInput(sanitized.email);
    }
    if (sanitized.whatsapp !== undefined) {
      updatePayload.whatsapp = sanitizeInput(sanitized.whatsapp);
    }

    const updated = await prisma.schoolProfile.upsert({
      where: { id: profileId },
      update: updatePayload,
      create: {
        id: profileId,
        schoolName: SCHOOL_CONFIG.name,
        npsn: SCHOOL_CONFIG.npsn,
        accreditation: SCHOOL_CONFIG.accreditationGrade,
        address: sanitized.address || SCHOOL_CONFIG.address,
        city: SCHOOL_CONFIG.city,
        province: SCHOOL_CONFIG.province,
        phone: sanitized.phone || SCHOOL_CONFIG.phone,
        email: sanitized.email || SCHOOL_CONFIG.email,
        whatsapp: sanitized.whatsapp || SCHOOL_CONFIG.whatsapp,
        principalName: SCHOOL_CONFIG.principal.name,
        principalMessage: SCHOOL_CONFIG.principal.message,
        vision: "Cerdas Berkarakter",
        mission: "Pembelajaran Berkualitas",
        goals: "Prestasi Unggul",
        history: "Didirikan demi kemajuan bangsa.",
        heroHeadline: "Membentuk Generasi Cerdas dan Berkarakter",
        heroSubheadline: "Sekolah dasar unggulan dengan kurikulum modern dan pembinaan akhlak mulia.",
        ...updatePayload,
      },
    });

    await logActivity({
      adminId: session.userId,
      adminName: session.name,
      action: "UPDATE_PROFILE_MAP",
      details: "Memperbarui peta lokasi Google Maps sekolah",
    });

    return apiSuccess(updated, {
      message: "Peta lokasi berhasil diperbarui!",
    });
  } catch (error: unknown) {
    return handleApiError(error, "Gagal memperbarui lokasi peta sekolah");
  }
}
