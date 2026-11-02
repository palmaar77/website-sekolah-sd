import { NextRequest } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { assertStudentOwnership } from "@/lib/auth/rbac";
import { getStudentReport } from "@/lib/services/grades";
import {
  apiForbidden,
  apiSuccess,
  apiUnauthorized,
  handleApiError,
} from "@/lib/api-response";

/**
 * GET /api/siswa/nilai/[studentId]
 * Endpoint dengan parameter dinamis URL.
 * Server WAJIB memvalidasi otorisasi kepemilikan data untuk mencegah kerentanan IDOR (OWASP A01)!
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await params;
    const current = await getCurrentSession();

    if (!current) {
      return apiUnauthorized("Autentikasi diperlukan. Silakan login terlebih dahulu.");
    }

    // Validasi Otorisasi di Server (Anti-IDOR)
    try {
      const authResult = assertStudentOwnership(current.session, studentId);
      const report = await getStudentReport(studentId);

      return apiSuccess(report, {
        viewerRole: current.session.role,
        isOwner: authResult.isOwner,
        isAdmin: authResult.isAdmin,
      });
    } catch (authError: any) {
      if (authError.name === "AuthorizationError") {
        return apiForbidden(authError.message, authError.code);
      }
      throw authError;
    }
  } catch (error: unknown) {
    return handleApiError(error, "Terjadi kesalahan sistem saat memproses permintaan nilai.");
  }
}
