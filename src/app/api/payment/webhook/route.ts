import { NextRequest } from "next/server";
import { updatePaymentStatus } from "@/lib/services/payments";
import { apiSuccess, apiBadRequest, handleApiError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

/**
 * POST /api/payment/webhook
 * Handler resmi untuk menerima notifikasi callback / webhook dari Midtrans atau Xendit
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. Format Notifikasi Midtrans
    // e.g. { order_id: "INV-2026-SPP-XXXX", transaction_status: "settlement", ... }
    if (body.order_id && body.transaction_status) {
      const orderId = body.order_id as string;
      const txStatus = body.transaction_status as string;

      let status: "SUCCESS" | "PENDING" | "FAILED" = "PENDING";
      if (txStatus === "settlement" || txStatus === "capture") {
        status = "SUCCESS";
      } else if (txStatus === "deny" || txStatus === "cancel" || txStatus === "expire") {
        status = "FAILED";
      }

      const updated = updatePaymentStatus(orderId, status, {
        gatewayTransactionId: body.transaction_id || undefined,
      });

      return apiSuccess({
        orderId,
        status,
        updated: Boolean(updated),
      });
    }

    // 2. Format Notifikasi Xendit
    // e.g. { external_id: "INV-2026-SPP-XXXX", status: "PAID", ... }
    if (body.external_id && body.status) {
      const externalId = body.external_id as string;
      const xenditStatus = body.status as string;

      const status = xenditStatus === "PAID" ? "SUCCESS" : xenditStatus === "EXPIRED" ? "EXPIRED" : "FAILED";
      const updated = updatePaymentStatus(externalId, status, {
        gatewayTransactionId: body.id || undefined,
      });

      return apiSuccess({
        externalId,
        status,
        updated: Boolean(updated),
      });
    }

    return apiBadRequest("Format notifikasi webhook tidak dikenali");
  } catch (error) {
    return handleApiError(error, "Gagal memproses notifikasi webhook pembayaran");
  }
}

