"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  ArrowLeft,
  Printer,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  UserCheck,
  Sparkles,
  HeartHandshake,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SubjectItem {
  code: string;
  name: string;
  kkm: number;
  score: number;
  predicate: "A" | "B" | "C" | "D";
  competencyDesc: string;
}

interface ReportData {
  registrationNumber: string;
  fullName: string;
  nisn: string;
  className: string;
  semester: string;
  academicYear: string;
  phase: string;
  homeroomTeacher: string;
  homeroomTeacherNip: string;
  gpa: number;
  rank: string;
  totalSubjects: number;
  status: string;
  attendance: {
    sakit: number;
    izin: number;
    tanpaKeterangan: number;
  };
  extracurriculars: Array<{
    name: string;
    predicate: string;
    notes: string;
  }>;
  teacherNotes: string;
  subjects: SubjectItem[];
}

export default function StudentGradesPage() {
  const router = useRouter();
  const [report, setReport] = React.useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState("");

  React.useEffect(() => {
    async function fetchReport() {
      try {
        const res = await fetch("/api/siswa/nilai");
        const json = await res.json();
        if (res.ok && json.success && json.data) {
          setReport(json.data);
        } else {
          if (res.status === 401) {
            router.replace("/siswa/login");
          } else {
            setErrorMessage(json.message || "Gagal mengambil data nilai rapor.");
          }
        }
      } catch {
        setErrorMessage("Terjadi gangguan koneksi saat memuat nilai.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchReport();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
        <p className="text-sm font-semibold text-slate-600">Memuat Rapor Digital Siswa...</p>
      </div>
    );
  }

  if (errorMessage || !report) {
    return (
      <div className="min-h-[70vh] max-w-lg mx-auto px-4 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Kendala Akses Nilai</h2>
        <p className="text-xs text-slate-600">{errorMessage || "Data nilai belum tersedia."}</p>
        <Link
          href="/siswa/dashboard"
          className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Dashboard Siswa</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 pb-24">
      {/* Top Banner Navigation */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white py-8 px-4 sm:px-6 lg:px-8 shadow-md print:hidden">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/siswa/dashboard"
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              title="Kembali ke Dashboard Siswa"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">
                  Rapor Kurikulum Merdeka
                </span>
                <span className="text-xs text-blue-200">
                  {report.semester} &bull; {report.academicYear}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black mt-0.5">
                Nilai & Capaian Belajar Siswa
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => window.print()}
              className="bg-white text-blue-900 hover:bg-blue-50 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-sm gap-2"
            >
              <Printer className="h-4 w-4 text-blue-600" />
              <span>Cetak Rapor Siswa</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        {/* Identitas Siswa & Ringkasan Rapor */}
        <Card className="p-6 sm:p-8 rounded-3xl border border-slate-200/90 bg-white shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                <GraduationCap className="h-9 w-9 text-amber-300" />
              </div>
              <div>
                <span className="text-xs text-blue-600 font-bold uppercase tracking-wider block">
                  SD NEGERI HARAPAN BANGSA
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {report.fullName}
                </h2>
                <div className="flex items-center gap-3 text-xs text-slate-500 font-mono mt-1 flex-wrap">
                  <span>No. Registrasi: <strong className="text-slate-800">{report.registrationNumber}</strong></span>
                  <span>&bull;</span>
                  <span>NISN: <strong className="text-slate-800">{report.nisn}</strong></span>
                  <span>&bull;</span>
                  <span>Kelas: <strong className="text-slate-800">{report.className}</strong></span>
                </div>
              </div>
            </div>

            {/* IPK / Rata-Rata Card */}
            <div className="flex items-center gap-4 bg-blue-50/80 border border-blue-200/80 p-4 rounded-2xl">
              <div>
                <div className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">
                  Nilai Rata-Rata
                </div>
                <div className="text-3xl font-black text-blue-900 mt-0.5">
                  {report.gpa}
                </div>
              </div>
              <div className="h-10 w-px bg-blue-200" />
              <div>
                <div className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">
                  Peringkat Kelas
                </div>
                <div className="text-sm font-bold text-blue-950 mt-1 flex items-center gap-1">
                  <Award className="h-4 w-4 text-amber-500" />
                  <span>{report.rank}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Banner Validasi Keamanan Server */}
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Akses Terproteksi RBAC:</strong> Nilai ini diverifikasi server dan khusus untuk akun pendaftaran <strong>{report.registrationNumber}</strong>.
              </span>
            </div>
            <span className="hidden sm:inline-block text-[11px] font-bold bg-white text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
              Sesi Aman Terenkripsi
            </span>
          </div>

          {/* Tabel Nilai Mata Pelajaran */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-600" />
              <span>Capaian Hasil Belajar (Asesmen Sumatif & Formatif)</span>
            </h3>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">No</th>
                    <th className="py-3 px-4">Mata Pelajaran</th>
                    <th className="py-3 px-4 text-center">KKM</th>
                    <th className="py-3 px-4 text-center">Nilai Akhir</th>
                    <th className="py-3 px-4 text-center">Predikat</th>
                    <th className="py-3 px-4">Capaian Kompetensi & Deskripsi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {report.subjects.map((sub, index) => (
                    <tr key={sub.code} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-4 font-mono text-slate-400">{index + 1}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {sub.name}
                        <span className="block text-[11px] font-mono text-slate-400 font-normal">
                          Kode: {sub.code}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-500 font-medium">
                        {sub.kkm}
                      </td>
                      <td className="py-3.5 px-4 text-center font-black text-blue-700 text-base">
                        {sub.score}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-md font-black text-xs ${
                            sub.predicate === "A"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : "bg-blue-100 text-blue-800 border border-blue-200"
                          }`}
                        >
                          {sub.predicate}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600 leading-relaxed max-w-sm">
                        {sub.competencyDesc}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2 Kolom: Ekstrakurikuler & Kehadiran */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Ekstrakurikuler */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span>Kegiatan Ekstrakurikuler</span>
              </h4>
              <div className="space-y-2.5">
                {report.extracurriculars.map((ekskul) => (
                  <div
                    key={ekskul.name}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{ekskul.name}</span>
                      <span className="font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px]">
                        {ekskul.predicate}
                      </span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">{ekskul.notes}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Kehadiran & Ketidakhadiran */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4 text-indigo-600" />
                <span>Catatan Kehadiran Siswa</span>
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
                  <div className="text-slate-500 text-[11px] font-semibold">Sakit</div>
                  <div className="text-xl font-black text-slate-900 mt-1">
                    {report.attendance.sakit} <span className="text-xs font-normal text-slate-400">hari</span>
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
                  <div className="text-slate-500 text-[11px] font-semibold">Izin</div>
                  <div className="text-xl font-black text-slate-900 mt-1">
                    {report.attendance.izin} <span className="text-xs font-normal text-slate-400">hari</span>
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
                  <div className="text-slate-500 text-[11px] font-semibold">Tanpa Keterangan</div>
                  <div className="text-xl font-black text-slate-900 mt-1">
                    {report.attendance.tanpaKeterangan} <span className="text-xs font-normal text-slate-400">hari</span>
                  </div>
                </div>
              </div>

              {/* Catatan Guru */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs space-y-1.5 mt-2">
                <div className="font-bold text-amber-900 flex items-center gap-1.5">
                  <HeartHandshake className="h-4 w-4 text-amber-700" />
                  <span>Catatan Wali Kelas:</span>
                </div>
                <p className="text-slate-700 leading-relaxed italic">
                  &ldquo;{report.teacherNotes}&rdquo;
                </p>
                <div className="text-[11px] text-slate-500 pt-1">
                  Wali Kelas: <strong>{report.homeroomTeacher}</strong> (NIP: {report.homeroomTeacherNip})
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
