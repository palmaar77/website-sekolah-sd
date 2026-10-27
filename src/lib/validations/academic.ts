import { z } from "zod";

export const calendarSchema = z.object({
  semester: z.string().trim().min(1, "Semester wajib dipilih"),
  academicYear: z.string().trim().min(1, "Tahun ajaran wajib diisi"),
  eventDate: z.string().trim().min(1, "Tanggal kegiatan wajib diisi"),
  endDate: z.string().optional().nullable(),
  eventName: z.string().trim().min(1, "Nama agenda / kegiatan wajib diisi"),
  description: z.string().optional().nullable(),
  isHoliday: z.boolean().default(false),
});

export type CalendarInput = z.infer<typeof calendarSchema>;

export const extracurricularSchema = z.object({
  name: z.string().trim().min(1, "Nama ekstrakurikuler wajib diisi"),
  description: z.string().trim().min(1, "Deskripsi wajib diisi"),
  coach: z.string().optional().nullable(),
  schedule: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export type ExtracurricularInput = z.infer<typeof extracurricularSchema>;

export const achievementSchema = z.object({
  title: z.string().trim().min(1, "Judul prestasi wajib diisi"),
  studentName: z.string().trim().min(1, "Nama siswa / tim peraih prestasi wajib diisi"),
  competition: z.string().trim().min(1, "Nama kompetisi / lomba wajib diisi"),
  level: z.string().trim().min(1, "Tingkat lomba wajib diisi"),
  rank: z.string().trim().min(1, "Peringkat / juara wajib diisi"),
  year: z.coerce.number().min(2000).max(2100),
  certificateImage: z.string().optional().nullable(),
});

export type AchievementInput = z.infer<typeof achievementSchema>;
