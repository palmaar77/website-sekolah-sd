"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  ShieldCheck,
  User,
  Calendar,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatDateIndo } from "@/lib/utils";

interface StatusResult {
  registrationNumber: string;
  fullName: string;
  gender: string;
  path: string;
  status: "PENDING" | "VERIFYING" | "ACCEPTED" | "REJECTED";
  verificationNotes: string | null;
  createdAt: string;
}

export default function PPDBStatusPage() {
  const [registrationNumber, setRegistrationNumber] = React.useState("");
  const [parentPhone, setParentPhone] = React.useState("");
  const [isSearching, setIsSearching] = React.useState(false);
  const [result, setResult] = React.useState<StatusResult | null>(null);
  const [errorMsg, setErrorMsg] = React.useState("");
  const [hasSearched, setHasSearched] = React.useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setResult(null);
    setHasSearched(true);
    setIsSearching(true);

    try {
      const res = await fetch("/api/ppdb/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationNumber: registrationNumber.trim(),
          parentPhone: parentPhone.trim(),
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setResult(data.data);
      } else {
        setErrorMsg(data.message || "Data pendaftaran tidak ditemukan atau nomor verifikasi tidak cocok.");
      }
    } catch {
      setErrorMsg("Terjadi gangguan jaringan saat memproses pencarian.");
    } finally {
      setIsSearching(false);
    }
  };

  const renderStatusCard = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return (
          <div className="p-6 rounded-3xl bg-emerald-50 border-2 border-emerald-400 text-emerald-950 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block">
                  Hasil Seleksi PPDB
                </span>
                <h3 className="text-xl font-black text-emerald-900 leading-tight">
                  SELAMAT, CALON SISWA DITERIMA!
                </h3>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed pt-1">
              Selamat kepada orang tua/wali! Putra-putri Anda dinyatakan lolos seleksi penerimaan murid baru di SD Negeri Harapan Bangsa. Silakan siapkan berkas fisik untuk jadwal daftar ulang.
            </p>
          </div>
        );
      case "VERIFYING":
        return (
          <div className="p-6 rounded-3xl bg-amber-50 border-2 border-amber-400 text-amber-950 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0">
                <Clock className="h-7 w-7" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 block">
                  Hasil Seleksi PPDB
                </span>
                <h3 className="text-xl font-black text-amber-900 leading-tight">
                  SEDANG DALAM TAHAP VERIFIKASI
                </h3>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-amber-800 leading-relaxed pt-1">
              Berkas dan domisili calon siswa sedang dalam tahap pencocokan data oleh panitia penerimaan siswa baru. Pantau kembali secara berkala.
            </p>
          </div>
        );
      case "REJECTED":
        return (
          <div className="p-6 rounded-3xl bg-rose-50 border-2 border-rose-400 text-rose-950 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0">
                <XCircle className="h-7 w-7" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 block">
                  Hasil Seleksi PPDB
                </span>
                <h3 className="text-xl font-black text-rose-900 leading-tight">
                  BELUM DAPAT DITERIMA
                </h3>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-rose-800 leading-relaxed pt-1">
              Mohon maaf, kuota penerimaan jalur yang dipilih telah terpenuhi atau persyaratan zonasi/usia prioritas belum terpenuhi.
            </p>
          </div>
        );
      default:
        return (
          <div className="p-6 rounded-3xl bg-blue-50 border-2 border-blue-400 text-blue-950 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                <Clock className="h-7 w-7" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 block">
                  Hasil Seleksi PPDB
                </span>
                <h3 className="text-xl font-black text-blue-900 leading-tight">
                  MENUNGGU VERIFIKASI PANITIA
                </h3>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-blue-800 leading-relaxed pt-1">
              Formulir pendaftaran Anda telah tercatat dalam antrean verifikasi panitia. Petugas akan segera memproses berkas sesuai jadwal.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="py-12 pb-24 bg-slate-50 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 space-y-6">
        <Link
          href="/ppdb"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-blue-600 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Informasi PPDB</span>
        </Link>

        {/* Card Form Pencarian */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-100 space-y-6">
          <div className="text-center space-y-2 border-b border-slate-100 pb-6">
            <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider">
              Layanan Mandiri Orang Tua
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Cek Status Pendaftaran PPDB
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Masukkan Nomor Registrasi dan Nomor Telepon/WhatsApp yang didaftarkan untuk verifikasi keamanan data.
            </p>
          </div>

          <form onSubmit={handleSearch} className="space-y-4">
            <Input
              label="Nomor Registrasi PPDB"
              required
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
              placeholder="Contoh: PPDB-2025-A1001"
              helperText="Tercantum pada lembar bukti pendaftaran online"
            />

            <Input
              label="Nomor WhatsApp / Telepon Wali (Verifikasi Keamanan)"
              required
              type="tel"
              value={parentPhone}
              onChange={(e) => setParentPhone(e.target.value)}
              placeholder="Contoh: 081298765432"
              helperText="Hanya nomor terdaftar yang dapat melihat status pendaftaran"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSearching}
              className="w-full gap-2 mt-2"
            >
              <Search className="h-4 w-4" />
              <span>Periksa Status Sekarang</span>
            </Button>
          </form>

          {/* Quick Demo Hint */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600">
            <span className="font-bold text-slate-900 block mb-1">Contoh Data Pengujian Cepat:</span>
            <div className="space-y-0.5 font-mono text-[11px] text-slate-500">
              <div>Nomor: <strong>PPDB-2025-A1001</strong> • WA: <strong>081298765432</strong> (Status: Diterima)</div>
              <div>Nomor: <strong>PPDB-2025-B2002</strong> • WA: <strong>081311223344</strong> (Status: Sedang Diverifikasi)</div>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-medium">{errorMsg}</div>
            </div>
          )}

          {/* Hasil Pencarian */}
          {result && (
            <div className="pt-6 border-t border-slate-100 space-y-6 animate-in fade-in duration-200">
              {renderStatusCard(result.status)}

              {/* Detail Ringkas Calon Siswa */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 text-xs">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Rincian Calon Peserta Didik
                </h4>
                <div className="grid grid-cols-2 gap-3 text-slate-600">
                  <div>
                    <span className="text-slate-400 block">Nomor Registrasi:</span>
                    <span className="font-mono font-bold text-slate-900">{result.registrationNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Nama Lengkap:</span>
                    <span className="font-bold text-slate-900">{result.fullName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Jalur Seleksi:</span>
                    <span className="font-semibold text-blue-700">{result.path}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Tanggal Mendaftar:</span>
                    <span className="font-semibold text-slate-800">{formatDateIndo(result.createdAt, true)}</span>
                  </div>
                </div>

                {result.verificationNotes && (
                  <div className="pt-3 border-t border-slate-200/80">
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">
                      Catatan Verifikasi Panitia:
                    </span>
                    <p className="font-medium text-slate-800 mt-1 italic leading-relaxed">
                      &ldquo;{result.verificationNotes}&rdquo;
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
