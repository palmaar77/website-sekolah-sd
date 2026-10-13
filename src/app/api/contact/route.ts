import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { contactMessageSchema } from "@/lib/validations/contact";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "local-ip";
    const rateCheck = checkRateLimit(`contact:${ip}`, { limit: 5, windowMs: 10 * 60 * 1000 });
    if (!rateCheck.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Terlalu banyak pesan terkirim. Silakan tunggu beberapa menit.",
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = contactMessageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Data formulir tidak valid",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, email, phone, subject, message, honeypot } = parsed.data;

    // Proteksi Honeypot: jika ada isian honeypot, ini bot
    if (honeypot && honeypot.length > 0) {
      return NextResponse.json(
        { success: false, message: "Pesan terdeteksi sebagai spam." },
        { status: 400 }
      );
    }

    await prisma.contactMessage.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone ? phone.trim() : null,
        subject: subject.trim(),
        message: message.trim(),
        ipAddress: ip,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Pesan Anda berhasil dikirim. Pihak sekolah akan segera merespons.",
    });
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengirim pesan" },
      { status: 500 }
    );
  }
}
