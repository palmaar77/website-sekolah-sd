"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  LogOut,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Printer,
  Calendar,
  User,
  MapPin,
  Phone,
  FileCheck,
  ShieldCheck,
  HelpCircle,
  ArrowRight,
  School,
  Award,
  BookOpen,
  Lock,
  ShieldAlert,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateIndo } from "@/lib/utils";

interface StudentData {
  id: string;
  registrationNumber: string;
  fullName: string;
  nik: string;
  birthPlace: string;
  birthDate: string;
  gender: "LAKI_LAKI" | "PEREMPUAN";
  religion?: string;
  address: string;
  parentName: string;
  parentPhone: string;
  path: "ZONASI" | "AFIRMASI" | "PRESTASI" | "PERPINDAHAN";
  status: "PENDING" | "VERIFIED" | "ACCEPTED" | "REJECTED";
  verificationNotes?: string | null;
  createdAt: string;
}

export default function StudentDashboardPage() {
  const router = useRouter();
  const [student, setStudent] = React.useState<StudentData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  React.useEffect(() => {
    async function loadStudent() {
      try {
        const res = await fetch("/api/auth/student-me");
        const json = await res.json();
        if (res.ok && json.success && json.data) {
          setStudent(json.data);
        } else {
          router.replace("/siswa/login");
        }
      } catch {
        router.replace("/siswa/login");
      } finally {
        setIsLoading(false);
      }
    }
    loadStudent();
  }, [router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/student-logout", { method: "POST" });
    } finally {
      router.replace("/siswa/login");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
        <p className="text-sm font-semibold text-slate-600">Memuat data portal siswa...</p>
      </div>
    );
  }

  if (!student) {
    return null;
  }

  const statusConfig = {
    ACCEPTED: {
      label: "SELAMAT, ANDA DITERIMA",
      color: "bg-emerald-500 text-white",
      border: "border-emerald-300",
      bgLight: "bg-emerald-50/80",
      textColor: "text-emerald-950",
      icon: CheckCircle2,
      desc: "Selamat! Calon peserta didik dinyatakan LULUS SELEKSI PPDB dan diterima di SD Negeri Harapan Bangsa. Silakan unduh bukti pendaftaran dan ikuti panduan daftar ulang.",
    },
    VERIFIED: {
      label: "BERKAS TERVERIFIKASI",
      color: "bg-blue-600 text-white",
      border: "border-blue-300",
      bgLight: "bg-blue-50/80",
      textColor: "text-blue-950",
      icon: ShieldCheck,
      desc: "Seluruh berkas administrasi dan data fisik telah lolos verifikasi panitia. Saat ini sedang dalam tahap pemeringkatan kuota jalur seleksi.",
    },
    PENDING: {
      label: "MENUNGGU VERIFIKASI",
      color: "bg-amber-500 text-white",
      border: "border-amber-300",
      bgLight: "bg-amber-50/80",
      textColor: "text-amber-950",
      icon: Clock,
      desc: "Formulir pendaftaran berhasil diterima sistem. Panitia sedang memeriksa kesesuaian dokumen pendaftaran Anda.",
    },
    REJECTED: {
      label: "TIDAK DITERIMA",
      color: "bg-rose-600 text-white",
      border: "border-rose-300",
      bgLight: "bg-rose-50/80",
      textColor: "text-rose-950",
      icon: XCircle,
      desc: "Mohon maaf, calon peserta didik belum memenuhi kriteria seleksi atau kuota jalur pendaftaran telah terpenuhi.",
    },
  }[student.status];

  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20">
      {/* Top Header Dashboard Siswa */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-inner">
              <GraduationCap className="h-9 w-9 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10">
                  Portal Siswa Digital
                </span>
                <span className="text-xs text-blue-200">
                  Tahun Ajaran 2025/2026
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
                {student.fullName}
              </h1>
              <p className="text-xs sm:text-sm text-blue-200 font-mono mt-0.5">
                No. Registrasi: <span className="text-white font-bold">{student.registrationNumber}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              href="/siswa/nilai"
              className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition-all active:scale-95"
            >
              <Award className="h-4 w-4 text-slate-950" />
              <span>Nilai & Rapor Siswa</span>
            </Link>
            <Link
              href={`/ppdb/sukses?no=${encodeURIComponent(student.registrationNumber)}`}
              className="inline-flex items-center gap-2 bg-white text-blue-900 hover:bg-blue-50 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-sm transition-all"
            >
              <Printer className="h-4 w-4 text-blue-600" />
              <span className="hidden sm:inline">Cetak Bukti</span>
            </Link>
            <Button
              variant="outline"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="border-white/30 text-white hover:bg-white/10 hover:text-white rounded-xl text-xs sm:text-sm"
            >
              <LogOut className="h-4 w-4 mr-1.5" />
              <span>Keluar</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 space-y-8">
        {/* Banner Status Kelulusan / Seleksi */}
        <Card className={`p-6 sm:p-8 rounded-3xl border-2 ${statusConfig.border} ${statusConfig.bgLight} shadow-md`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-2xl ${statusConfig.color} flex items-center justify-center shrink-0 shadow-sm mt-1`}>
                <StatusIcon className="h-6 w-6" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full ${statusConfig.color}`}>
                    {statusConfig.label}
                  </span>
                  <span className="text-xs font-semibold text-slate-600">
                    Jalur: <strong className="text-slate-900">{student.path}</strong>
                  </span>
                </div>
                <p className={`text-sm ${statusConfig.textColor} font-medium leading-relaxed`}>
                  {statusConfig.desc}
                </p>
                {student.verificationNotes && (
                  <div className="mt-3 p-3 rounded-xl bg-white/90 border border-slate-200 text-xs text-slate-800">
                    <strong className="text-slate-900">Catatan Panitia:</strong> {student.verificationNotes}
                  </div>
                )}
              </div>
            </div>

            {student.status === "ACCEPTED" && (
              <div className="shrink-0">
                <Link
                  href="/kontak"
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-3 rounded-2xl text-xs shadow-md transition-all"
                >
                  <span>Panduan Daftar Ulang</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </Card>

        {/* 2 Kolom Konten */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Kolom Kiri: Biodata Siswa */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs bg-white space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <User className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">Biodata Calon Siswa</h3>
                </div>
                <span className="text-xs text-slate-500 font-mono">
                  {student.gender === "LAKI_LAKI" ? "Laki-laki" : "Perempuan"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs sm:text-sm">
                <div>
                  <div className="text-slate-500 text-xs mb-1">Nama Lengkap</div>
                  <div className="font-bold text-slate-900">{student.fullName}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-xs mb-1">Nomor Induk Kependudukan (NIK)</div>
                  <div className="font-bold font-mono text-slate-900">{student.nik}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-xs mb-1">Tempat, Tanggal Lahir</div>
                  <div className="font-medium text-slate-800">
                    {student.birthPlace}, {formatDateIndo(student.birthDate)}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 text-xs mb-1">Jalur Seleksi PPDB</div>
                  <div className="font-bold text-blue-700">Jalur {student.path}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-xs mb-1">Nama Orang Tua / Wali</div>
                  <div className="font-medium text-slate-800">{student.parentName}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-xs mb-1">Nomor Kontak / WhatsApp</div>
                  <div className="font-mono font-medium text-slate-800">{student.parentPhone}</div>
                </div>
                <div className="sm:col-span-2">
                  <div className="text-slate-500 text-xs mb-1">Alamat Domisili</div>
                  <div className="font-medium text-slate-800 leading-relaxed">{student.address}</div>
                </div>
              </div>
            </Card>

            {/* Berkas & Dokumen Pendaftaran */}
            <Card className="p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs bg-white space-y-4">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <FileCheck className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Kelengkapan Dokumen PPDB</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <div>
                    <div className="font-bold text-xs text-slate-900">Akta Kelahiran</div>
                    <div className="text-[11px] text-emerald-700 font-semibold">Terlampir</div>
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <div>
                    <div className="font-bold text-xs text-slate-900">Kartu Keluarga (KK)</div>
                    <div className="text-[11px] text-emerald-700 font-semibold">Terlampir</div>
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <div>
                    <div className="font-bold text-xs text-slate-900">KTP Orang Tua</div>
                    <div className="text-[11px] text-emerald-700 font-semibold">Terlampir</div>
                  </div>
                </div>
              </div>
            </Card>
            {/* Card Pintasan Nilai & Rapor Digital Siswa */}
            <Card className="p-6 sm:p-8 rounded-3xl border-2 border-blue-200/90 bg-gradient-to-br from-white via-blue-50/40 to-indigo-50/30 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
                    <Award className="h-6 w-6 text-amber-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">
                        Akademik Merdeka
                      </span>
                      <span className="text-xs text-slate-500">Semester Ganjil 2024/2025</span>
                    </div>
                    <h3 className="text-lg font-extrabold text-slate-900 mt-1">
                      Rapor Digital & Capaian Nilai Siswa
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      Pantau perolehan nilai mata pelajaran, capaian kompetensi formatif-sumatif, ekstrakurikuler, dan catatan wali kelas.
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  <Link
                    href="/siswa/nilai"
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-3 rounded-2xl text-xs shadow-md shadow-blue-500/20 transition-all active:scale-95"
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>Buka Rapor Lengkap</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </Card>
          </div>

          {/* Kolom Kanan: Jadwal Penting & Bantuan */}
          <div className="space-y-6">
            {/* Kartu Status Keamanan Akun & Proteksi Anti-IDOR */}
            <Card className="p-6 rounded-3xl border-2 border-emerald-200/80 bg-emerald-50/60 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Proteksi Sesi & Anti-IDOR</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Akun ini terotentikasi secara aman di server. Sistem RBAC memastikan Anda hanya dapat membaca data milik sendiri:
              </p>
              <div className="p-2.5 rounded-xl bg-white border border-emerald-200 font-mono text-[11px] text-slate-700 space-y-1">
                <div>&bull; ID Akun: <strong>{student.registrationNumber}</strong></div>
                <div>&bull; Status Otorisasi: <span className="text-emerald-700 font-bold">Terverifikasi</span></div>
                <div>&bull; IDOR Prevention: <span className="text-blue-700 font-bold">Aktif di Server</span></div>
              </div>
              <div className="pt-1">
                <Link
                  href="/siswa/nilai/PPDB-2025-A1001"
                  className="text-[11px] font-semibold text-rose-700 hover:text-rose-900 hover:underline flex items-center gap-1"
                >
                  <Lock className="h-3 w-3" />
                  <span>Uji Akses ID Siswa Lain (Akan Diblokir 403) &rarr;</span>
                </Link>
              </div>
            </Card>
            {/* Jadwal Siswa Baru */}
            <Card className="p-6 rounded-3xl border border-slate-200/80 shadow-xs bg-white space-y-4">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Calendar className="h-4 w-4" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Agenda Siswa Baru</h4>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100">
                  <div className="font-bold text-blue-900 mb-0.5">Daftar Ulang Administrasi</div>
                  <div className="text-slate-600">10 Juli - 14 Juli 2025 (Pukul 08.00 - 14.00 WIB)</div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="font-bold text-slate-900 mb-0.5">Pengambilan Seragam & Atribut</div>
                  <div className="text-slate-600">15 Juli 2025 di Koperasi Sekolah</div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="font-bold text-slate-900 mb-0.5">Masa Pengenalan Lingkungan Sekolah (MPLS)</div>
                  <div className="text-slate-600">21 Juli - 23 Juli 2025</div>
                </div>
              </div>
            </Card>

            {/* Bantuan & Sekretariat */}
            <Card className="p-6 rounded-3xl border border-blue-200/80 bg-gradient-to-br from-blue-50 to-indigo-50/40 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                <HelpCircle className="h-4 w-4 text-blue-600" />
                <span>Sekretariat PPDB</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Jika terdapat kesalahan penulisan nama, alamat, atau ingin berkonsultasi mengenai daftar ulang, silakan hubungi tim panitia kami.
              </p>
              <div className="pt-2">
                <Link
                  href="/kontak"
                  className="w-full inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-xs transition-colors"
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span>Hubungi Panitia Sekolah</span>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
