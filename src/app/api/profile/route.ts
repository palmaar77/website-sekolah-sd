import { apiSuccess } from "@/lib/api-response";
import prisma from "@/lib/prisma";
import {
  SCHOOL_CONFIG,
  formatAccreditationText,
  cleanDemoMarkers,
} from "@/config/school";

export const dynamic = "force-dynamic";

/**
 * GET /api/profile
 * Endpoint publik untuk mengambil identitas, kontak resmi, dan peta lokasi sekolah.
 * Dapat diakses oleh publik tanpa memerlukan sesi login.
 */
export async function GET() {
  try {
    let profile = await prisma.schoolProfile.findUnique({
      where: { id: "default-profile" },
    });

    if (!profile) {
      profile = await prisma.schoolProfile.findFirst();
    }

    if (profile) {
      return apiSuccess({
        schoolName: cleanDemoMarkers(profile.schoolName) || SCHOOL_CONFIG.name,
        npsn: cleanDemoMarkers(profile.npsn) || SCHOOL_CONFIG.npsn,
        accreditation: formatAccreditationText(profile.accreditation),
        address: cleanDemoMarkers(profile.address) || SCHOOL_CONFIG.address,
        city: cleanDemoMarkers(profile.city) || SCHOOL_CONFIG.city,
        province: cleanDemoMarkers(profile.province) || SCHOOL_CONFIG.province,
        postalCode: profile.postalCode || SCHOOL_CONFIG.postalCode,
        phone: profile.phone || SCHOOL_CONFIG.phone,
        email: profile.email || SCHOOL_CONFIG.email,
        whatsapp: profile.whatsapp || SCHOOL_CONFIG.whatsapp,
        mapEmbedUrl: profile.mapEmbedUrl,
        facebookUrl: profile.facebookUrl || SCHOOL_CONFIG.social.facebook,
        instagramUrl: profile.instagramUrl || SCHOOL_CONFIG.social.instagram,
        youtubeUrl: profile.youtubeUrl || SCHOOL_CONFIG.social.youtube,
      });
    }
  } catch {
    // Graceful fallback jika database PostgreSQL sedang offline
  }

  // Data profil sekolah default berbasis konfigurasi terpusat
  return apiSuccess({
    schoolName: SCHOOL_CONFIG.name,
    npsn: SCHOOL_CONFIG.npsn,
    accreditation: SCHOOL_CONFIG.accreditationLabel,
    address: SCHOOL_CONFIG.address,
    city: SCHOOL_CONFIG.city,
    province: SCHOOL_CONFIG.province,
    postalCode: SCHOOL_CONFIG.postalCode,
    phone: SCHOOL_CONFIG.phone,
    email: SCHOOL_CONFIG.email,
    whatsapp: SCHOOL_CONFIG.whatsapp,
    mapEmbedUrl:
      "https://maps.google.com/maps?q=Jl.%20Pendidikan%20Karakter%20No.%2045%2C%20Kompleks%20Edukasi%20Bahagia&t=&z=15&ie=UTF8&iwloc=&output=embed",
    facebookUrl: SCHOOL_CONFIG.social.facebook,
    instagramUrl: SCHOOL_CONFIG.social.instagram,
    youtubeUrl: SCHOOL_CONFIG.social.youtube,
  });
}
