"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Printer,
  ArrowLeft,
  CheckCircle2,
  Copy,
  Check,
  Share2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Building,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PaymentTransaction } from "@/lib/services/payments";
import { formatDateIndo, formatRupiah, terbilang } from "@/lib/utils";
import { SCHOOL_CONFIG } from "@/config/school";

export default function KwitansiPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceNumber = params?.invoiceNumber as string;

  const [payment, setPayment] = React.useState<PaymentTransaction | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [isCopied, setIsCopied] = React.useState(false);

  React.useEffect(() => {
    if (!invoiceNumber) return;

    fetch(`/api/payment/${encodeURIComponent(invoiceNumber)}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data?.transaction) {
          setPayment(json.data.transaction);
        } else {
          setErrorMsg(json.message || "Kwitansi pembayaran tidak ditemukan.");
        }
      })
      .catch(() => {
        setErrorMsg("Terjadi gangguan jaringan saat memuat kwitansi.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [invoiceNumber]);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-base font-bold text-slate-800">Menyiapkan Kwitansi Resmi Sekolah...</h2>
        <p className="text-xs text-slate-500 mt-1">Mengambil data transaksi terverifikasi dari server</p>
      </div>
    );
  }

  if (errorMsg || !payment) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-200">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Kwitansi Tidak Ditemukan</h2>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          {errorMsg || "Nomor invoice atau bukti pembayaran yang Anda cari tidak tersedia dalam basis data sekolah."}
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            href="/pembayaran/riwayat"
            className="inline-flex items-center gap-2 bg-blue-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs hover:bg-blue-700 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Ke Riwayat Transaksi</span>
          </Link>
          <Link
            href="/pembayaran"
            className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 font-bold px-5 py-2.5 rounded-xl text-xs hover:bg-slate-200 transition-all border border-slate-200"
          >
            <span>Halaman Pembayaran</span>
          </Link>
        </div>
      </div>
    );
  }

  // Jika status masih pending
  const isPending = payment.status === "PENDING";

  return (
    <div className="min-h-screen bg-slate-100/70 py-6 sm:py-10 px-3 sm:px-6 print:p-0 print:bg-white">
      {/* Top Action Bar (Disembunyikan saat Cetak PDF) */}
      <div className="max-w-3xl mx-auto mb-6 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <Link
            href="/pembayaran/riwayat"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Riwayat Pembayaran</span>
          </Link>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              onClick={handleCopyLink}
              variant="outline"
              size="sm"
              className="rounded-xl text-xs font-semibold gap-1.5"
            >
              {isCopied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Tautan Disalin!</span>
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5" />
                  <span>Bagikan Link</span>
                </>
              )}
            </Button>

            <Button
              onClick={handlePrint}
              variant="primary"
              size="sm"
              className="rounded-xl text-xs font-bold gap-1.5 bg-blue-600 hover:bg-blue-700 shadow-sm"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Cetak / Unduh PDF</span>
            </Button>
          </div>
        </div>

        {isPending && (
          <div className="mt-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Clock className="h-4 w-4 text-amber-600 shrink-0" />
              <span>
                Tagihan ini <strong>menunggu pembayaran</strong>. Kwitansi resmi lunas akan diterbitkan setelah pembayaran diverifikasi.
              </span>
            </div>
            <Link
              href={`/pembayaran?invoice=${payment.invoiceNumber}`}
              className="shrink-0 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors"
            >
              Bayar Sekarang
            </Link>
          </div>
        )}
      </div>

      {/* DOKUMEN KWITANSI RESMI SEKOLAH (A4 Style) */}
      <div className="max-w-3xl mx-auto bg-white rounded-3xl sm:rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden print:border-none print:shadow-none print:rounded-none print:m-0 print:p-0">
        <div className="p-6 sm:p-10 space-y-6">
          {/* 1. KOP SURAT RESMI SEKOLAH */}
          <div className="border-b-4 border-double border-slate-900 pb-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <GraduationCap className="h-9 w-9 text-amber-400" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none uppercase">
                    {SCHOOL_CONFIG.name}
                  </h1>
                  <p className="text-xs text-slate-600 font-semibold mt-1">
                    NPSN: {SCHOOL_CONFIG.npsn} &bull; {SCHOOL_CONFIG.accreditationLabel}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                    {SCHOOL_CONFIG.address}, {SCHOOL_CONFIG.city}, {SCHOOL_CONFIG.province} {SCHOOL_CONFIG.postalCode}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Telepon: {SCHOOL_CONFIG.phone} &bull; Email: {SCHOOL_CONFIG.email}
                  </p>
                </div>
              </div>

              {/* QR Code Verifikasi */}
              <div className="hidden sm:flex flex-col items-center text-center shrink-0">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=75x75&data=KWITANSI_RESMI_${payment.invoiceNumber}`}
                  alt="QR Verifikasi"
                  className="w-16 h-16 rounded-lg border border-slate-200 p-0.5"
                />
                <span className="text-[9px] font-mono text-slate-400 mt-0.5">Validasi Dokumen</span>
              </div>
            </div>
          </div>

          {/* 2. JUDUL BUKTI PEMBAYARAN */}
          <div className="text-center space-y-1">
            <h2 className="text-lg sm:text-xl font-black tracking-wider text-slate-900 uppercase">
              Kwitansi Pembayaran Elektronik
            </h2>
            <p className="text-xs font-mono font-bold text-blue-700">
              No. Kwitansi: {payment.receiptNumber || `KW-${payment.invoiceNumber.replace("INV-", "")}`}
            </p>
          </div>

          {/* 3. METADATA TRANSAKSI & STATUS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">No. Invoice</span>
              <span className="font-mono font-bold text-slate-900">{payment.invoiceNumber}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Waktu Bayar</span>
              <span className="font-medium text-slate-800">
                {payment.paidAt ? formatDateIndo(payment.paidAt, true) : "-"}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Kanal Pembayaran</span>
              <span className="font-semibold text-slate-800">
                {payment.paymentMethod.replace("_", " ")} ({payment.paymentGateway})
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Status Dokumen</span>
              <span
                className={`inline-flex items-center gap-1 font-black text-xs ${
                  payment.status === "SUCCESS"
                    ? "text-emerald-700"
                    : payment.status === "PENDING"
                    ? "text-amber-700"
                    : "text-rose-700"
                }`}
              >
                {payment.status === "SUCCESS" ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>LUNAS SAH</span>
                  </>
                ) : (
                  <span>{payment.status}</span>
                )}
              </span>
            </div>
          </div>

          {/* 4. IDENTITAS PEMBAYAR & SISWA */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-1">
              Data Pembayar & Peserta Didik
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs">
              <div className="flex justify-between sm:justify-start gap-4 py-1 border-b sm:border-b-0 border-slate-50">
                <span className="text-slate-500 w-36">Nama Peserta Didik</span>
                <span className="font-bold text-slate-900">: {payment.studentName}</span>
              </div>
              <div className="flex justify-between sm:justify-start gap-4 py-1 border-b sm:border-b-0 border-slate-50">
                <span className="text-slate-500 w-36">No. Induk / Registrasi</span>
                <span className="font-mono font-bold text-slate-900">: {payment.studentRegistrationNumber}</span>
              </div>
              <div className="flex justify-between sm:justify-start gap-4 py-1 border-b sm:border-b-0 border-slate-50">
                <span className="text-slate-500 w-36">Kelas / Rombel</span>
                <span className="font-semibold text-slate-900">: {payment.studentClass}</span>
              </div>
              <div className="flex justify-between sm:justify-start gap-4 py-1 border-b sm:border-b-0 border-slate-50">
                <span className="text-slate-500 w-36">Tahun Pelajaran</span>
                <span className="font-semibold text-slate-900">: {payment.academicYear}</span>
              </div>
              <div className="flex justify-between sm:justify-start gap-4 py-1 border-b sm:border-b-0 border-slate-50">
                <span className="text-slate-500 w-36">Nama Orang Tua / Wali</span>
                <span className="font-medium text-slate-800">: {payment.parentName}</span>
              </div>
              <div className="flex justify-between sm:justify-start gap-4 py-1 border-b sm:border-b-0 border-slate-50">
                <span className="text-slate-500 w-36">No. Telepon / WhatsApp</span>
                <span className="font-mono text-slate-800">: {payment.parentPhone}</span>
              </div>
            </div>
          </div>

          {/* 5. TABEL RINCIAN TAGIHAN & PEMBAYARAN */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-1">
              Rincian Transaksi Pembayaran
            </h3>
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4 w-12 text-center">No</th>
                    <th className="py-2.5 px-4">Deskripsi Pembayaran</th>
                    <th className="py-2.5 px-4">Periode / Keterangan</th>
                    <th className="py-2.5 px-4 text-right">Jumlah</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-3 px-4 text-center font-medium text-slate-500">1</td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {payment.paymentTitle}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {payment.period} (TA {payment.academicYear})
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-900">
                      {formatRupiah(payment.amount)}
                    </td>
                  </tr>
                  {payment.adminFee > 0 && (
                    <tr className="text-slate-500">
                      <td className="py-2 px-4 text-center font-medium">2</td>
                      <td className="py-2 px-4">Biaya Administrasi Transaksi Online</td>
                      <td className="py-2 px-4">Gateway {payment.paymentGateway}</td>
                      <td className="py-2 px-4 text-right font-medium">
                        {formatRupiah(payment.adminFee)}
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-blue-50/60 border-t-2 border-slate-200 font-bold text-slate-900">
                  <tr>
                    <td colSpan={3} className="py-3 px-4 text-right uppercase tracking-wider text-xs">
                      Total Pembayaran Lunas
                    </td>
                    <td className="py-3 px-4 text-right text-sm text-blue-700 font-black">
                      {formatRupiah(payment.totalAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Terbilang */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs italic text-slate-700">
              <span className="font-semibold text-slate-900 not-italic">Terbilang: </span>
              &ldquo;{terbilang(payment.totalAmount)}&rdquo;
            </div>
          </div>

          {/* 6. TANDA TANGAN & STEMPEL DIGITAL RESMI */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6 print:break-inside-avoid">
            {/* Watermark / Stempel Lunas */}
            <div className="flex items-center gap-3 border-2 border-emerald-600/70 bg-emerald-50/60 text-emerald-800 p-3.5 rounded-2xl">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl shadow-xs">
                ✓
              </div>
              <div>
                <span className="text-[10px] uppercase font-black tracking-widest text-emerald-700 block">
                  Verifikasi Pembayaran Resmi
                </span>
                <span className="text-sm font-black tracking-tight block">
                  LUNAS &bull; SAH DI DATABASE
                </span>
                <span className="text-[10px] text-emerald-700/80 font-mono block">
                  Ref: {payment.gatewayTransactionId}
                </span>
              </div>
            </div>

            {/* Tanda Tangan Bendahara */}
            <div className="text-center sm:text-right text-xs space-y-1">
              <p className="text-slate-500">
                {SCHOOL_CONFIG.city}, {formatDateIndo(payment.paidAt || payment.createdAt)}
              </p>
              <p className="font-bold text-slate-800">Bendahara Sekolah,</p>
              <div className="h-14 flex items-center justify-center sm:justify-end">
                <span className="font-serif italic text-blue-900 font-bold text-sm tracking-widest opacity-80 underline decoration-wavy decoration-blue-400">
                  Dra. Hj. Siti Rahmawati
                </span>
              </div>
              <p className="font-bold text-slate-900">Panitia Keuangan & SPP</p>
              <p className="text-[10px] text-slate-400 font-mono">NIP. 19740815 199903 2 004</p>
            </div>
          </div>

          {/* Catatan Kaki */}
          <div className="text-center text-[10px] text-slate-400 pt-4 border-t border-slate-100">
            Kwitansi ini diterbitkan secara elektronik oleh Sistem Administrasi Keuangan {SCHOOL_CONFIG.name} dan sah tanpa memerlukan cap basah fisik tambahan sesuai ketentuan perundangan digital.
          </div>
        </div>
      </div>
    </div>
  );
}
