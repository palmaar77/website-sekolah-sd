import type { Metadata } from "next";
import Link from "next/link";
import {
  GraduationCap,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Calendar,
  Lock,
  Phone,
  HelpCircle,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Pusat Login & Portal Layanan Digital | SD Negeri Harapan Bangsa",
  description:
    "Gerbang akses resmi sistem informasi SDN Harapan Bangsa untuk Siswa, Calon Siswa PPDB, Guru, dan Administrator Sekolah.",
};

export default function UnifiedLoginPage() {
  return (
    <div className="min-h-[85vh] bg-gradient-to-b from-blue-50/70 via-slate-50 to-white py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-5xl mx-auto w-full space-y-10">
        {/* Tombol Kembali ke Beranda */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors bg-white/80 px-4 py-2 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Beranda Website</span>
          </Link>
        </div>

        {/* Header Seksi */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-3.5 py-1.5 rounded-full border border-blue-200">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>Pusat Layanan Digital Terpadu</span>
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Pilih Portal Masuk Sekolah
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Silakan pilih peran Anda di bawah ini untuk mengakses layanan sistem yang sesuai, aman, dan terintegrasi.
          </p>
        </div>

        {/* 2 Kartu Peran Portal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* 1. KARTU PORTAL SISWA & PPDB */}
          <div className="relative group bg-white rounded-3xl p-8 sm:p-10 border-2 border-blue-200/80 shadow-lg shadow-blue-500/5 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Badge & Icon */}
              <div className="flex items-center justify-between">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
                  <GraduationCap className="h-9 w-9 text-amber-300" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-3 py-1 rounded-full border border-amber-200">
                  Siswa & Orang Tua
                </span>
              </div>

              {/* Title & Deskripsi */}
              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Portal Siswa & PPDB
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Akses khusus bagi calon peserta didik baru dan orang tua/wali murid untuk memantau proses akademik dan pendaftaran.
                </p>
              </div>

              {/* Fitur Utama */}
              <div className="space-y-3 pt-2 border-t border-slate-100 text-xs sm:text-sm text-slate-700">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Cek status seleksi & hasil pengumuman PPDB 2025/2026</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <FileText className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>Unduh & cetak lembar bukti pendaftaran resmi</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Calendar className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>Informasi jadwal verifikasi berkas & daftar ulang</span>
                </div>
              </div>
            </div>

            {/* Tombol Masuk Siswa */}
            <div className="mt-8 pt-6 border-t border-slate-100 space-y-3">
              <Link
                href="/siswa/login"
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3.5 px-6 rounded-2xl text-sm shadow-md shadow-blue-500/20 hover:shadow-lg transition-all active:scale-[0.99]"
              >
                <span>Masuk Portal Siswa</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <div className="text-center">
                <Link
                  href="/ppdb/daftar"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors hover:underline"
                >
                  Belum punya nomor pendaftaran? Daftar PPDB di sini &rarr;
                </Link>
              </div>
            </div>
          </div>

          {/* 2. KARTU PORTAL ADMIN & GURU */}
          <div className="relative group bg-white rounded-3xl p-8 sm:p-10 border-2 border-slate-200 hover:border-slate-800 shadow-lg shadow-slate-500/5 hover:shadow-xl hover:shadow-slate-500/10 transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Badge & Icon */}
              <div className="flex items-center justify-between">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 flex items-center justify-center text-white shadow-md shadow-slate-900/25 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="h-9 w-9 text-amber-400" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800 px-3 py-1 rounded-full border border-slate-200">
                  Guru & Administrator
                </span>
              </div>

              {/* Title & Deskripsi */}
              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold text-slate-900 group-hover:text-slate-800 transition-colors">
                  Portal Admin & Guru
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Akses khusus manajemen sekolah untuk Kepala Sekolah, Dewan Guru, Staf Tata Usaha, dan Administrator IT.
                </p>
              </div>

              {/* Fitur Utama */}
              <div className="space-y-3 pt-2 border-t border-slate-100 text-xs sm:text-sm text-slate-700">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Verifikasi berkas calon siswa & ekspor data pendaftar (CSV)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <FileText className="h-4 w-4 text-slate-700 shrink-0 mt-0.5" />
                  <span>Publikasi artikel berita, agenda sekolah, dan pengumuman</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Lock className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>Kelola profil sekolah, guru, galeri, fasilitas, & audit log</span>
                </div>
              </div>
            </div>

            {/* Tombol Masuk Admin */}
            <div className="mt-8 pt-6 border-t border-slate-100 space-y-3">
              <Link
                href="/admin/login"
                className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-6 rounded-2xl text-sm shadow-md shadow-slate-900/20 hover:shadow-lg transition-all active:scale-[0.99]"
              >
                <span>Masuk Portal Admin / Guru</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <div className="text-center">
                <span className="text-xs text-slate-500">
                  Diawasi dengan keamanan sesi terenkripsi & rate limiter
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Informasi Kontak & Bantuan */}
        <div className="p-6 rounded-3xl bg-blue-50/80 border border-blue-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Mengalami kendala saat masuk?</h4>
              <p className="text-xs text-slate-600">
                Hubungi panitia PPDB atau tim IT SDN Harapan Bangsa pada jam operasional kerja.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/kontak"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-white px-4 py-2 rounded-xl border border-blue-200 hover:bg-blue-50 transition-colors"
            >
              <Phone className="h-3.5 w-3.5" />
              <span>Hubungi Kami</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
