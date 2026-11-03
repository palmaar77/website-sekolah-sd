import { apiSuccess } from "@/lib/api-response";
import prisma from "@/lib/prisma";

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
        schoolName: profile.schoolName,
        npsn: profile.npsn,
        accreditation: profile.accreditation,
        address: profile.address,
        city: profile.city,
        province: profile.province,
        postalCode: profile.postalCode,
        phone: profile.phone,
        email: profile.email,
        whatsapp: profile.whatsapp,
        mapEmbedUrl: profile.mapEmbedUrl,
        facebookUrl: profile.facebookUrl,
        instagramUrl: profile.instagramUrl,
        youtubeUrl: profile.youtubeUrl,
      });
    }
  } catch {
    // Graceful fallback jika database PostgreSQL sedang offline
  }

  // Data profil sekolah default jika database belum terhubung
  return apiSuccess({
    schoolName: "SD Negeri Harapan Bangsa",
    npsn: "20109999",
    accreditation: "A (Unggul)",
    address: "Jl. Pendidikan Karakter No. 45, Kompleks Edukasi Bahagia",
    city: "Kota Contoh",
    province: "Provinsi Contoh",
    postalCode: "12345",
    phone: "(021) 555-0199",
    email: "info@sdharapanbangsa.sch.id",
    whatsapp: "081234567890",
    mapEmbedUrl: "https://maps.google.com/maps?q=Jl.%20Pendidikan%20Karakter%20No.%2045%2C%20Kompleks%20Edukasi%20Bahagia&t=&z=15&ie=UTF8&iwloc=&output=embed",
    facebookUrl: "https://facebook.com",
    instagramUrl: "https://instagram.com",
    youtubeUrl: "https://youtube.com",
  });
}
