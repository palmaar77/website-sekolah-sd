import Link from "next/link";
import { GraduationCap, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white mb-6 shadow-md shadow-blue-500/20">
        <GraduationCap className="h-9 w-9 text-amber-300" />
      </div>
      <h1 className="text-6xl font-black text-slate-900 tracking-tight">404</h1>
      <h2 className="text-xl font-bold text-slate-800 mt-2">Halaman Tidak Ditemukan</h2>
      <p className="text-sm text-slate-500 mt-2 max-w-md leading-relaxed">
        Maaf, halaman atau informasi yang Anda cari mungkin telah dipindahkan atau tautan tidak valid.
      </p>
      <div className="mt-8 flex items-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all"
        >
          <Home className="h-4 w-4" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>
    </div>
  );
}
