import { requireAuth } from "@/lib/auth/session";
import { getAllStudentsReportsSummary } from "@/lib/services/grades";
import { apiSuccess, handleApiError } from "@/lib/api-response";

/**
 * GET /api/admin/nilai
 * Mengambil ringkasan rapor dan nilai seluruh siswa untuk Guru & Administrator.
 * Dilindungi oleh validasi RBAC server-side (SUPER_ADMIN, ADMIN, STAFF).
 */
export async function GET() {
  try {
    const session = await requireAuth(["SUPER_ADMIN", "ADMIN", "STAFF"]);
    const summary = await getAllStudentsReportsSummary();

    return apiSuccess({
      data: summary,
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
