"use client";

import * as React from "react";
import Link from "next/link";
import {
  Printer,
  Share2,
  Copy,
  Check,
  X,
  FileText,
  CheckCircle2,
  Clock,
  Sparkles,
  Receipt,
  Download,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaymentTransaction, generateStrukNumber } from "@/lib/services/payments";
import { formatDateIndo, formatRupiah, terbilang } from "@/lib/utils";
import { SCHOOL_CONFIG, getWhatsAppUrl } from "@/config/school";

interface StrukPembayaranProps {
  transaction: PaymentTransaction;
  onClose?: () => void;
  isModal?: boolean;
}

export function StrukPembayaran({
  transaction,
  onClose,
  isModal = false,
}: StrukPembayaranProps) {
  const [copiedText, setCopiedText] = React.useState(false);
  const isSuccess = transaction.status === "SUCCESS";
  const strukNumber = generateStrukNumber(transaction.invoiceNumber, transaction.receiptNumber);

  const handlePrint = () => {
    if (typeof window === "undefined") return;
    document.body.classList.add("printing-struk");
    window.print();
    setTimeout(() => {
      document.body.classList.remove("printing-struk");
    }, 1200);
  };

  const plainTextStruk = `================================================
${SCHOOL_CONFIG.name.toUpperCase()}
NPSN: ${SCHOOL_CONFIG.npsn} • ${SCHOOL_CONFIG.accreditationLabel}
${SCHOOL_CONFIG.address}
Telp: ${SCHOOL_CONFIG.phone} • WA: ${SCHOOL_CONFIG.whatsapp}
================================================
STRUK BUKTI PEMBAYARAN ELEKTRONIK
------------------------------------------------
No. Struk    : ${strukNumber}
No. Invoice  : ${transaction.invoiceNumber}
Waktu Bayar  : ${formatDateIndo(transaction.paidAt || transaction.createdAt, true)}
Kanal/Kasir  : Online Gateway (${transaction.paymentGateway})
------------------------------------------------
DATA SISWA:
Nama Siswa   : ${transaction.studentName}
NISN / Reg   : ${transaction.studentRegistrationNumber}
Kelas        : ${transaction.studentClass}
Wali Murid   : ${transaction.parentName}
------------------------------------------------
RINCIAN:
${transaction.paymentTitle}
Periode: ${transaction.period}
Tagihan      : ${formatRupiah(transaction.amount)}
${transaction.adminFee > 0 ? `Biaya Admin  : ${formatRupiah(transaction.adminFee)}\n` : ""}------------------------------------------------
TOTAL DIBAYAR: ${formatRupiah(transaction.totalAmount)}
Terbilang    : ${terbilang(transaction.totalAmount)}
Metode Bayar : ${transaction.paymentMethod.replace("_", " ")}
Status       : ${isSuccess ? "*** LUNAS (PAID) ***" : transaction.status}
Ref ID       : ${transaction.gatewayTransactionId}
------------------------------------------------
Validasi Online:
https://website-sekolah-sd.vercel.app/pembayaran/struk/${transaction.invoiceNumber}
================================================
Simpan struk ini sebagai bukti transaksi sah.
Terima kasih telah membayar tepat waktu.
================================================`;

  const handleCopyText = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(plainTextStruk);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    }
  };

  const waTarget = transaction.parentPhone.replace(/\D/g, "");
  const waUrl = getWhatsAppUrl(
    `Halo Bpk/Ibu ${transaction.parentName}, berikut adalah *Struk Bukti Pembayaran Resmi SD Negeri Harapan Bangsa*:\n\n` +
      `• No. Struk: *${strukNumber}*\n` +
      `• No. Invoice: *${transaction.invoiceNumber}*\n` +
      `• Siswa: *${transaction.studentName}* (${transaction.studentClass})\n` +
      `• Pembayaran: *${transaction.paymentTitle}*\n` +
      `• Total: *${formatRupiah(transaction.totalAmount)}*\n` +
      `• Status: *${isSuccess ? "LUNAS (PAID)" : transaction.status}*\n` +
      `• Waktu: ${formatDateIndo(transaction.paidAt || transaction.createdAt, true)}\n\n` +
      `Lihat & Cetak Struk Asli:\nhttps://website-sekolah-sd.vercel.app/pembayaran/struk/${transaction.invoiceNumber}`,
    waTarget || SCHOOL_CONFIG.whatsapp
  );

  const receiptContent = (
    <div
      id="printable-struk-receipt"
      className="bg-white text-slate-900 w-full max-w-sm mx-auto p-5 sm:p-6 rounded-2xl border-2 border-dashed border-slate-300 shadow-xl relative font-mono text-[11px] sm:text-xs leading-relaxed"
    >
      {/* Efek Garis Gerigi Kertas Kasir (Top & Bottom) */}
      <div className="absolute -top-1.5 left-4 right-4 h-1.5 bg-gradient-to-r from-transparent via-slate-300/60 to-transparent rounded-full print:hidden" />

      {/* 1. Header Sekolah */}
      <div className="text-center space-y-0.5 pb-2">
        <div className="font-black text-sm sm:text-base tracking-tight uppercase text-slate-900 font-sans">
          {SCHOOL_CONFIG.name}
        </div>
        <div className="text-[10px] text-slate-500 font-sans font-semibold">
          NPSN: {SCHOOL_CONFIG.npsn} &bull; {SCHOOL_CONFIG.accreditationLabel}
        </div>
        <div className="text-[10px] text-slate-500 font-sans leading-tight">
          {SCHOOL_CONFIG.address}
        </div>
        <div className="text-[9.5px] text-slate-400 font-sans">
          Telp: {SCHOOL_CONFIG.phone} &bull; WA: {SCHOOL_CONFIG.whatsapp}
        </div>
      </div>

      {/* Garis Pembatas Ganda */}
      <div className="border-b-2 border-dashed border-slate-900 my-2" />

      {/* 2. Judul Struk */}
      <div className="text-center py-1">
        <span className="font-extrabold tracking-wider uppercase text-xs sm:text-sm bg-slate-100 px-2.5 py-0.5 rounded-sm">
          STRUK BUKTI PEMBAYARAN
        </span>
      </div>

      <div className="border-b border-dashed border-slate-400 my-2" />

      {/* 3. Metadata Transaksi */}
      <div className="space-y-1 text-slate-700">
        <div className="flex justify-between">
          <span className="text-slate-500">No. Struk</span>
          <span className="font-bold text-slate-900">{strukNumber}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">No. Invoice</span>
          <span className="font-bold text-slate-900">{transaction.invoiceNumber}</span>
        </div>
        {transaction.receiptNumber && (
          <div className="flex justify-between">
            <span className="text-slate-500">No. Kwitansi</span>
            <span className="font-semibold text-slate-800">{transaction.receiptNumber}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-slate-500">Waktu Bayar</span>
          <span className="text-slate-900 font-medium">
            {formatDateIndo(transaction.paidAt || transaction.createdAt, true)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Kanal/Kasir</span>
          <span className="text-slate-800 font-medium">
            Online ({transaction.paymentGateway})
          </span>
        </div>
      </div>

      <div className="border-b border-dashed border-slate-400 my-2" />

      {/* 4. Data Siswa */}
      <div className="space-y-1 text-slate-700">
        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
          Data Peserta Didik
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Nama Siswa</span>
          <span className="font-bold text-slate-900 text-right truncate max-w-[190px]">
            {transaction.studentName}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">NISN / No. Reg</span>
          <span className="font-medium text-slate-800">{transaction.studentRegistrationNumber}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Kelas / Rombel</span>
          <span className="font-medium text-slate-800">{transaction.studentClass}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Wali Murid</span>
          <span className="font-medium text-slate-800 text-right truncate max-w-[180px]">
            {transaction.parentName}
          </span>
        </div>
      </div>

      <div className="border-b border-dashed border-slate-400 my-2" />

      {/* 5. Rincian Tagihan */}
      <div className="space-y-1.5 text-slate-700">
        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
          Rincian Pembayaran
        </div>
        <div>
          <div className="font-bold text-slate-900 leading-snug">
            {transaction.paymentTitle}
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
            <span>Periode: {transaction.period}</span>
            <span className="font-semibold text-slate-800">
              {formatRupiah(transaction.amount)}
            </span>
          </div>
        </div>

        {transaction.adminFee > 0 && (
          <div className="flex justify-between text-[10.5px] text-slate-600">
            <span>Biaya Layanan Gateway</span>
            <span>{formatRupiah(transaction.adminFee)}</span>
          </div>
        )}
      </div>

      <div className="border-b-2 border-dashed border-slate-900 my-2.5" />

      {/* 6. Total Pembayaran & Status Lunas */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-baseline text-sm sm:text-base font-black text-slate-900">
          <span>TOTAL BAYAR</span>
          <span className="text-blue-900">{formatRupiah(transaction.totalAmount)}</span>
        </div>

        <div className="text-[9.5px] text-slate-500 italic bg-slate-50 p-1.5 rounded-sm border border-slate-200">
          Terbilang: &ldquo;{terbilang(transaction.totalAmount)}&rdquo;
        </div>

        <div className="pt-1.5 space-y-1 text-slate-700 text-[10.5px]">
          <div className="flex justify-between">
            <span className="text-slate-500">Metode Bayar</span>
            <span className="font-bold text-slate-900">
              {transaction.paymentMethod.replace("_", " ")}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Status Transaksi</span>
            <span
              className={`font-black px-2 py-0.5 rounded-sm ${
                isSuccess
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  : "bg-amber-100 text-amber-800 border border-amber-300"
              }`}
            >
              {isSuccess ? "*** LUNAS (PAID) ***" : transaction.status}
            </span>
          </div>
          <div className="flex justify-between text-[9.5px]">
            <span className="text-slate-400">Ref. ID Gateway</span>
            <span className="font-mono text-slate-500 truncate max-w-[180px]">
              {transaction.gatewayTransactionId}
            </span>
          </div>
        </div>
      </div>

      <div className="border-b border-dashed border-slate-400 my-2.5" />

      {/* 7. QR Code Validasi Digital */}
      <div className="py-2 text-center space-y-1">
        <div className="w-20 h-20 mx-auto bg-white p-1 rounded-lg border border-slate-300 shadow-2xs flex items-center justify-center">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=STRUK_${encodeURIComponent(
              transaction.invoiceNumber
            )}`}
            alt="QR Validasi Struk"
            className="w-full h-full object-contain"
          />
        </div>
        <p className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">
          Pindai untuk Validasi Dokumen Sah
        </p>
      </div>

      <div className="border-b-2 border-dashed border-slate-900 my-2" />

      {/* 8. Catatan Kaki Struk */}
      <div className="text-center text-[9.5px] text-slate-500 space-y-0.5 leading-snug">
        <p className="font-bold text-slate-700">
          TERIMA KASIH ATAS PEMBAYARAN ANDA
        </p>
        <p>Simpan struk ini sebagai bukti pembayaran elektronik yang sah.</p>
        <p className="text-[9px] text-slate-400 pt-0.5">
          website-sekolah-sd.vercel.app
        </p>
      </div>
    </div>
  );

  return (
    <div className={isModal ? "p-1 sm:p-2 space-y-5" : "space-y-6"}>
      {/* Area Struk yang Dicetak */}
      {receiptContent}

      {/* Tombol Aksi Struk (Disembunyikan saat mencetak) */}
      <div className="struk-action-buttons max-w-sm mx-auto space-y-2.5 print:hidden">
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={handlePrint}
            variant="primary"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl gap-1.5 shadow-md active:scale-98"
          >
            <Printer className="h-4 w-4" />
            <span>Cetak Struk</span>
          </Button>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs py-2.5 px-3 rounded-xl shadow-md transition-all active:scale-98"
          >
            <Share2 className="h-4 w-4" />
            <span>Kirim WhatsApp</span>
          </a>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={handleCopyText}
            variant="outline"
            className="w-full text-xs font-semibold gap-1.5 rounded-xl border-slate-300 hover:bg-slate-50"
          >
            {copiedText ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span>Struk Tersalin</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Salin Teks Struk</span>
              </>
            )}
          </Button>

          <Link
            href={`/pembayaran/kwitansi/${transaction.invoiceNumber}`}
            className="w-full inline-flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2.5 px-3 rounded-xl transition-all border border-slate-200"
          >
            <FileText className="h-3.5 w-3.5 text-blue-600" />
            <span>Kwitansi A4 PDF</span>
          </Link>
        </div>

        {isModal && onClose && (
          <Button
            onClick={onClose}
            variant="ghost"
            className="w-full text-xs text-slate-500 hover:text-slate-800 py-2"
          >
            Tutup Pratinjau Struk
          </Button>
        )}
      </div>
    </div>
  );
}
