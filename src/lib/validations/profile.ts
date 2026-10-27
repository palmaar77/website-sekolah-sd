import { z } from "zod";

export const schoolProfileSchema = z.object({
  schoolName: z.string().trim().min(1, "Nama sekolah wajib diisi"),
  npsn: z.string().trim().min(1, "NPSN wajib diisi"),
  accreditation: z.string().trim().min(1, "Akreditasi wajib diisi"),
  address: z.string().trim().min(1, "Alamat wajib diisi"),
  city: z.string().trim().min(1, "Kota/Kabupaten wajib diisi"),
  province: z.string().trim().min(1, "Provinsi wajib diisi"),
  postalCode: z.string().optional().nullable(),
  phone: z.string().trim().min(1, "Nomor telepon wajib diisi"),
  email: z.string().trim().email("Format email sekolah tidak valid"),
  whatsapp: z.string().optional().nullable(),
  principalName: z.string().trim().min(1, "Nama Kepala Sekolah wajib diisi"),
  principalNip: z.string().optional().nullable(),
  principalMessage: z.string().trim().min(1, "Sambutan Kepala Sekolah wajib diisi"),
  principalPhoto: z.string().optional().nullable(),
  vision: z.string().trim().min(1, "Visi sekolah wajib diisi"),
  mission: z.string().trim().min(1, "Misi sekolah wajib diisi"),
  goals: z.string().trim().min(1, "Tujuan sekolah wajib diisi"),
  history: z.string().trim().min(1, "Sejarah sekolah wajib diisi"),
  heroHeadline: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val && val.trim().length > 0 ? val.trim() : "Membentuk Generasi Cerdas, Berakhlak Mulia & Ceria")),
  heroSubheadline: z
    .string()
    .optional()
    .nullable()
    .transform((val) =>
      val && val.trim().length > 0
        ? val.trim()
        : "Sekolah Dasar berprestasi dengan fasilitas pembelajaran ramah anak, guru berpengalaman, dan lingkungan kondusif untuk menumbuhkan karakter profil Pelajar Pancasila."
    ),
  studentCount: z.coerce.number().min(0).default(480),
  teacherCount: z.coerce.number().min(0).default(28),
  classroomCount: z.coerce.number().min(0).default(18),
  extracurricularCount: z.coerce.number().min(0).default(12),
  mapEmbedUrl: z.string().optional().nullable(),
  facebookUrl: z.string().optional().nullable(),
  instagramUrl: z.string().optional().nullable(),
  youtubeUrl: z.string().optional().nullable(),
});

export type SchoolProfileInput = z.infer<typeof schoolProfileSchema>;

export const facilitySchema = z.object({
  name: z.string().trim().min(1, "Nama fasilitas wajib diisi"),
  description: z.string().trim().min(1, "Deskripsi fasilitas wajib diisi"),
  imageUrl: z.string().optional().nullable(),
  iconName: z.string().optional().nullable(),
  order: z.coerce.number().default(0),
});

export type FacilityInput = z.infer<typeof facilitySchema>;
