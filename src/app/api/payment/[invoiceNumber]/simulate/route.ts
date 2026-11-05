import { NextRequest } from "next/server";
import { simulatePaymentSuccess } from "@/lib/payment/gateway";
import { getPaymentByInvoice } from "@/lib/services/payments";
import { apiSuccess, apiNotFound, handleApiError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

/**
 * POST /api/payment/[invoiceNumber]/simulate
 * Memfasilitasi pengujian sandbox pembayaran instan untuk Midtrans/Xendit
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ invoiceNumber: string }> }
) {
  try {
    const { invoiceNumber } = await context.params;
    const existing = getPaymentByInvoice(invoiceNumber);

    if (!existing) {
      return apiNotFound(`Transaksi dengan invoice ${invoiceNumber} tidak ditemukan.`);
    }

    const updated = simulatePaymentSuccess(invoiceNumber);

    return apiSuccess(
      updated,
      {
        message: "Simulasi pembayaran berhasil! Status transaksi kini LUNAS.",
        simulated: true,
      }
    );
  } catch (error) {
    return handleApiError(error, "Gagal mensimulasikan pembayaran");
  }
}

