"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ShieldAlert,
  ArrowLeft,
  GraduationCap,
  BookOpen,
  Award,
  Printer,
  ShieldCheck,
  Calendar,
  Lock,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DynamicStudentGradePage() {
  const params = useParams();
  const router = useRouter();
  const studentId = (params?.studentId as string) || "";

  const [data, setData] = React.useState<any | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [idorError, setIdorError] = React.useState<{
    code: string;
    message: string;
    attemptedTargetId?: string;
  } | null>(null);

  React.useEffect(() => {
    async function loadStudentGrade() {
      if (!studentId) return;
      setIsLoading(true);
      setIdorError(null);

      try {
        const res = await fetch(`/api/siswa/nilai/${encodeURIComponent(studentId)}`);
        const json = await res.json();

        if (res.status === 403) {
          // IDOR violation detected & blocked by server!
          setIdorError({
            code: json.code || "IDOR_FORBIDDEN",
            message:
              json.message ||
              "Akses ditolak: Anda tidak memiliki wewenang untuk melihat nilai atau data siswa lain.",
            attemptedTargetId: json.attemptedTargetId || studentId,
          });
        } else if (res.status === 401) {
          router.replace("/siswa/login");
        } else if (res.ok && json.success) {
          setData(json.data);
        } else {
          setIdorError({
            code: "ERROR",
            message: json.message || "Data nilai tidak ditemukan.",
          });
        }
      } catch {
        setIdorError({
          code: "NETWORK_ERROR",
          message: "Gagal terhubung ke server keamanan.",
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadStudentGrade();
  }, [studentId, router]);

  if (isLoading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
        <p className="text-sm font-semibold text-slate-600">
          Memeriksa otorisasi server untuk ID: {studentId}...
        </p>
      </div>
    );
  }

  // Tampilan ketika Siswa mencoba mengakses data siswa lain (IDOR Blocker)
  if (idorError) {
    return (
      <div className="min-h-[80vh] bg-slate-50 flex items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full space-y-6">
          <Card className="p-8 sm:p-10 rounded-3xl border-2 border-rose-300 bg-white shadow-xl text-center space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <ShieldAlert className="h-11 w-11" />
            </div>

            <div className="space-y-2">
              <span className="inline-block text-[11px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 px-3 py-1 rounded-full border border-rose-200">
                403 Akses Terlarang (IDOR Protection)
              </span>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Proteksi Privasi Siswa Aktif
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed text-center">
                {idorError.message}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200 text-xs text-rose-900 text-left space-y-2 font-mono">
              <div className="flex items-center gap-1.5 font-bold text-rose-800">
                <Lock className="h-4 w-4" />
                <span>Log Keamanan Otorisasi:</span>
              </div>
              <div className="text-[11px] space-y-0.5">
                <div>&bull; Kode Status: <strong>HTTP 403 Forbidden</strong></div>
                <div>&bull; Percobaan ID URL: <strong className="text-rose-700">{studentId}</strong></div>
                <div>&bull; Aturan Keamanan: <strong>Validasi Server-Side RBAC (Anti-IDOR)</strong></div>
              </div>
              <p className="text-[10px] text-rose-700 pt-1 font-sans">
                Setiap siswa hanya diizinkan membuka dokumen dan nilai rapor atas nama dirinya sendiri. Mengganti parameter ID pada URL diblokir otomatis oleh server.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 justify-center">
              <Link
                href="/siswa/nilai"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-2xl text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all"
              >
                <span>Buka Nilai Rapor Saya</span>
              </Link>
              <Link
                href="/siswa/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-5 rounded-2xl text-xs sm:text-sm transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Jika diizinkan (misal Guru/Admin atau siswa itu sendiri)
  return (
    <div className="min-h-screen bg-slate-50/70 pb-24">
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white py-8 px-4 sm:px-6 lg:px-8 shadow-md print:hidden">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/siswa/dashboard"
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                Otorisasi Terverifikasi
              </span>
              <h1 className="text-xl sm:text-2xl font-black mt-0.5">
                Rapor Siswa: {data.fullName}
              </h1>
            </div>
          </div>

          <Button
            onClick={() => window.print()}
            className="bg-white text-blue-900 hover:bg-blue-50 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm gap-2"
          >
            <Printer className="h-4 w-4 text-blue-600" />
            <span>Cetak Rapor</span>
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        <Card className="p-6 sm:p-8 rounded-3xl border border-slate-200/90 bg-white shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-6">
            <div>
              <span className="text-xs text-blue-600 font-bold uppercase tracking-wider">
                SD NEGERI HARAPAN BANGSA
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {data.fullName}
              </h2>
              <div className="text-xs text-slate-500 font-mono mt-1">
                No. Registrasi: <strong>{data.registrationNumber}</strong> &bull; Kelas: {data.className}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-center">
              <div className="text-[10px] font-bold text-blue-800 uppercase">Nilai Rata-Rata</div>
              <div className="text-3xl font-black text-blue-900 mt-0.5">{data.gpa}</div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-xs uppercase">
                <tr>
                  <th className="py-3 px-4">Mata Pelajaran</th>
                  <th className="py-3 px-4 text-center">KKM</th>
                  <th className="py-3 px-4 text-center">Nilai Akhir</th>
                  <th className="py-3 px-4 text-center">Predikat</th>
                  <th className="py-3 px-4">Capaian Kompetensi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {data.subjects.map((sub: any) => (
                  <tr key={sub.code}>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{sub.name}</td>
                    <td className="py-3.5 px-4 text-center text-slate-500">{sub.kkm}</td>
                    <td className="py-3.5 px-4 text-center font-black text-blue-700 text-base">{sub.score}</td>
                    <td className="py-3.5 px-4 text-center font-bold">{sub.predicate}</td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">{sub.competencyDesc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
