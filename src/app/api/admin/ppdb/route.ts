import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { getPPDBRegistrations, getPPDBSetting } from "@/lib/storage/db";
import { formatDateIndo } from "@/lib/utils";
import { sanitizeCsvCell } from "@/lib/security/sanitize";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    await requireAuth(["SUPER_ADMIN", "ADMIN", "STAFF"]);
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const path = searchParams.get("path") || "";
    const format = searchParams.get("format") || "json";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    // 1. Ambil data dari persistent storage
    const storageResult = getPPDBRegistrations({
      search,
      status,
      path,
      page,
      limit,
    });
    const setting = getPPDBSetting();

    // 2. Ekspor CSV dengan Proteksi Anti-Formula Injection (OWASP A03: CWE-1236)
    if (format === "csv") {
      const allResult = getPPDBRegistrations({
        search,
        status,
        path,
        page: 1,
        limit: 1000,
      });

      const csvHeader = [
        "Nomor Registrasi",
        "Nama Calon Siswa",
        "NIK",
        "Tempat Lahir",
        "Tanggal Lahir",
        "Jenis Kelamin",
        "Alamat",
        "RT",
        "RW",
        "Kelurahan / Desa",
        "Kecamatan",
        "Nama Wali",
        "No. Telepon Wali",
        "Pekerjaan Wali",
        "Asal Sekolah",
        "Jalur Pendaftaran",
        "Status",
        "Catatan Verifikasi",
        "Tanggal Daftar",
      ].join(",");

      const csvRows = allResult.data.map((r) => {
        const rtVal = r.rt || (r.rtRw ? r.rtRw.split("/")[0]?.trim() : "");
        const rwVal = r.rw || (r.rtRw ? r.rtRw.split("/")[1]?.trim() : "");
        return [
          sanitizeCsvCell(r.registrationNumber),
          sanitizeCsvCell(r.fullName),
          sanitizeCsvCell(r.nik),
          sanitizeCsvCell(r.birthPlace),
          sanitizeCsvCell(formatDateIndo(r.birthDate)),
          sanitizeCsvCell(r.gender === "LAKI_LAKI" ? "Laki-laki" : "Perempuan"),
          sanitizeCsvCell(r.address),
          sanitizeCsvCell(rtVal),
          sanitizeCsvCell(rwVal),
          sanitizeCsvCell(r.village),
          sanitizeCsvCell(r.district),
          sanitizeCsvCell(r.parentName),
          sanitizeCsvCell(r.parentPhone),
          sanitizeCsvCell(r.parentJob),
          sanitizeCsvCell(r.previousSchool),
          sanitizeCsvCell(r.path),
          sanitizeCsvCell(r.status),
          sanitizeCsvCell(r.verificationNotes),
          sanitizeCsvCell(formatDateIndo(r.createdAt, true)),
        ].join(",");
      });

      const csvContent = "\uFEFF" + [csvHeader, ...csvRows].join("\n"); // UTF-8 BOM untuk Microsoft Excel

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="data-pendaftar-ppdb-${new Date().toISOString().slice(0, 10)}.csv"`,
          "X-Content-Type-Options": "nosniff",
        },
      });
    }

    return apiSuccess(storageResult.data, {
      setting,
      pagination: {
        page,
        limit,
        total: storageResult.total,
        totalPages: storageResult.totalPages,
      },
    });
  } catch (error: unknown) {
    return handleApiError(error, "Gagal mengambil data PPDB dari sistem.");
  }
}
