import { NextRequest, NextResponse } from "next/server";
import { getPPDBSetting, updatePPDBSetting } from "@/lib/storage/db";
import { requireAuth } from "@/lib/auth/session";

/**
 * GET /api/ppdb/setting
 * Mengambil informasi pengaturan PPDB (status buka/tutup, kuota, persyaratan, alur).
 * Dapat diakses publik oleh halaman formulir dan informasi PPDB.
 */
export async function GET() {
  try {
    const setting = getPPDBSetting();
    return NextResponse.json({
      success: true,
      data: setting,
    });
  } catch (error) {
    console.error("GET /api/ppdb/setting error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil pengaturan PPDB." },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/ppdb/setting
 * Mengubah pengaturan PPDB (termasuk membuka atau menutup pendaftaran secara nyata).
 * Memerlukan otentikasi role admin / staff.
 */
export async function PATCH(request: NextRequest) {
  try {
    await requireAuth(["SUPER_ADMIN", "ADMIN"]);
    const body = await request.json();

    const updated = updatePPDBSetting(body);

    return NextResponse.json({
      success: true,
      message: "Pengaturan PPDB berhasil disimpan ke sistem.",
      data: updated,
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.name === "AuthorizationError") {
      return NextResponse.json(
        { success: false, message: "Akses ditolak. Anda tidak memiliki izin mengubah pengaturan." },
        { status: 403 }
      );
    }
    console.error("PATCH /api/ppdb/setting error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui pengaturan PPDB." },
      { status: 500 }
    );
  }
}
