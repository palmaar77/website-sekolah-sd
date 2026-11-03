import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import {
  getAllStudentsReportsSummary,
  updateStudentReport,
  createStudentReport,
  getAvailableStudentsForReport,
} from "@/lib/services/grades";
import { apiCreated, apiSuccess, apiBadRequest, handleApiError } from "@/lib/api-response";
import { sanitizeObject } from "@/lib/security/sanitize";

/**
 * GET /api/admin/nilai
 * Mengambil ringkasan rapor dan nilai seluruh siswa untuk Guru & Administrator.
 * Dilindungi oleh validasi RBAC server-side (SUPER_ADMIN, ADMIN, STAFF).
 */
export async function GET() {
  try {
    const session = await requireAuth(["SUPER_ADMIN", "ADMIN", "STAFF"]);
    const [summary, availableStudents] = await Promise.all([
      getAllStudentsReportsSummary(),
      getAvailableStudentsForReport(),
    ]);

    return apiSuccess(summary, {
      admin: {
        id: session.userId,
        name: session.name,
        role: session.role,
      },
      availableStudents,
    });
  } catch (error: unknown) {
    return handleApiError(error, "Gagal mengambil data nilai siswa.");
  }
}

/**
 * POST /api/admin/nilai
 * Membuat rapor siswa baru secara langsung oleh Guru & Administrator
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(["SUPER_ADMIN", "ADMIN", "STAFF"]);
    const body = await request.json();
    const sanitized = sanitizeObject(body);

    if (!sanitized.fullName || typeof sanitized.fullName !== "string") {
      return apiBadRequest("Nama lengkap siswa wajib diisi.");
    }
    if (!sanitized.registrationNumber || typeof sanitized.registrationNumber !== "string") {
      return apiBadRequest("Nomor registrasi siswa wajib diisi.");
    }

    const created = await createStudentReport(sanitized);

    return apiCreated(created, "Rapor peserta didik berhasil dibuat dan diterbitkan.");
  } catch (error: unknown) {
    return handleApiError(error, "Gagal membuat rapor baru.");
  }
}

/**
 * PUT /api/admin/nilai
 * Memperbarui nilai atau catatan rapor siswa oleh Guru & Administrator.
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuth(["SUPER_ADMIN", "ADMIN", "STAFF"]);
    const body = await request.json();
    const sanitized = sanitizeObject(body);

    const { registrationNumber, subjects, attendance, extracurriculars, teacherNotes } = sanitized;
    if (!registrationNumber || typeof registrationNumber !== "string") {
      return apiBadRequest("Nomor registrasi siswa wajib disertakan.");
    }

    const updated = await updateStudentReport(registrationNumber, {
      ...(subjects ? { subjects } : {}),
      ...(attendance ? { attendance } : {}),
      ...(extracurriculars ? { extracurriculars } : {}),
      ...(teacherNotes !== undefined ? { teacherNotes } : {}),
    });

    return apiSuccess(updated, {
      updatedBy: session.name,
      updatedAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    return handleApiError(error, "Gagal memperbarui nilai rapor siswa.");
  }
}
