import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { getPPDBRegistrations, getPPDBSetting } from "@/lib/storage/db";
import { formatDateIndo } from "@/lib/utils";

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

    // Jika admin meminta ekspor CSV
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
        const escapeCsv = (str: string | null | undefined) => {
          if (!str) return '""';
          return `"${String(str).replace(/"/g, '""')}"`;
        };
        const rtVal = r.rt || (r.rtRw ? r.rtRw.split("/")[0]?.trim() : "");
        const rwVal = r.rw || (r.rtRw ? r.rtRw.split("/")[1]?.trim() : "");
        return [
          escapeCsv(r.registrationNumber),
          escapeCsv(r.fullName),
          escapeCsv(r.nik),
          escapeCsv(r.birthPlace),
          escapeCsv(formatDateIndo(r.birthDate)),
          escapeCsv(r.gender === "LAKI_LAKI" ? "Laki-laki" : "Perempuan"),
          escapeCsv(r.address),
          escapeCsv(rtVal),
          escapeCsv(rwVal),
          escapeCsv(r.village),
          escapeCsv(r.district),
          escapeCsv(r.parentName),
          escapeCsv(r.parentPhone),
          escapeCsv(r.parentJob),
          escapeCsv(r.previousSchool),
          escapeCsv(r.path),
          escapeCsv(r.status),
          escapeCsv(r.verificationNotes),
          escapeCsv(formatDateIndo(r.createdAt, true)),
        ].join(",");
      });

      const csvContent = "\uFEFF" + [csvHeader, ...csvRows].join("\n"); // UTF-8 BOM untuk Excel

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="data-pendaftar-ppdb-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: storageResult.data,
      setting,
      pagination: {
        page,
        limit,
        total: storageResult.total,
        totalPages: storageResult.totalPages,
      },
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.name === "AuthorizationError") {
      return NextResponse.json({ success: false, message: "Akses ditolak" }, { status: 401 });
    }
    console.error("PPDB admin list error:", error);
    return NextResponse.json({ success: false, message: "Gagal mengambil data PPDB" }, { status: 500 });
  }
}
