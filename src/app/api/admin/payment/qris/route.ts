import { NextRequest } from "next/server";
import {
  getSchoolQRISSetting,
  updateSchoolQRISSetting,
} from "@/lib/services/payments";
import { apiSuccess, apiBadRequest, handleApiError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/payment/qris
 * Mengambil konfigurasi QRIS Sekolah saat ini
 */
export async function GET() {
  try {
    const setting = getSchoolQRISSetting();
    return apiSuccess(setting);
  } catch (error) {
    return handleApiError(error, "Gagal memuat konfigurasi QRIS");
  }
}

/**
 * POST /api/admin/payment/qris
 * Memperbarui pengaturan QRIS Sekolah (Nama Merchant, NMID, Acquirer, atau Upload Gambar QRIS)
 */
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    // 1. Jika dikirim via FormData (Mendukung upload file gambar langsung)
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      const merchantName = formData.get("merchantName") as string | null;
      const nmid = formData.get("nmid") as string | null;
      const acquirer = formData.get("acquirer") as string | null;
      const customImageUrl = formData.get("customImageUrl") as string | null;
      const instructions = formData.get("instructions") as string | null;
      const enabled = formData.get("enabled");
      const resetToDefault = formData.get("resetToDefault");

      let finalImageUrl: string | null | undefined = customImageUrl;

      if (resetToDefault === "true") {
        finalImageUrl = null;
      } else if (file && file.size > 0) {
        // Validasi tipe file gambar
        if (!file.type.startsWith("image/")) {
          return apiBadRequest("Format berkas harus berupa gambar (PNG, JPG, JPEG, WEBP)");
        }
        // Maksimal 5MB
        if (file.size > 5 * 1024 * 1024) {
          return apiBadRequest("Ukuran berkas gambar maksimal 5MB");
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        finalImageUrl = `data:${file.type};base64,${buffer.toString("base64")}`;
      }

      const updated = updateSchoolQRISSetting({
        ...(merchantName ? { merchantName: merchantName.trim() } : {}),
        ...(nmid ? { nmid: nmid.trim() } : {}),
        ...(acquirer ? { acquirer: acquirer.trim() } : {}),
        ...(instructions !== null ? { instructions: instructions.trim() } : {}),
        ...(finalImageUrl !== undefined ? { customImageUrl: finalImageUrl } : {}),
        ...(enabled !== null ? { enabled: enabled === "true" } : {}),
      });

      return apiSuccess(updated, { message: "Pengaturan QRIS berhasil diperbarui" });
    }

    // 2. Jika dikirim via JSON
    const body = await request.json();

    if (body.resetToDefault) {
      const updated = updateSchoolQRISSetting({
        customImageUrl: null,
      });
      return apiSuccess(updated, { message: "QRIS berhasil direset ke mode otomatis" });
    }

    const updated = updateSchoolQRISSetting({
      merchantName: body.merchantName?.trim(),
      nmid: body.nmid?.trim(),
      acquirer: body.acquirer?.trim(),
      customImageUrl: body.customImageUrl !== undefined ? body.customImageUrl : undefined,
      instructions: body.instructions?.trim(),
      enabled: body.enabled !== undefined ? Boolean(body.enabled) : undefined,
    });

    return apiSuccess(updated, { message: "Pengaturan QRIS berhasil diperbarui" });
  } catch (error) {
    return handleApiError(error, "Gagal memperbarui pengaturan QRIS");
  }
}

/**
 * DELETE /api/admin/payment/qris
 * Menghapus gambar QRIS kustom dan mengembalikan ke QRIS dinamis sistem
 */
export async function DELETE() {
  try {
    const updated = updateSchoolQRISSetting({
      customImageUrl: null,
    });
    return apiSuccess(updated, {
      message: "Gambar QRIS kustom berhasil dihapus. Menggunakan QRIS dinamis otomatis.",
    });
  } catch (error) {
    return handleApiError(error, "Gagal mereset QRIS");
  }
}

