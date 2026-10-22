import Link from "next/link";
import { GraduationCap, Home, Lock, ShieldCheck } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100/50 to-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-500/20 ring-4 ring-blue-500/10">
        <GraduationCap className="h-9 w-9 text-amber-300" />
      </div>

      <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-3 py-1 rounded-full border border-blue-200 mb-3">
        Error 404 • Halaman Tidak Ditemukan
      </span>

      <h1 className="text-5xl sm:text-6xl font-black text-slate-900 tracking-tight">404</h1>
      <h2 className="text-lg sm:text-xl font-bold text-slate-800 mt-2">Halaman Tidak Ditemukan</h2>
      <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-md leading-relaxed">
        Maaf, halaman atau informasi yang Anda cari mungkin telah dipindahkan, diubah jalurnya, atau tautan tidak valid.
      </p>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-sm">
        <Link
          href="/"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-blue-600/20 transition-all active:scale-[0.99]"
        >
          <Home className="h-4 w-4" />
          <span>Kembali ke Beranda</span>
        </Link>
        <Link
          href="/admin/login"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-slate-900/10 transition-all active:scale-[0.99]"
        >
          <Lock className="h-4 w-4 text-amber-400" />
          <span>Login Admin & Guru</span>
        </Link>
      </div>

      {/* Catatan Keamanan Akses */}
      <div className="mt-6 flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 px-3.5 py-1.5 rounded-full border border-slate-200">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
        <span>Kredensial login (ID & Kata Sandi) hanya dimiliki oleh Administrator dan Dewan Guru.</span>
      </div>
    </div>
  );
}
