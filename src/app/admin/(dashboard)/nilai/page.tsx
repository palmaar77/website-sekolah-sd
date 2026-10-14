"use client";

import * as React from "react";
import Link from "next/link";
import {
  Award,
  GraduationCap,
  Search,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Printer,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface StudentSummary {
  registrationNumber: string;
  fullName: string;
  className: string;
  semester: string;
  gpa: number;
  rank: string;
  status: string;
}

export default function AdminNilaiPage() {
  const [students, setStudents] = React.useState<StudentSummary[]>([]);
  const [search, setSearch] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedStudent, setSelectedStudent] = React.useState<any | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = React.useState(false);

  React.useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/admin/nilai");
        const json = await res.json();
        if (json.success && json.data) {
          setStudents(json.data);
        }
      } catch (err) {
        console.error("Gagal memuat nilai admin:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleViewDetail = async (regNumber: string) => {
    setIsLoadingDetail(true);
    try {
      const res = await fetch(`/api/siswa/nilai/${encodeURIComponent(regNumber)}`);
      const json = await res.json();
      if (json.success && json.data) {
        setSelectedStudent(json.data);
      } else {
        alert(json.message || "Gagal memuat detail nilai.");
      }
    } catch {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.registrationNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.className.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              Role: Guru & Administrator (RBAC)
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Manajemen Nilai & Rapor Siswa
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Kelola dan pantau capaian kompetensi belajar siswa Kurikulum Merdeka secara terpusat.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-4 py-2 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Otorisasi Server Aktif</span>
          </div>
        </div>
      </div>

      {/* Bar Pencarian */}
      <Card className="p-4 rounded-2xl bg-white border border-slate-200">
        <div className="relative">
          <Input
            placeholder="Cari berdasarkan nama siswa atau nomor registrasi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 text-xs sm:text-sm rounded-xl"
          />
          <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>
      </Card>

      {/* Tabel Nilai Siswa */}
      <Card className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3.5 px-6">Siswa & No. Registrasi</th>
                <th className="py-3.5 px-6">Kelas & Fase</th>
                <th className="py-3.5 px-6 text-center">Rata-Rata Nilai</th>
                <th className="py-3.5 px-6 text-center">Peringkat Kelas</th>
                <th className="py-3.5 px-6">Status Capaian</th>
                <th className="py-3.5 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Memuat data nilai siswa...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Tidak ada data siswa yang cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s.registrationNumber} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">{s.fullName}</div>
                      <div className="font-mono text-xs text-blue-600 font-semibold mt-0.5">
                        {s.registrationNumber}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      <div>{s.className}</div>
                      <div className="text-[11px] text-slate-400">{s.semester}</div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="font-black text-base text-slate-900 bg-slate-100 px-3 py-1 rounded-xl">
                        {s.gpa}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="text-xs font-semibold text-slate-700 bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-full">
                        {s.rank}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant="success">Tuntas</Badge>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDetail(s.registrationNumber)}
                        disabled={isLoadingDetail}
                        className="text-xs rounded-xl gap-1.5"
                      >
                        <FileText className="h-3.5 w-3.5 text-blue-600" />
                        <span>Rapor Detail</span>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal / Detail Rapor Siswa Terpilih */}
      {selectedStudent && (
        <Card className="p-6 sm:p-8 rounded-3xl border-2 border-blue-200 bg-white shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold">
                <GraduationCap className="h-6 w-6 text-amber-300" />
              </div>
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  Rapor Digital Kurikulum Merdeka (Tinjauan Guru)
                </span>
                <h3 className="text-xl font-extrabold text-slate-900">{selectedStudent.fullName}</h3>
                <p className="text-xs text-slate-500 font-mono">
                  No. Registrasi: {selectedStudent.registrationNumber} &bull; NISN: {selectedStudent.nisn}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="text-xs rounded-xl gap-1.5"
              >
                <Printer className="h-4 w-4" />
                <span>Cetak Rapor</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedStudent(null)}
                className="text-xs rounded-xl"
              >
                Tutup
              </Button>
            </div>
          </div>

          {/* Grid Nilai Mata Pelajaran */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-xs uppercase">
                <tr>
                  <th className="py-3 px-4">Mata Pelajaran</th>
                  <th className="py-3 px-4 text-center">KKM</th>
                  <th className="py-3 px-4 text-center">Nilai Akhir</th>
                  <th className="py-3 px-4 text-center">Predikat</th>
                  <th className="py-3 px-4">Capaian Kompetensi Pembelajaran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedStudent.subjects.map((sub: any) => (
                  <tr key={sub.code} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 font-bold text-slate-900">{sub.name}</td>
                    <td className="py-3 px-4 text-center text-slate-500">{sub.kkm}</td>
                    <td className="py-3 px-4 text-center font-black text-blue-700 text-base">
                      {sub.score}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2 py-0.5 font-bold rounded-lg bg-emerald-50 text-emerald-800 text-xs">
                        {sub.predicate}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 leading-relaxed max-w-md">
                      {sub.competencyDesc}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Catatan Wali Kelas */}
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 text-xs space-y-1">
            <div className="font-bold text-blue-900">Catatan Wali Kelas:</div>
            <p className="text-slate-700 leading-relaxed">{selectedStudent.teacherNotes}</p>
            <div className="pt-2 text-slate-500 text-[11px]">
              Wali Kelas: <strong>{selectedStudent.homeroomTeacher}</strong> (NIP: {selectedStudent.homeroomTeacherNip})
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
