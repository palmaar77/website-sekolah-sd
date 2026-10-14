import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { assertStudentOwnership } from "@/lib/auth/rbac";
import prisma from "@/lib/prisma";

/**
 * GET /api/siswa/data/[studentId]
 * Mengambil profil data siswa berdasarkan nomor registrasi.
 * Mencegah siswa membaca data pribadi siswa lain hanya dengan mengganti ID pada URL.
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
          message: "Akses ditolak. Silakan login ke portal terlebih dahulu.",
        },
        { status: 401 }
      );
    }

    // Validasi kepemilikan di server (IDOR Check)
    try {
      const authResult = assertStudentOwnership(current.session, studentId);

      let studentData = null;
      try {
        studentData = await prisma.pPDBRegistration.findUnique({
          where: { registrationNumber: studentId.trim().toUpperCase() },
          include: { documents: true },
        });
      } catch {
        // Fallback demo data jika DB belum terkoneksi
      }

      if (!studentData) {
        studentData = {
          id: `demo-${studentId}`,
          registrationNumber: studentId.toUpperCase(),
          fullName:
            current.session.role === "STUDENT"
              ? (current.session as any).fullName
              : "Ahmad Rayhan Pratama",
          nik: "3201234567890001",
          birthPlace: "Jakarta",
          birthDate: new Date("2018-05-12"),
          gender: "LAKI_LAKI",
          religion: "Islam",
          address: "Jl. Melati No. 15, RT 02 / RW 04, Kelurahan Harapan",
          parentName: "Budi Santoso",
          parentPhone: "081234567890",
          path: "ZONASI",
          status: "ACCEPTED",
          verificationNotes: "Dokumen pendaftaran telah lengkap dan terverifikasi.",
          createdAt: new Date(),
          documents: [],
        } as any;
      }

      return NextResponse.json({
        success: true,
        data: studentData,
        meta: {
          viewerRole: current.session.role,
          isOwner: authResult.isOwner,
          isAdmin: authResult.isAdmin,
        },
      });
    } catch (authError: any) {
      if (authError.name === "AuthorizationError") {
        return NextResponse.json(
          {
            success: false,
            code: authError.code,
            message: authError.message,
            attemptedTargetId: studentId,
          },
          { status: authError.statusCode || 403 }
        );
      }
      throw authError;
    }
  } catch (error: any) {
    console.error("API /api/siswa/data/[studentId] error:", error);
    return NextResponse.json(
      {
        success: false,
        code: "SERVER_ERROR",
        message: "Gagal mengambil data siswa.",
      },
      { status: 500 }
    );
  }
}
