import { z } from "zod";

export const ppdbRegistrationSchema = z.object({
  fullName: z
    .string()
    .min(3, "Nama lengkap calon siswa minimal 3 karakter")
    .max(100, "Nama terlalu panjang"),
  nik: z
    .string()
    .min(16, "NIK harus 16 digit angka")
    .max(16, "NIK harus 16 digit angka")
    .regex(/^\d+$/, "NIK hanya boleh berisi angka"),
  birthPlace: z
    .string()
    .min(2, "Tempat lahir wajib diisi"),
  birthDate: z
    .string()
    .min(1, "Tanggal lahir wajib diisi"),
  gender: z.enum(["LAKI_LAKI", "PEREMPUAN"], {
    error: "Pilih jenis kelamin",
  }),
  religion: z.string().optional(),
  address: z
    .string()
    .min(5, "Alamat lengkap minimal 5 karakter"),
  rt: z.string().optional(),
  rw: z.string().optional(),
  rtRw: z.string().optional(),
  village: z.string().optional(),
  district: z.string().optional(),
  parentName: z
    .string()
    .min(3, "Nama orang tua / wali minimal 3 karakter"),
  parentPhone: z
    .string()
    .min(10, "Nomor telepon / WhatsApp minimal 10 digit")
    .regex(/^(\+62|62|0)[0-9]{9,13}$/, "Format nomor telepon Indonesia tidak valid"),
  parentJob: z.string().optional(),
  parentIncome: z.string().optional(),
  previousSchool: z.string().optional(), // TK/PAUD asal
  path: z.enum(["ZONASI", "AFIRMASI", "PRESTASI", "PERPINDAHAN_TUGAS"]).default("ZONASI"),
});

export type PPDBRegistrationInput = z.infer<typeof ppdbRegistrationSchema>;

export const checkPPDBStatusSchema = z.object({
  registrationNumber: z
    .string()
    .min(5, "Nomor registrasi wajib diisi")
    .trim(),
  parentPhone: z
    .string()
    .min(6, "Nomor telepon / kontak verifikasi wajib diisi")
    .trim(),
});

export type CheckPPDBStatusInput = z.infer<typeof checkPPDBStatusSchema>;

export const updatePPDBStatusSchema = z.object({
  status: z.enum(["PENDING", "VERIFYING", "ACCEPTED", "REJECTED"], {
    error: "Pilih status verifikasi yang valid (PENDING, VERIFYING, ACCEPTED, atau REJECTED)",
  }),
  verificationNotes: z.string().nullable().optional(),
});

export type UpdatePPDBStatusInput = z.infer<typeof updatePPDBStatusSchema>;

