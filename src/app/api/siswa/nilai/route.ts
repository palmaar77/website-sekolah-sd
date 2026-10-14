import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { assertStudentOwnership } from "@/lib/auth/rbac";
import { getStudentReport } from "@/lib/services/grades";

/**
 * GET /api/siswa/nilai
 * Mengambil nilai rapor siswa yang sedang terautentikasi.
 * Jika parameter ?reg=... disertakan, backend memvalidasi hak akses (mencegah IDOR).
 */
export async function GET(request: NextRequest) {
  try {
    const current = await getCurrentSession();

    if (!current) {
      return NextResponse.json(
        {
          success: false,
          code: "UNAUTHORIZED",
          message: "Sesi portal siswa tidak ditemukan. Silakan masuk terlebih dahulu.",
        },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const requestedReg = searchParams.get("reg");

    let targetReg = "";
    let targetName = "";

    if (current.type === "student") {
      targetReg = current.session.registrationNumber;
      targetName = current.session.fullName;

      // Jika siswa mencoba menyematkan query param milik siswa lain di URL
      if (requestedReg && requestedReg.trim().toUpperCase() !== targetReg.toUpperCase()) {
        try {
          assertStudentOwnership(current.session, requestedReg);
        } catch (err: any) {
          return NextResponse.json(
            {
              success: false,
              code: err.code || "IDOR_FORBIDDEN",
              message:
                err.message ||
                "Akses ditolak: Anda tidak memiliki wewenang untuk membaca nilai siswa lain.",
              attemptedId: requestedReg,
              authenticatedId: targetReg,
            },
            { status: 403 }
          );
        }
      }
    } else {
      // Admin / Guru dapat menentukan siswa mana yang ingin dilihat melalui query parameter
      targetReg = requestedReg || "PPDB-2025-00001";
      targetName = "Siswa Sekolah";
    }

    const report = await getStudentReport(targetReg, targetName);

    return NextResponse.json({
      success: true,
      data: report,
      userRole: current.session.role,
    });
  } catch (error: any) {
    console.error("API /api/siswa/nilai error:", error);
    return NextResponse.json(
      {
        success: false,
        code: "SERVER_ERROR",
        message: "Terjadi kesalahan saat memuat nilai siswa.",
      },
      { status: 500 }
    );
  }
}
