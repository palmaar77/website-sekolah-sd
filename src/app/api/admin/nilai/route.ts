import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { getAllStudentsReportsSummary } from "@/lib/services/grades";

/**
 * GET /api/admin/nilai
 * Mengambil ringkasan rapor dan nilai seluruh siswa untuk Guru & Administrator.
 * Dilindungi oleh validasi RBAC server-side (SUPER_ADMIN, ADMIN, STAFF).
 */
export async function GET() {
  try {
    const session = await requireAuth(["SUPER_ADMIN", "ADMIN", "STAFF"]);
    const summary = await getAllStudentsReportsSummary();

    return NextResponse.json({
      success: true,
      data: summary,
      admin: {
        id: session.userId,
        name: session.name,
        role: session.role,
      },
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.name === "AuthorizationError") {
      return NextResponse.json(
        {
          success: false,
          code: "FORBIDDEN",
          message: "Akses ditolak: Hanya guru dan staf admin yang berhak mengakses data nilai sekolah.",
        },
        { status: 403 }
      );
    }
    console.error("Admin nilai error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data nilai siswa.",
      },
      { status: 500 }
    );
  }
}
