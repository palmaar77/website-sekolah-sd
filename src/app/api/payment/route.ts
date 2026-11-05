import { NextRequest } from "next/server";
import {
  getPayments,
  createPayment,
  PaymentStatus,
  PaymentType,
} from "@/lib/services/payments";
import { createGatewayCheckout } from "@/lib/payment/gateway";
import { createPaymentSchema } from "@/lib/validations/payment";
import {
  apiSuccess,
  apiCreated,
  apiBadRequest,
  handleApiError,
} from "@/lib/api-response";

export const dynamic = "force-dynamic";

/**
 * GET /api/payment
 * Mengambil daftar transaksi pembayaran dengan filter pencarian dan status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || undefined;
    const status = (searchParams.get("status") as PaymentStatus) || undefined;
    const paymentType = (searchParams.get("paymentType") as PaymentType) || undefined;
    const studentReg = searchParams.get("studentReg") || undefined;

    const data = getPayments({
      query,
      status,
      paymentType,
      studentReg,
    });

    return apiSuccess(data, {
      total: data.length,
      filtered: Boolean(query || status || paymentType || studentReg),
    });
  } catch (error) {
    return handleApiError(error, "Gagal memuat daftar pembayaran");
  }
}

/**
 * POST /api/payment
 * Membuat invoice pembayaran baru dan menyiapkan token checkout gateway
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createPaymentSchema.safeParse(body);

    if (!parsed.success) {
      return apiBadRequest("Validasi data pembayaran gagal", parsed.error.flatten().fieldErrors);
    }

    const newPayment = createPayment({
      studentRegistrationNumber: parsed.data.studentRegistrationNumber,
      studentName: parsed.data.studentName,
      studentClass: parsed.data.studentClass,
      parentName: parsed.data.parentName,
      parentPhone: parsed.data.parentPhone,
      parentEmail: parsed.data.parentEmail || null,
      paymentType: parsed.data.paymentType,
      paymentTitle: parsed.data.paymentTitle,
      period: parsed.data.period,
      academicYear: parsed.data.academicYear,
      amount: parsed.data.amount,
      adminFee: parsed.data.adminFee,
      paymentMethod: parsed.data.paymentMethod,
      paymentGateway: parsed.data.paymentGateway,
      notes: parsed.data.notes,
    });

    const checkout = await createGatewayCheckout(newPayment);

    return apiCreated(
      {
        transaction: newPayment,
        checkout,
      },
      "Tagihan pembayaran berhasil diterbitkan"
    );
  } catch (error) {
    return handleApiError(error, "Gagal membuat tagihan pembayaran");
  }
}
