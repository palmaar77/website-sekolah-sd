import { NextRequest } from "next/server";
import { ppdbRegistrationSchema } from "@/lib/validations/ppdb";
import { checkRateLimit } from "@/lib/rate-limit";
import { sanitizeInput } from "@/lib/security/sanitize";
import {
  apiBadRequest,
  apiCreated,
  apiTooManyRequests,
  handleApiError,
} from "@/lib/api-response";
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
      return apiTooManyRequests(
        "Batas pengiriman formulir tercapai. Silakan coba kembali beberapa saat lagi."
      );
    }

    // 1. Cek apakah layanan PPDB sedang dibuka dan aktif di server
    const setting = getPPDBSetting();
    if (!setting.isOpen) {
      return apiBadRequest(
        "Layanan pendaftaran PPDB saat ini belum dibuka / sedang ditutup oleh panitia sekolah. Silakan pantau pengumuman resmi jadwal pembukaan pendaftaran.",
        undefined,
        "SERVICE_INACTIVE"
      );
    }

    // 2. Validasi input di server dengan Zod
    const body = await request.json();
    const parsed = ppdbRegistrationSchema.safeParse(body);

    if (!parsed.success) {
      return apiBadRequest(
        "Data formulir tidak lengkap atau format salah. Mohon periksa kembali isian Anda.",
        parsed.error.flatten().fieldErrors,
        "VALIDATION_ERROR"
      );
    }

    const data = parsed.data;

    // Normalisasi dan hitung RT/RW
    const rtClean = data.rt ? sanitizeInput(data.rt) : null;
    const rwClean = data.rw ? sanitizeInput(data.rw) : null;
    const computedRtRw =
      (data.rtRw ? sanitizeInput(data.rtRw) : null) ||
      (rtClean && rwClean
        ? `${rtClean} / ${rwClean}`
        : rtClean || rwClean || null);

    // Sanitasi XSS seluruh isian teks calon siswa
    const cleanFullName = sanitizeInput(data.fullName);
    const cleanNik = data.nik.trim();
    const cleanBirthPlace = sanitizeInput(data.birthPlace);
    const cleanAddress = sanitizeInput(data.address);
    const cleanParentName = sanitizeInput(data.parentName);
    const cleanParentPhone = data.parentPhone.trim();
    const cleanParentJob = data.parentJob ? sanitizeInput(data.parentJob) : null;
    const cleanParentIncome = data.parentIncome ? sanitizeInput(data.parentIncome) : null;
    const cleanVillage = data.village ? sanitizeInput(data.village) : null;
    const cleanDistrict = data.district ? sanitizeInput(data.district) : null;
    const cleanPreviousSchool = data.previousSchool ? sanitizeInput(data.previousSchool) : null;

    // 3. Simpan ke sistem penyimpanan nyata (Persistent Storage)
    let registration;
    try {
      registration = createPPDBRegistration({
        fullName: cleanFullName,
        nik: cleanNik,
        birthPlace: cleanBirthPlace,
        birthDate: new Date(data.birthDate).toISOString(),
        gender: data.gender,
        religion: data.religion || null,
        address: cleanAddress,
        rt: rtClean,
        rw: rwClean,
        rtRw: computedRtRw,
        village: cleanVillage,
        district: cleanDistrict,
        parentName: cleanParentName,
        parentPhone: cleanParentPhone,
        parentJob: cleanParentJob,
        parentIncome: cleanParentIncome,
        previousSchool: cleanPreviousSchool,
        path: data.path,
      });
    } catch (saveError: any) {
      return apiBadRequest(
        saveError.message || "Gagal menyimpan pendaftaran ke database.",
        undefined,
        "DUPLICATE_REGISTRATION"
      );
    }

    // Coba sinkronisasi ke database Prisma bila database PostgreSQL aktif
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

    return apiCreated(
      {
        registrationNumber: registration.registrationNumber,
        fullName: registration.fullName,
        nik: registration.nik,
        path: registration.path,
        status: registration.status,
        createdAt: registration.createdAt,
      },
      "Pendaftaran PPDB berhasil tercatat di sistem sekolah."
    );
  } catch (error: unknown) {
    return handleApiError(error, "Terjadi kesalahan internal pada sistem pendaftaran.");
  }
}
