import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ppdbRegistrationSchema } from "@/lib/validations/ppdb";
import { generateRegistrationNumber } from "@/lib/utils";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "local-ip";
    // Limit: 5 pendaftaran per jam per IP
    const rateCheck = checkRateLimit(`ppdb:${ip}`, { limit: 5, windowMs: 60 * 60 * 1000 });
    if (!rateCheck.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Batas pengiriman formulir tercapai. Silakan coba kembali nanti.",
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = ppdbRegistrationSchema.safeParse(body);

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

    const data = parsed.data;

    // Cek apakah PPDB sedang dibuka
    const setting = await prisma.pPDBSetting.findFirst();
    if (setting && !setting.isOpen) {
      return NextResponse.json(
        {
          success: false,
          message: "Pendaftaran PPDB saat ini sedang ditutup.",
        },
        { status: 400 }
      );
    }

    // Generate nomor registrasi unik
    let registrationNumber = generateRegistrationNumber("PPDB");
    let exists = await prisma.pPDBRegistration.findUnique({
      where: { registrationNumber },
    });

    // Handle collision jika kebetulan sama
    while (exists) {
      registrationNumber = generateRegistrationNumber("PPDB");
      exists = await prisma.pPDBRegistration.findUnique({
        where: { registrationNumber },
      });
    }

    const registration = await prisma.pPDBRegistration.create({
      data: {
        registrationNumber,
        fullName: data.fullName.trim(),
        nik: data.nik.trim(),
        birthPlace: data.birthPlace.trim(),
        birthDate: new Date(data.birthDate),
        gender: data.gender,
        religion: data.religion || null,
        address: data.address.trim(),
        rtRw: data.rtRw || null,
        village: data.village || null,
        district: data.district || null,
        parentName: data.parentName.trim(),
        parentPhone: data.parentPhone.trim(),
        parentJob: data.parentJob || null,
        parentIncome: data.parentIncome || null,
        previousSchool: data.previousSchool || null,
        path: data.path,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Pendaftaran PPDB berhasil dikirim",
      data: {
        registrationNumber: registration.registrationNumber,
        fullName: registration.fullName,
        status: registration.status,
        createdAt: registration.createdAt,
      },
    });
  } catch (error) {
    console.error("PPDB register error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada sistem pendaftaran" },
      { status: 500 }
    );
  }
}
