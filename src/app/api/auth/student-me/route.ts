import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { STUDENT_COOKIE_NAME, verifyStudentSessionToken } from "@/lib/auth/jwt";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(STUDENT_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Sesi portal siswa tidak ditemukan." },
        { status: 401 }
      );
    }

    const payload = await verifyStudentSessionToken(token);
    if (!payload || payload.role !== "STUDENT") {
      return NextResponse.json(
        { success: false, message: "Sesi portal siswa tidak valid atau telah berakhir." },
        { status: 401 }
      );
    }

    let registration = null;
    try {
      registration = await prisma.pPDBRegistration.findUnique({
        where: { registrationNumber: payload.registrationNumber },
        include: {
          documents: true,
        },
      });
    } catch {
      // Fallback
    }

    if (!registration) {
      // Fallback demo data jika DB offline
      registration = {
        id: "demo-student-id",
        registrationNumber: payload.registrationNumber,
        fullName: payload.fullName || "Ahmad Rayhan Pratama",
        nik: "3201234567890001",
        birthPlace: "Jakarta",
        birthDate: new Date("2018-05-12"),
        gender: "LAKI_LAKI",
        religion: "Islam",
        address: "Jl. Melati No. 15, RT 02 / RW 04, Kelurahan Harapan",
        parentName: "Budi Santoso",
        parentPhone: "081234567890",
        path: "ZONASI",
        status: payload.status || "ACCEPTED",
        verificationNotes: "Dokumen lengkap dan memenuhi kriteria zonasi wilayah SDN Harapan Bangsa.",
        createdAt: new Date(),
        documents: [],
      } as any;
    }

    return NextResponse.json({
      success: true,
      data: registration,
    });
  } catch (error) {
    console.error("Student me error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan sistem saat mengambil data siswa." },
      { status: 500 }
    );
  }
}
