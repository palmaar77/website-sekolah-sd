import { z } from "zod";

export const teacherSchema = z.object({
  name: z.string().min(3, "Nama guru minimal 3 karakter"),
  nip: z.string().optional().nullable(),
  role: z.string().min(2, "Jabatan / tugas wajib diisi"),
  subject: z.string().optional().nullable(),
  education: z.string().optional().nullable(),
  photo: z.string().optional().nullable(),
  order: z.coerce.number().default(0),
  isActive: z.boolean().default(true),
});

export type TeacherInput = z.infer<typeof teacherSchema>;
