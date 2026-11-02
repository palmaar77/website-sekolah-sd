import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { contactMessageSchema } from "@/lib/validations/contact";
import { checkRateLimit } from "@/lib/rate-limit";
import { sanitizeInput } from "@/lib/security/sanitize";
import {
  apiBadRequest,
  apiSuccess,
  apiTooManyRequests,
  handleApiError,
} from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "local-ip";
    const rateCheck = checkRateLimit(`contact:${ip}`, { limit: 5, windowMs: 10 * 60 * 1000 });
    if (!rateCheck.success) {
      return apiTooManyRequests("Terlalu banyak pesan terkirim. Silakan tunggu beberapa menit.");
    }

    const body = await request.json();
    const parsed = contactMessageSchema.safeParse(body);

    if (!parsed.success) {
      return apiBadRequest("Data formulir tidak valid", parsed.error.flatten().fieldErrors);
    }

    const { name, email, phone, subject, message, honeypot } = parsed.data;

    // Proteksi Honeypot Anti-Bot (OWASP A04: Insecure Design)
    if (honeypot && honeypot.length > 0) {
      return apiBadRequest("Pesan terdeteksi sebagai spam.");
    }

    // Sanitasi XSS seluruh input pengguna sebelum penyimpanan
    const cleanName = sanitizeInput(name);
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone ? sanitizeInput(phone) : null;
    const cleanSubject = sanitizeInput(subject || "Pertanyaan / Pesan Umum");
    const cleanMessage = sanitizeInput(message);

    await prisma.contactMessage.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        subject: cleanSubject,
        message: cleanMessage,
        ipAddress: ip,
      },
    });

    return apiSuccess({
      message: "Pesan Anda berhasil dikirim. Pihak sekolah akan segera merespons.",
    });
  } catch (error) {
    return handleApiError(error, "Gagal mengirim pesan ke sistem sekolah.");
  }
}
