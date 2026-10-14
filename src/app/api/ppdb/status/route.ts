import { NextRequest, NextResponse } from "next/server";
import { checkPPDBStatusSchema } from "@/lib/validations/ppdb";
import { checkRateLimit } from "@/lib/rate-limit";
import { getPPDBRegistrationByNumber } from "@/lib/storage/db";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "local-ip";
    const rateCheck = checkRateLimit(`ppdb-status:${ip}`, { limit: 15, windowMs: 15 * 60 * 1000 });
    if (!rateCheck.success) {
      return NextResponse.json(
        { success: false, message: "Terlalu banyak permintaan. Silakan tunggu beberapa menit." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = checkPPDBStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Data pencarian tidak valid",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { registrationNumber, parentPhone } = parsed.data;
    const cleanReg = registrationNumber.trim().toUpperCase();

    // 1. Cari di persistent storage
    let registration: any = getPPDBRegistrationByNumber(cleanReg);

    // 2. Jika tidak ada di storage lokal, coba cari di Prisma
    if (!registration) {
      try {
        registration = await prisma.pPDBRegistration.findUnique({
          where: { registrationNumber: cleanReg },
        });
      } catch {
        // Prisma offline
      }
    }

    if (!registration) {
      return NextResponse.json(
        { success: false, message: "Nomor registrasi tidak ditemukan dalam basis data pendaftaran." },
        { status: 404 }
      );
    }

    // Verifikasi kecocokan nomor telepon untuk melindungi data privasi siswa
    const phoneInputClean = parentPhone.replace(/\D/g, "");
    const dbPhoneClean = (registration.parentPhone || "").replace(/\D/g, "");

    const isPhoneMatch =
      phoneInputClean === dbPhoneClean ||
      dbPhoneClean.endsWith(phoneInputClean) ||
      phoneInputClean.endsWith(dbPhoneClean);

    if (!isPhoneMatch) {
      return NextResponse.json(
        {
          success: false,
          message: "Nomor registrasi atau kontak verifikasi tidak sesuai.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        registrationNumber: registration.registrationNumber,
        fullName: registration.fullName,
        gender: registration.gender,
        path: registration.path,
        status: registration.status,
        verificationNotes: registration.verificationNotes,
        createdAt: registration.createdAt,
      },
    });
  } catch (error) {
    console.error("PPDB check status error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan saat memeriksa status pendaftaran." },
      { status: 500 }
    );
  }
}
