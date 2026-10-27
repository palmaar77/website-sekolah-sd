import { z } from "zod";

export const contactMessageSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(100),
  email: z.string().email("Format email tidak valid"),
  phone: z.string().optional().nullable(),
  subject: z.string().max(150).optional().nullable(),
  message: z.string().min(10, "Pesan minimal 10 karakter").max(2000),
  honeypot: z.string().max(0, "Bot terdeteksi").optional(), // Honeypot field
});

export type ContactMessageInput = z.infer<typeof contactMessageSchema>;
