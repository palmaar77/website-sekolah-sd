import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { assertStudentOwnership } from "@/lib/auth/rbac";
import { getStudentReport } from "@/lib/services/grades";

/**
 * GET /api/siswa/nilai/[studentId]
 * Endpoint dengan parameter dinamis URL.
 * Server WAJIB memvalidasi otorisasi kepemilikan data untuk mencegah kerentanan IDOR!
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await params;
    const current = await getCurrentSession();

    if (!current) {
      return NextResponse.json(
        {
          success: false,
          code: "UNAUTHORIZED",
          message: "Autentikasi diperlukan. Silakan login terlebih dahulu.",
        },
        { status: 401 }
      );
    }

    // Validasi Otorisasi di Server (Anti-IDOR)
    try {
      const authResult = assertStudentOwnership(current.session, studentId);
      const report = await getStudentReport(studentId);

      return NextResponse.json({
        success: true,
        data: report,
        meta: {
          viewerRole: current.session.role,
          isOwner: authResult.isOwner,
          isAdmin: authResult.isAdmin,
        },
      });
    } catch (authError: any) {
      // Tangani pelanggaran IDOR dengan status 403 Forbidden
      if (authError.name === "AuthorizationError") {
        return NextResponse.json(
          {
            success: false,
            code: authError.code,
            message: authError.message,
            violation: "IDOR_PREVENTION_TRIGGERED",
            attemptedTargetId: studentId,
            requesterId:
              current.session.role === "STUDENT"
                ? (current.session as any).registrationNumber
                : (current.session as any).name,
          },
          { status: authError.statusCode || 403 }
        );
      }
      throw authError;
    }
  } catch (error: any) {
    console.error("API /api/siswa/nilai/[studentId] error:", error);
    return NextResponse.json(
      {
        success: false,
        code: "INTERNAL_ERROR",
        message: "Terjadi kesalahan sistem saat memproses permintaan nilai.",
      },
      { status: 500 }
    );
  }
}
