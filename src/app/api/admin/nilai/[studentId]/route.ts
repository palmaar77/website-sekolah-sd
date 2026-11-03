import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { getStudentReport, updateStudentReport } from "@/lib/services/grades";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { sanitizeObject } from "@/lib/security/sanitize";

/**
 * GET /api/admin/nilai/[studentId]
 * Mengambil detail rapor siswa tertentu untuk Guru & Administrator.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const session = await requireAuth(["SUPER_ADMIN", "ADMIN", "STAFF"]);
    const { studentId } = await params;
    const report = await getStudentReport(studentId);

    return apiSuccess(report, {
      viewerRole: session.role,
      adminName: session.name,
    });
  } catch (error: unknown) {
    return handleApiError(error, "Gagal memuat detail nilai rapor siswa.");
  }
}

/**
 * PUT /api/admin/nilai/[studentId]
 * Memperbarui detail rapor siswa tertentu oleh Guru & Administrator.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const session = await requireAuth(["SUPER_ADMIN", "ADMIN", "STAFF"]);
    const { studentId } = await params;
    const body = await request.json();
    const sanitized = sanitizeObject(body);

    const updated = await updateStudentReport(studentId, sanitized);

    return apiSuccess(updated, {
      updatedBy: session.name,
      updatedAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    return handleApiError(error, "Gagal memperbarui nilai rapor siswa.");
  }
}

