import { z } from "zod";

export const createPaymentSchema = z.object({
  studentRegistrationNumber: z
    .string()
    .trim()
    .min(3, "Nomor registrasi / NISN siswa wajib diisi"),
  studentName: z
    .string()
    .trim()
    .min(2, "Nama lengkap siswa wajib diisi"),
  studentClass: z
    .string()
    .trim()
    .min(1, "Kelas / rombel siswa wajib diisi"),
  parentName: z
    .string()
    .trim()
    .min(2, "Nama orang tua / wali wajib diisi"),
  parentPhone: z
    .string()
    .trim()
    .min(8, "Nomor telepon / WhatsApp minimal 8 digit")
    .regex(/^[0-9+ -]+$/, "Format nomor telepon tidak valid"),
  parentEmail: z
    .string()
    .trim()
    .email("Format email tidak valid")
    .optional()
    .or(z.literal("")),
  paymentType: z.enum(["SPP", "UANG_GEDUNG", "SERAGAM", "KEGIATAN"], {
    error: "Jenis pembayaran tidak valid",
  }),
  paymentTitle: z.string().trim().optional(),
  period: z
    .string()
    .trim()
    .min(1, "Periode pembayaran wajib diisi"),
  academicYear: z.string().trim().optional(),
  amount: z.coerce
    .number()
    .min(10000, "Nominal pembayaran minimal Rp 10.000"),
  adminFee: z.coerce.number().min(0).optional(),
  paymentMethod: z.enum(
    [
      "QRIS",
      "BCA_VA",
      "MANDIRI_VA",
      "BRI_VA",
      "BNI_VA",
      "GOPAY",
      "SHOPEEPAY",
      "OVO",
      "TUNAI",
    ],
    { error: "Metode pembayaran tidak valid" }
  ),
  paymentGateway: z
    .enum(["MIDTRANS", "XENDIT", "SIMULATION"])
    .optional()
    .default("MIDTRANS"),
  notes: z.string().trim().max(500, "Catatan maksimal 500 karakter").optional(),
});

export type CreatePaymentSchemaInput = z.infer<typeof createPaymentSchema>;
