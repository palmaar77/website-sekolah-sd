import { z } from "zod";

export const newsSchema = z.object({
  title: z
    .string()
    .min(5, "Judul berita minimal 5 karakter")
    .max(200, "Judul terlalu panjang"),
  slug: z.string().optional(),
  excerpt: z
    .string()
    .min(10, "Ringkasan berita minimal 10 karakter")
    .max(300, "Ringkasan maksimal 300 karakter"),
  content: z
    .string()
    .min(20, "Konten berita minimal 20 karakter"),
  coverImage: z.string().optional().nullable(),
  category: z
    .string()
    .min(2, "Kategori wajib dipilih"),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("PUBLISHED"),
  isFeatured: z.boolean().default(false),
});

export type NewsInput = z.infer<typeof newsSchema>;

export const announcementSchema = z.object({
  title: z
    .string()
    .min(5, "Judul pengumuman minimal 5 karakter")
    .max(200, "Judul terlalu panjang"),
  content: z
    .string()
    .min(10, "Isi pengumuman minimal 10 karakter"),
  isImportant: z.boolean().default(false),
  isActive: z.boolean().default(true),
  startDate: z.string().optional(),
  endDate: z.string().optional().nullable(),
});

export type AnnouncementInput = z.infer<typeof announcementSchema>;
