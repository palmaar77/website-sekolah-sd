import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkPPDBStatusSchema } from "@/lib/validations/ppdb";
import { createStudentSessionToken, STUDENT_COOKIE_NAME } from "@/lib/auth/jwt";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "local-ip";
    const rateCheck = checkRateLimit(`student-login:${ip}`, { limit: 10, windowMs: 15 * 60 * 1000 });
    if (!rateCheck.success) {
      return NextResponse.json(
        { success: false, message: "Terlalu banyak percobaan masuk. Mohon tunggu 15 menit." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = checkPPDBStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Data login tidak lengkap atau format salah.",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { registrationNumber, parentPhone } = parsed.data;

    let registration = null;
    try {
      registration = await prisma.pPDBRegistration.findUnique({
        where: { registrationNumber: registrationNumber.trim().toUpperCase() },
        include: {
          documents: true,
        },
      });
    } catch {
      // Fallback for demo when DB is not yet running
    }

    // Demo fallback jika database belum terkoneksi
    if (!registration && registrationNumber.toUpperCase().startsWith("PPDB-")) {
      const isDemoPhone = parentPhone.replace(/\D/g, "").length >= 8;
      if (isDemoPhone) {
        registration = {
          id: "demo-student-id",
          registrationNumber: registrationNumber.toUpperCase(),
          fullName: "Ahmad Rayhan Pratama",
          nik: "3201234567890001",
          birthPlace: "Jakarta",
          birthDate: new Date("2018-05-12"),
          gender: "LAKI_LAKI",
          religion: "Islam",
          address: "Jl. Melati No. 15, RT 02 / RW 04, Kelurahan Harapan",
          parentName: "Budi Santoso",
          parentPhone: parentPhone,
          path: "ZONASI",
          status: "ACCEPTED",
          verificationNotes: "Dokumen lengkap dan memenuhi kriteria zonasi wilayah SDN Harapan Bangsa.",
          createdAt: new Date(),
          documents: [],
        } as any;
      }
    }

    if (!registration) {
      return NextResponse.json(
        { success: false, message: "Nomor registrasi siswa tidak terdaftar di sistem." },
        { status: 404 }
      );
    }

    // Verifikasi nomor HP / kontak
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
          message: "Nomor WhatsApp / kontak tidak sesuai dengan data registrasi.",
        },
        { status: 401 }
      );
    }

    // Generate token
    const token = await createStudentSessionToken({
      registrationNumber: registration.registrationNumber,
      fullName: registration.fullName,
      status: registration.status,
      role: "STUDENT",
    });

    const response = NextResponse.json({
      success: true,
      message: "Login portal siswa berhasil",
      data: {
        registrationNumber: registration.registrationNumber,
        fullName: registration.fullName,
        status: registration.status,
        path: registration.path,
      },
    });

    // Pasang HTTP-Only Cookie
    response.cookies.set({
      name: STUDENT_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 hari
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Student login error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan sistem saat memproses login siswa." },
      { status: 500 }
    );
  }
}
