import { NextRequest, NextResponse } from "next/server";
import { ppdbRegistrationSchema } from "@/lib/validations/ppdb";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  getPPDBSetting,
  createPPDBRegistration,
} from "@/lib/storage/db";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "local-ip";
    // Limit: 5 pendaftaran per jam per IP
    const rateCheck = checkRateLimit(`ppdb:${ip}`, { limit: 5, windowMs: 60 * 60 * 1000 });
    if (!rateCheck.success) {
      return NextResponse.json(
        {
          success: false,
          code: "RATE_LIMIT_EXCEEDED",
          message: "Batas pengiriman formulir tercapai. Silakan coba kembali beberapa saat lagi.",
        },
        { status: 429 }
      );
    }

    // 1. Cek apakah layanan PPDB sedang dibuka dan aktif di server
    const setting = getPPDBSetting();
    if (!setting.isOpen) {
      return NextResponse.json(
        {
          success: false,
          code: "SERVICE_INACTIVE",
          message:
            "Layanan pendaftaran PPDB saat ini belum dibuka / sedang ditutup oleh panitia sekolah. Silakan pantau pengumuman resmi jadwal pembukaan pendaftaran.",
        },
        { status: 400 }
      );
    }

    // 2. Validasi input di server dengan Zod
    const body = await request.json();
    const parsed = ppdbRegistrationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          code: "VALIDATION_ERROR",
          message: "Data formulir tidak lengkap atau format salah. Mohon periksa kembali isian Anda.",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Normalisasi dan hitung RT/RW
    const rtClean = data.rt?.trim() || null;
    const rwClean = data.rw?.trim() || null;
    const computedRtRw =
      data.rtRw?.trim() ||
      (rtClean && rwClean
        ? `${rtClean} / ${rwClean}`
        : rtClean || rwClean || null);

    // 3. Simpan ke sistem penyimpanan nyata (Persistent Storage)
    let registration;
    try {
      registration = createPPDBRegistration({
        fullName: data.fullName.trim(),
        nik: data.nik.trim(),
        birthPlace: data.birthPlace.trim(),
        birthDate: new Date(data.birthDate).toISOString(),
        gender: data.gender,
        religion: data.religion || null,
        address: data.address.trim(),
        rt: rtClean,
        rw: rwClean,
        rtRw: computedRtRw,
        village: data.village || null,
        district: data.district || null,
        parentName: data.parentName.trim(),
        parentPhone: data.parentPhone.trim(),
        parentJob: data.parentJob || null,
        parentIncome: data.parentIncome || null,
        previousSchool: data.previousSchool || null,
        path: data.path,
      });
    } catch (saveError: any) {
      return NextResponse.json(
        {
          success: false,
          code: "DUPLICATE_REGISTRATION",
          message: saveError.message || "Gagal menyimpan pendaftaran ke database.",
        },
        { status: 400 }
      );
    }

    // Coba simpan ke database Prisma bila database PostgreSQL aktif
    try {
      await prisma.pPDBRegistration.create({
        data: {
          registrationNumber: registration.registrationNumber,
          fullName: registration.fullName,
          nik: registration.nik,
          birthPlace: registration.birthPlace,
          birthDate: new Date(registration.birthDate),
          gender: registration.gender,
          religion: registration.religion || null,
          address: registration.address,
          rtRw: registration.rtRw || null,
          village: registration.village || null,
          district: registration.district || null,
          parentName: registration.parentName,
          parentPhone: registration.parentPhone,
          parentJob: registration.parentJob || null,
          parentIncome: registration.parentIncome || null,
          previousSchool: registration.previousSchool || null,
          path: registration.path,
          status: "PENDING",
        },
      });
    } catch {
      // Prisma offline, penyimpanan disk telah berhasil mencatat data secara permanen
    }

    return NextResponse.json({
      success: true,
      message: "Pendaftaran PPDB berhasil tercatat di sistem sekolah.",
      data: {
        registrationNumber: registration.registrationNumber,
        fullName: registration.fullName,
        nik: registration.nik,
        path: registration.path,
        status: registration.status,
        createdAt: registration.createdAt,
      },
    });
  } catch (error: any) {
    console.error("PPDB register error:", error);
    return NextResponse.json(
      {
        success: false,
        code: "SERVER_ERROR",
        message: "Terjadi kesalahan internal pada sistem pendaftaran.",
      },
      { status: 500 }
    );
  }
}
