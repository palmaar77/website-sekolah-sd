import { z } from "zod";

export const schoolProfileSchema = z.object({
  schoolName: z.string().min(3, "Nama sekolah minimal 3 karakter"),
  npsn: z.string().min(5, "NPSN wajib diisi"),
  accreditation: z.string().min(1, "Akreditasi wajib diisi"),
  address: z.string().min(5, "Alamat wajib diisi"),
  city: z.string().min(2, "Kota/Kabupaten wajib diisi"),
  province: z.string().min(2, "Provinsi wajib diisi"),
  postalCode: z.string().optional().nullable(),
  phone: z.string().min(6, "Nomor telepon wajib diisi"),
  email: z.string().email("Format email sekolah tidak valid"),
  whatsapp: z.string().optional().nullable(),
  principalName: z.string().min(3, "Nama Kepala Sekolah wajib diisi"),
  principalNip: z.string().optional().nullable(),
  principalMessage: z.string().min(20, "Sambutan Kepala Sekolah minimal 20 karakter"),
  principalPhoto: z.string().optional().nullable(),
  vision: z.string().min(10, "Visi sekolah minimal 10 karakter"),
  mission: z.string().min(10, "Misi sekolah minimal 10 karakter"),
  goals: z.string().min(10, "Tujuan sekolah minimal 10 karakter"),
  history: z.string().min(20, "Sejarah sekolah minimal 20 karakter"),
  heroHeadline: z.string().min(5, "Headline hero minimal 5 karakter"),
  heroSubheadline: z.string().min(10, "Subheadline hero minimal 10 karakter"),
  studentCount: z.coerce.number().min(0),
  teacherCount: z.coerce.number().min(0),
  classroomCount: z.coerce.number().min(0),
  extracurricularCount: z.coerce.number().min(0),
  mapEmbedUrl: z.string().optional().nullable(),
  facebookUrl: z.string().optional().nullable(),
  instagramUrl: z.string().optional().nullable(),
  youtubeUrl: z.string().optional().nullable(),
});

export type SchoolProfileInput = z.infer<typeof schoolProfileSchema>;

export const facilitySchema = z.object({
  name: z.string().min(3, "Nama fasilitas minimal 3 karakter"),
  description: z.string().min(5, "Deskripsi fasilitas minimal 5 karakter"),
  imageUrl: z.string().optional().nullable(),
  iconName: z.string().optional().nullable(),
  order: z.coerce.number().default(0),
});

export type FacilityInput = z.infer<typeof facilitySchema>;
