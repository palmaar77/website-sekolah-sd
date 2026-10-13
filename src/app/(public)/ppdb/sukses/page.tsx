"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Printer,
  Search,
  ArrowRight,
  GraduationCap,
  Calendar,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

function PPDBSuksesContent() {
  const searchParams = useSearchParams();
  const registrationNumber = searchParams.get("reg") || "PPDB-2025-XXXXX";
  const fullName = searchParams.get("name") || "Calon Siswa";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="py-12 pb-24 bg-slate-50 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Print Card Wrapper */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-100 space-y-8 print:shadow-none print:border-none print:p-0">
          {/* Header Icon & Title */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="h-9 w-9" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Pendaftaran Berhasil Dikirim!
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Terima kasih. Berkas pendaftaran ananda telah diterima oleh sistem PPDB daring SD Negeri Harapan Bangsa.
            </p>
          </div>

          {/* Kartu Bukti Registrasi Resmi */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-900 to-indigo-900 text-white space-y-5 shadow-lg border border-blue-800">
            <div className="flex items-center justify-between border-b border-blue-800/80 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                  <GraduationCap className="h-5 w-5 text-amber-300" />
                </div>
                <div>
                  <span className="font-extrabold text-xs text-white block">SDN HARAPAN BANGSA</span>
                  <span className="text-[10px] text-blue-200 block">BUKTI PENDAFTARAN PPDB 2025</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-[10px]">
                TAHAP 1: DITERIMA SISTEM
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-blue-300 block text-[11px]">Nomor Registrasi Resmi:</span>
                <span className="font-mono text-2xl font-black text-amber-400 tracking-wider">
                  {registrationNumber}
                </span>
              </div>

              <div>
                <span className="text-blue-300 block text-[11px]">Nama Calon Siswa:</span>
                <span className="font-bold text-white text-base">{fullName}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-blue-800/60 text-[11px]">
                <div>
                  <span className="text-blue-300 block">Status Awal:</span>
                  <span className="font-semibold text-white">Menunggu Verifikasi</span>
                </div>
                <div>
                  <span className="text-blue-300 block">Tanggal Registrasi:</span>
                  <span className="font-semibold text-white">
                    {new Intl.DateTimeFormat("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }).format(new Date())}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Petunjuk Selanjutnya */}
          <div className="space-y-3 text-xs text-slate-600 bg-slate-50 p-5 rounded-2xl border border-slate-100">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              <span>Instruksi Langkah Selanjutnya:</span>
            </h4>
            <ol className="list-decimal pl-4 space-y-1.5 leading-relaxed">
              <li>
                <strong>Simpan atau Cetak Bukti Ini:</strong> Catat nomor registrasi <strong>{registrationNumber}</strong> untuk keperluan verifikasi dan daftar ulang.
              </li>
              <li>
                <strong>Verifikasi Panitia:</strong> Panitia PPDB akan memverifikasi berkas domisili dalam 1-3 hari kerja.
              </li>
              <li>
                <strong>Cek Status Secara Berkala:</strong> Anda dapat memeriksa hasil seleksi secara mandiri melalui menu <em>Cek Status Pendaftaran</em> dengan memasukkan nomor registrasi di atas.
              </li>
            </ol>
          </div>

          {/* Action buttons (sembunyi saat cetak) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 print:hidden">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrint}
              className="w-full sm:w-auto gap-2"
            >
              <Printer className="h-4 w-4" />
              <span>Cetak Bukti Pendaftaran</span>
            </Button>

            <Link
              href="/ppdb/status"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm"
            >
              <Search className="h-4 w-4" />
              <span>Cek Status Hasil Seleksi</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PPDBSuksesPage() {
  return (
    <React.Suspense fallback={<div className="py-20 text-center text-slate-400 text-sm">Memuat bukti pendaftaran...</div>}>
      <PPDBSuksesContent />
    </React.Suspense>
  );
}
