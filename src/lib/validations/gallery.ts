import { z } from "zod";

export const galleryItemSchema = z.object({
  title: z.string().min(3, "Judul foto minimal 3 karakter"),
  imageUrl: z.string().min(5, "URL foto wajib diisi"),
  description: z.string().optional().nullable(),
  categoryId: z.string().min(1, "Kategori galeri wajib dipilih"),
  isFeatured: z.boolean().default(false),
});

export type GalleryItemInput = z.infer<typeof galleryItemSchema>;

export const galleryCategorySchema = z.object({
  name: z.string().min(2, "Nama kategori minimal 2 karakter"),
  description: z.string().optional().nullable(),
  order: z.coerce.number().default(0),
});

export type GalleryCategoryInput = z.infer<typeof galleryCategorySchema>;
