"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Phone,
  FileText,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function StudentLoginPage() {
  const router = useRouter();
  const [registrationNumber, setRegistrationNumber] = React.useState("");
  const [parentPhone, setParentPhone] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!registrationNumber.trim()) {
      setErrorMessage("Nomor Registrasi PPDB wajib diisi.");
      return;
    }

    if (!parentPhone.trim()) {
      setErrorMessage("Nomor WhatsApp / Telepon wajib diisi.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/student-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationNumber: registrationNumber.trim(),
          parentPhone: parentPhone.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push("/siswa/dashboard");
      } else {
        setErrorMessage(
          data.message ||
            "Nomor registrasi atau kontak verifikasi tidak sesuai. Mohon periksa kembali."
        );
      }
    } catch {
      setErrorMessage("Terjadi gangguan koneksi. Silakan coba kembali sesaat lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-gradient-to-b from-blue-50/70 via-slate-50 to-white py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-md mx-auto w-full space-y-8">
        {/* Navigasi Balik */}
        <div className="flex items-center justify-between">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Pilih Portal Lain</span>
          </Link>
          <Link
            href="/"
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            Beranda Website
          </Link>
        </div>

        {/* Card Login Siswa */}
        <Card className="p-8 sm:p-10 rounded-3xl border-2 border-blue-200/80 shadow-xl shadow-blue-500/5 space-y-6 bg-white">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-md shadow-blue-500/20">
              <GraduationCap className="h-9 w-9 text-amber-300" />
            </div>
            <span className="inline-block text-[11px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-3 py-1 rounded-full border border-blue-200">
              Portal Siswa & PPDB
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Masuk Akun Siswa
            </h1>
            <p className="text-xs text-slate-600 leading-relaxed">
              Masukkan Nomor Registrasi PPDB dan Nomor WhatsApp/Telepon wali yang didaftarkan.
            </p>
          </div>

          {errorMessage && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
              <div className="leading-relaxed">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="registrationNumber"
                className="block text-xs font-bold text-slate-700"
              >
                Nomor Registrasi PPDB
              </label>
              <div className="relative">
                <Input
                  id="registrationNumber"
                  type="text"
                  placeholder="Contoh: PPDB-2025-00001"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  className="rounded-xl uppercase font-mono tracking-wide text-sm pl-10"
                  required
                />
                <FileText className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
              <p className="text-[11px] text-slate-500">
                Didapatkan saat formulir PPDB online pertama kali dikirimkan.
              </p>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="parentPhone"
                className="block text-xs font-bold text-slate-700"
              >
                Nomor WhatsApp / Telepon Wali
              </label>
              <div className="relative">
                <Input
                  id="parentPhone"
                  type="tel"
                  placeholder="Contoh: 081234567890"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  className="rounded-xl text-sm pl-10"
                  required
                />
                <Phone className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
              <p className="text-[11px] text-slate-500">
                Berfungsi sebagai kunci verifikasi identitas wali murid.
              </p>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl text-sm shadow-md shadow-blue-500/20 mt-2 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>Memverifikasi Akun...</span>
              ) : (
                <>
                  <span>Buka Dashboard Siswa</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="pt-4 border-t border-slate-100 space-y-2 text-center text-xs">
            <div>
              <span className="text-slate-500">Belum pernah mendaftar? </span>
              <Link
                href="/ppdb/daftar"
                className="font-bold text-blue-600 hover:text-blue-800 hover:underline"
              >
                Isi Formulir PPDB &rarr;
              </Link>
            </div>
            <div>
              <Link
                href="/admin/login"
                className="text-slate-500 hover:text-slate-800 transition-colors"
              >
                Login sebagai Guru / Staf Admin? Klik di sini
              </Link>
            </div>
          </div>
        </Card>

        {/* Petunjuk Penggunaan */}
        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-xs text-blue-900 space-y-1 flex items-start gap-2.5">
          <HelpCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>Catatan:</strong> Jika Anda lupa nomor registrasi atau nomor kontak yang didaftarkan, silakan hubungi Sekretariat Panitia PPDB di sekolah atau melalui menu Kontak.
          </div>
        </div>
      </div>
    </div>
  );
}
