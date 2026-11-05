import { getSchoolQRISSetting } from "@/lib/services/payments";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

/**
 * GET /api/payment/qris
 * Mengambil data publik QRIS Sekolah (Nama Merchant, NMID, Acquirer, dan Petunjuk)
 */
export async function GET() {
  try {
    const setting = getSchoolQRISSetting();
    return apiSuccess({
      enabled: setting.enabled,
      merchantName: setting.merchantName,
      nmid: setting.nmid,
      acquirer: setting.acquirer,
      instructions: setting.instructions,
      hasCustomImage: Boolean(setting.customImageUrl),
    });
  } catch (error) {
    return handleApiError(error, "Gagal memuat info QRIS");
  }
}
