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
 * GET /api/siswa/nilai
 * Mengambil nilai rapor siswa yang sedang terautentikasi.
 * Jika parameter ?reg=... disertakan, backend memvalidasi hak akses (mencegah IDOR).
 */
export async function GET(request: NextRequest) {
  try {
    const current = await getCurrentSession();

    if (!current) {
      return apiUnauthorized("Sesi portal siswa tidak ditemukan. Silakan masuk terlebih dahulu.");
    }

    const searchParams = request.nextUrl.searchParams;
    const requestedReg = searchParams.get("reg");

    let targetReg = "";
    let targetName = "";

    if (current.type === "student") {
      targetReg = current.session.registrationNumber;
      targetName = current.session.fullName;

      // Jika siswa mencoba menyematkan query param milik siswa lain di URL (OWASP A01: IDOR)
      if (requestedReg && requestedReg.trim().toUpperCase() !== targetReg.toUpperCase()) {
        try {
          assertStudentOwnership(current.session, requestedReg);
        } catch (err: any) {
          return apiForbidden(
            err.message || "Akses ditolak: Anda tidak memiliki wewenang untuk membaca nilai siswa lain.",
            err.code || "IDOR_FORBIDDEN"
          );
        }
      }
    } else {
      // Admin / Guru dapat menentukan siswa mana yang ingin dilihat melalui query parameter
      targetReg = requestedReg || "PPDB-2025-00001";
      targetName = "Siswa Sekolah";
    }

    const report = await getStudentReport(targetReg, targetName);

    return apiSuccess(report, {
      userRole: current.session.role,
    });
  } catch (error: unknown) {
    return handleApiError(error, "Terjadi kesalahan saat memuat nilai siswa.");
  }
}
