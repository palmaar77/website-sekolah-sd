import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import {
  getAllStudentsReportsSummary,
  updateStudentReport,
} from "@/lib/services/grades";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { sanitizeObject } from "@/lib/security/sanitize";

/**
 * GET /api/admin/nilai
 * Mengambil ringkasan rapor dan nilai seluruh siswa untuk Guru & Administrator.
 * Dilindungi oleh validasi RBAC server-side (SUPER_ADMIN, ADMIN, STAFF).
 */
export async function GET() {
  try {
    const session = await requireAuth(["SUPER_ADMIN", "ADMIN", "STAFF"]);
    const summary = await getAllStudentsReportsSummary();

    return apiSuccess(summary, {
      admin: {
        id: session.userId,
        name: session.name,
        role: session.role,
      },
    });
  } catch (error: unknown) {
    return handleApiError(error, "Gagal mengambil data nilai siswa.");
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
      throw new Error("Nomor registrasi siswa wajib disertakan.");
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
