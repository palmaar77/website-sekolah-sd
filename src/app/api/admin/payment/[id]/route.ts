import { NextRequest } from "next/server";
import {
  getPaymentById,
  updatePaymentStatus,
  deletePayment,
  PaymentStatus,
} from "@/lib/services/payments";
import {
  apiSuccess,
  apiNotFound,
  apiBadRequest,
  handleApiError,
} from "@/lib/api-response";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/admin/payment/[id]
 * Konfirmasi manual status pembayaran oleh Bendahara / Admin Sekolah
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const payment = getPaymentById(id);

    if (!payment) {
      return apiNotFound(`Transaksi pembayaran dengan ID ${id} tidak ditemukan.`);
    }

    const body = await request.json();
    const newStatus = body.status as PaymentStatus;

    if (!newStatus || !["PENDING", "SUCCESS", "FAILED", "EXPIRED"].includes(newStatus)) {
      return apiBadRequest("Status pembayaran tidak valid.");
    }

    const updated = updatePaymentStatus(payment.invoiceNumber, newStatus, {
      notes: body.notes !== undefined ? body.notes : payment.notes,
      paymentMethod: body.paymentMethod || payment.paymentMethod,
    });

    return apiSuccess(updated, { message: "Status pembayaran berhasil diperbarui" });
  } catch (error) {
    return handleApiError(error, "Gagal memperbarui status pembayaran");
  }
}

/**
 * DELETE /api/admin/payment/[id]
 * Menghapus transaksi pembayaran oleh Admin
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const existing = getPaymentById(id);

    if (!existing) {
      return apiNotFound(`Transaksi pembayaran dengan ID ${id} tidak ditemukan.`);
    }

    const success = deletePayment(id);
    return apiSuccess({ deleted: success }, { message: "Transaksi pembayaran berhasil dihapus" });
  } catch (error) {
    return handleApiError(error, "Gagal menghapus transaksi pembayaran");
  }
}

