"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Printer,
  ArrowLeft,
  AlertCircle,
  FileText,
  CreditCard,
  History,
  Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaymentTransaction } from "@/lib/services/payments";
import { StrukPembayaran } from "@/components/payment/StrukPembayaran";

function StrukPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const invoiceNumber = params?.invoiceNumber as string;

  const [payment, setPayment] = React.useState<PaymentTransaction | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!invoiceNumber) return;

    fetch(`/api/payment/${encodeURIComponent(invoiceNumber)}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data?.transaction) {
          setPayment(json.data.transaction);
        } else {
          setErrorMsg(json.message || "Struk pembayaran tidak ditemukan.");
        }
      })
      .catch(() => {
        setErrorMsg("Terjadi gangguan jaringan saat memuat struk transaksi.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [invoiceNumber]);

  React.useEffect(() => {
    if (payment && searchParams.get("autoPrint") === "1") {
      const timer = setTimeout(() => {
        if (typeof window !== "undefined") {
          document.body.classList.add("printing-struk");
          window.print();
          setTimeout(() => {
            document.body.classList.remove("printing-struk");
          }, 1200);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [payment, searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-base font-bold text-slate-800">Menyiapkan Struk Pembayaran...</h2>
        <p className="text-xs text-slate-500 mt-1">Mengambil data transaksi kasir elektronik</p>
      </div>
    );
  }

  if (errorMsg || !payment) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-200">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900">Struk Tidak Ditemukan</h2>
        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
          {errorMsg || "Nomor transaksi atau bukti pembayaran yang Anda cari tidak tersedia."}
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            href="/pembayaran"
            className="inline-flex items-center gap-2 bg-blue-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs hover:bg-blue-700 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Pembayaran</span>
          </Link>
          <Link
            href="/pembayaran/riwayat"
            className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs hover:bg-slate-200 transition-all border border-slate-200"
          >
            <span>Riwayat Transaksi</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 py-6 sm:py-10 px-3 sm:px-6 print:p-0 print:bg-white">
      {/* Top Action Bar (Disembunyikan saat cetak) */}
      <div className="max-w-md mx-auto mb-6 print:hidden">
        <div className="flex items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <Link
            href="/pembayaran"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Form Pembayaran</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href={`/pembayaran/kwitansi/${payment.invoiceNumber}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-blue-600 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <FileText className="h-3.5 w-3.5 text-blue-600" />
              <span>Format A4</span>
            </Link>
            <Link
              href="/pembayaran/riwayat"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-blue-600 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <History className="h-3.5 w-3.5" />
              <span>Riwayat</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Komponen Struk Kasir / Thermal */}
      <div className="max-w-md mx-auto">
        <StrukPembayaran transaction={payment} isModal={false} />
      </div>
    </div>
  );
}

export default function StrukPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
          <h2 className="text-base font-bold text-slate-800">Menyiapkan Struk Pembayaran...</h2>
        </div>
      }
    >
      <StrukPageContent />
    </React.Suspense>
  );
}
