import { z } from "zod";

export const calendarSchema = z.object({
  semester: z.string().min(1, "Semester wajib dipilih"),
  academicYear: z.string().min(4, "Tahun ajaran wajib diisi (contoh: 2025/2026)"),
  eventDate: z.string().min(1, "Tanggal kegiatan wajib diisi"),
  endDate: z.string().optional().nullable(),
  eventName: z.string().min(3, "Nama agenda / kegiatan minimal 3 karakter"),
  description: z.string().optional().nullable(),
  isHoliday: z.boolean().default(false),
});

export type CalendarInput = z.infer<typeof calendarSchema>;

export const extracurricularSchema = z.object({
  name: z.string().min(3, "Nama ekstrakurikuler minimal 3 karakter"),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  coach: z.string().optional().nullable(),
  schedule: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export type ExtracurricularInput = z.infer<typeof extracurricularSchema>;

export const achievementSchema = z.object({
  title: z.string().min(3, "Judul prestasi minimal 3 karakter"),
  studentName: z.string().min(3, "Nama siswa / tim peraih prestasi minimal 3 karakter"),
  competition: z.string().min(3, "Nama kompetisi / lomba"),
  level: z.string().min(2, "Tingkat lomba (Kecamatan/Kota/Provinsi/Nasional)"),
  rank: z.string().min(2, "Peringkat / juara (contoh: Juara 1, Medali Emas)"),
  year: z.coerce.number().min(2000).max(2100),
  certificateImage: z.string().optional().nullable(),
});

export type AchievementInput = z.infer<typeof achievementSchema>;
