"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { GraduationCap, Lock, Mail, Eye, EyeOff, ArrowLeft, ShieldCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/admin";

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || "Gagal masuk. Periksa kembali email dan kata sandi Anda.");
        setIsLoading(false);
        return;
      }

      // Berhasil login
      router.push(from);
      router.refresh();
    } catch {
      setErrorMessage("Terjadi kesalahan jaringan atau server.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Background Subtle Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Beranda Website</span>
        </Link>

        {/* Card Box */}
        <div className="bg-slate-800/90 backdrop-blur-md border border-slate-700/80 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-black/40">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 items-center justify-center text-white shadow-lg shadow-blue-500/30 mb-4 ring-4 ring-blue-500/20">
              <GraduationCap className="h-9 w-9 text-amber-300" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[11px] font-bold tracking-wide uppercase mb-3">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
              <span>Area Terbatas Internal</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Portal Admin & Guru
            </h1>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              SD Negeri Harapan Bangsa • Sistem Manajemen Sekolah
            </p>

            {/* Badges Otorisasi Akses */}
            <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
              <span className="text-[10px] font-semibold bg-slate-700/60 text-slate-300 px-2.5 py-0.5 rounded-md border border-slate-600/50">
                Administrator
              </span>
              <span className="text-[10px] font-semibold bg-slate-700/60 text-slate-300 px-2.5 py-0.5 rounded-md border border-slate-600/50">
                Dewan Guru
              </span>
              <span className="text-[10px] font-semibold bg-slate-700/60 text-slate-300 px-2.5 py-0.5 rounded-md border border-slate-600/50">
                Staf Tata Usaha
              </span>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3">
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Email Terdaftar
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  spellCheck={false}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@sdharapanbangsa.sch.id"
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-11 py-3 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200"
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full mt-2 font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3 shadow-lg shadow-blue-600/30 transition-all active:scale-[0.99]"
            >
              Masuk ke Dashboard
            </Button>
          </form>

          {/* Security Information Box */}
          <div className="mt-8 pt-6 border-t border-slate-700/80">
            <div className="bg-slate-900/70 rounded-2xl p-4 border border-slate-700/50 text-xs flex items-start gap-3">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-[11px] text-slate-400 leading-relaxed">
                <span className="font-semibold text-slate-200 block mb-0.5">Sesi Terenkripsi & Terlindungi:</span>
                Portal ini hanya dapat diakses oleh Administrator, Dewan Guru, dan Tenaga Kependidikan resmi sekolah. Seluruh aktivitas otentikasi dicatat dalam audit log.
              </div>
            </div>
          </div>
        </div>

        {/* Bantuan & Navigasi Ekstra */}
        <div className="text-center text-xs text-slate-500 mt-6 space-y-2">
          <p>
            Bukan staf pengajar atau panitia sekolah?{" "}
            <Link href="/siswa/login" className="text-blue-400 hover:text-blue-300 underline font-medium">
              Buka Portal Siswa & PPDB
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-sm">Memuat halaman login...</div>}>
      <LoginForm />
    </React.Suspense>
  );
}
