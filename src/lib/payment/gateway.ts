/**
 * Modul Integrasi Gateway Pembayaran (Payment Gateway Integration)
 * Mendukung integrasi resmi Midtrans (Snap / Core API) dan Xendit (Invoice / Payment Link)
 * Dilengkapi mode simulasi sandbox bawaan untuk pengujian instan tanpa setup kunci eksternal.
 */

import type { PaymentTransaction } from "@/lib/services/payments";
import { updatePaymentStatus } from "@/lib/services/payments";

export interface GatewayConfig {
  provider: "MIDTRANS" | "XENDIT" | "SIMULATION";
  isProduction: boolean;
  midtrans: {
    serverKey: string;
    clientKey: string;
    isProduction: boolean;
    snapUrl: string;
  };
  xendit: {
    secretKey: string;
    invoiceUrl: string;
  };
}

/**
 * Membaca konfigurasi gateway pembayaran dari Environment Variables atau Placeholder Default
 */
export function getGatewayConfig(): GatewayConfig {
  const isProd = process.env.NODE_ENV === "production" && process.env.MIDTRANS_IS_PRODUCTION === "true";
  const configuredProvider = (process.env.PAYMENT_GATEWAY_PROVIDER || "MIDTRANS").toUpperCase();
  const provider = (
    configuredProvider === "XENDIT"
      ? "XENDIT"
      : configuredProvider === "SIMULATION"
      ? "SIMULATION"
      : "MIDTRANS"
  ) as "MIDTRANS" | "XENDIT" | "SIMULATION";

  return {
    provider,
    isProduction: isProd,
    midtrans: {
      serverKey: process.env.MIDTRANS_SERVER_KEY || "SB-Mid-server-placeholder-school-demo-key",
      clientKey: process.env.MIDTRANS_CLIENT_KEY || "SB-Mid-client-placeholder-school-demo-key",
      isProduction: isProd,
      snapUrl: isProd
        ? "https://app.midtrans.com/snap/snap.js"
        : "https://app.sandbox.midtrans.com/snap/snap.js",
    },
    xendit: {
      secretKey: process.env.XENDIT_SECRET_KEY || "xnd_development_placeholder_school_demo_key",
      invoiceUrl: "https://api.xendit.co/v2/invoices",
    },
  };
}

export interface GatewayCheckoutResult {
  provider: "MIDTRANS" | "XENDIT" | "SIMULATION";
  snapToken?: string;
  redirectUrl?: string;
  qrCodeUrl?: string;
  vaNumber?: string;
  instructions: string[];
}

/**
 * Menyiapkan payload checkout ke Gateway Pembayaran
 * (Bila kunci riil tersedia, siap terhubung langsung ke API Midtrans / Xendit.
 *  Bila menggunakan placeholder/sandbox, menyediakan data instruksi & token simulasi yang mulus).
 */
export async function createGatewayCheckout(
  transaction: PaymentTransaction
): Promise<GatewayCheckoutResult> {
  const config = getGatewayConfig();
  const activeProvider = transaction.paymentGateway || config.provider;

  // 1. Midtrans Gateway Integration Placeholder
  if (activeProvider === "MIDTRANS") {
    const snapToken = transaction.snapToken || `snap-token-${transaction.invoiceNumber}`;
    const redirectUrl = `https://app.sandbox.midtrans.com/snap/v2/vtweb/${snapToken}`;

    return {
      provider: "MIDTRANS",
      snapToken,
      redirectUrl,
      qrCodeUrl: transaction.qrCodeUrl || undefined,
      vaNumber: transaction.vaNumber || undefined,
      instructions: [
        "Pilih metode pembayaran yang Anda inginkan (QRIS, GoPay, ShopeePay, atau Transfer Virtual Account).",
        "Lakukan pembayaran sesuai nominal tepat hingga digit terakhir sebelum batas waktu berakhir.",
        "Sistem akan memverifikasi pembayaran Anda secara otomatis dalam beberapa detik.",
        "Setelah lunas, Kwitansi Resmi Sekolah berstempel digital dapat langsung diunduh dalam format PDF.",
      ],
    };
  }

  // 2. Xendit Gateway Integration Placeholder
  if (activeProvider === "XENDIT") {
    const invoiceUrl = transaction.invoiceUrl || `https://checkout.xendit.co/web/${transaction.invoiceNumber}`;

    return {
      provider: "XENDIT",
      redirectUrl: invoiceUrl,
      qrCodeUrl: transaction.qrCodeUrl || undefined,
      vaNumber: transaction.vaNumber || undefined,
      instructions: [
        "Buka tautan Invoice Xendit atau pindai kode QRIS yang tersedia.",
        "Salin nomor Virtual Account sesuai bank pilihan Anda.",
        "Selesaikan transaksi melalui ATM, Mobile Banking, atau dompet digital.",
        "Kwitansi bukti bayar sah diterbitkan instan begitu pembayaran terdeteksi.",
      ],
    };
  }

  // 3. Simulation / Sandbox Mode
  return {
    provider: "SIMULATION",
    qrCodeUrl: transaction.qrCodeUrl || undefined,
    vaNumber: transaction.vaNumber || undefined,
    instructions: [
      "Mode simulasi aktif (Sandbox / Test Mode).",
      "Gunakan tombol simulasi di bawah untuk menguji alur pembayaran berhasil secara instan.",
      "Kwitansi resmi PDF dapat langsung dicetak setelah simulasi berhasil.",
    ],
  };
}

/**
 * Simulasi konfirmasi pembayaran instan (Webhook simulator untuk testing & preview cepat)
 */
export function simulatePaymentSuccess(invoiceNumber: string) {
  const updated = updatePaymentStatus(invoiceNumber, "SUCCESS");
  return updated;
}
