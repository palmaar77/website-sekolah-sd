import { NextRequest } from "next/server";
import { getPaymentByInvoice } from "@/lib/services/payments";
import { createGatewayCheckout } from "@/lib/payment/gateway";
import { apiSuccess, apiNotFound, handleApiError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ invoiceNumber: string }> }
) {
  try {
    const { invoiceNumber } = await context.params;
    const payment = getPaymentByInvoice(invoiceNumber);

    if (!payment) {
      return apiNotFound(`Faktur pembayaran dengan nomor ${invoiceNumber} tidak ditemukan.`);
    }

    const checkout = await createGatewayCheckout(payment);

    return apiSuccess({
      transaction: payment,
      checkout,
    });
  } catch (error) {
    return handleApiError(error, "Gagal memuat detail tagihan pembayaran");
  }
}
