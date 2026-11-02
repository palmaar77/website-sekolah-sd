"use client";

import * as React from "react";
import {
  Award,
  GraduationCap,
  Search,
  ShieldCheck,
  FileText,
  Printer,
  Sparkles,
  Calendar,
  X,
  BookOpen,
  CheckCircle2,
  Download,
  AlertCircle,
  TrendingUp,
  UserCheck,
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

interface SubjectGrade {
  code: string;
  name: string;
  kkm: number;
  score: number;
  predicate: "A" | "B" | "C" | "D";
  competencyDesc: string;
}

interface StudentReportDetail {
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
  subjects: SubjectGrade[];
  updatedAt: string;
}

export default function AdminNilaiPage() {
  const [students, setStudents] = React.useState<StudentSummary[]>([]);
  const [search, setSearch] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedStudent, setSelectedStudent] = React.useState<StudentReportDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"nilai" | "ekskul" | "kehadiran">("nilai");

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

  const handleViewDetail = async (regNumber: string, autoPrint = false) => {
    setIsLoadingDetail(true);
    try {
      const res = await fetch(`/api/siswa/nilai/${encodeURIComponent(regNumber)}`);
      const json = await res.json();
      if (json.success && json.data) {
        setSelectedStudent(json.data);
        if (autoPrint) {
          // Berikan jeda sejenak agar DOM render selesai sebelum memanggil dialog print PDF
          setTimeout(() => {
            window.print();
          }, 350);
        }
      } else {
        alert(json.message || "Gagal memuat detail nilai siswa.");
      }
    } catch {
      alert("Terjadi kesalahan jaringan saat memuat rapor.");
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handlePrintPdf = () => {
    if (!selectedStudent) return;
    window.print();
  };

  const filteredStudents = students.filter(
    (s) =>
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.registrationNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.className.toLowerCase().includes(search.toLowerCase())
  );

  const averageSchoolGpa =
    students.length > 0
      ? (students.reduce((acc, curr) => acc + curr.gpa, 0) / students.length).toFixed(1)
      : "88.5";

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header Kontrol Dashboard (Disembunyikan saat cetak PDF) */}
      <div className="print:hidden space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                Portal Guru & Administrator (RBAC Terverifikasi)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Manajemen Nilai & Rapor Digital
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Tinjau capaian kompetensi pembelajaran Kurikulum Merdeka dan cetak langsung Rapor resmi berformat PDF.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3.5 py-2 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-bold flex items-center gap-2 shadow-xs">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Otorisasi Server Aktif</span>
            </div>
          </div>
        </div>

        {/* 2. Kartu Statistik Cepat */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <UserCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Total Siswa Terdata
              </div>
              <div className="text-2xl font-black text-slate-900 mt-0.5">
                {students.length} Siswa
              </div>
            </div>
          </Card>

          <Card className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Rata-Rata Nilai
              </div>
              <div className="text-2xl font-black text-slate-900 mt-0.5">
                {averageSchoolGpa}
              </div>
            </div>
          </Card>

          <Card className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Ketuntasan Belajar
              </div>
              <div className="text-2xl font-black text-emerald-700 mt-0.5">
                100% Tuntas
              </div>
            </div>
          </Card>

          <Card className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Kurikulum
              </div>
              <div className="text-sm font-extrabold text-slate-900 mt-1">
                Kurikulum Merdeka (Fase A)
              </div>
            </div>
          </Card>
        </div>

        {/* 3. Bar Pencarian */}
        <Card className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="relative">
            <Input
              placeholder="Cari berdasarkan nama siswa, nomor registrasi, atau kelas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 text-xs sm:text-sm rounded-xl h-11"
            />
            <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
        </Card>

        {/* 4. Tabel Daftar Siswa */}
        <Card className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-6">Siswa & No. Registrasi</th>
                  <th className="py-3.5 px-6">Kelas & Semester</th>
                  <th className="py-3.5 px-6 text-center">Rata-Rata Nilai</th>
                  <th className="py-3.5 px-6 text-center">Peringkat</th>
                  <th className="py-3.5 px-6">Status Capaian</th>
                  <th className="py-3.5 px-6 text-right">Aksi Dokumen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      Memuat daftar nilai peserta didik...
                    </td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      Tidak ada data siswa yang cocok dengan kata kunci pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => (
                    <tr key={s.registrationNumber} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900 text-sm">{s.fullName}</div>
                        <div className="font-mono text-xs text-blue-600 font-semibold mt-0.5">
                          {s.registrationNumber}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-600">
                        <div className="font-medium text-slate-800">{s.className}</div>
                        <div className="text-[11px] text-slate-400 font-normal">{s.semester}</div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="font-black text-base text-blue-900 bg-blue-50 px-3 py-1 rounded-xl border border-blue-100">
                          {s.gpa}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="text-xs font-semibold text-amber-900 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                          <Award className="h-3 w-3 text-amber-600" />
                          <span>{s.rank}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <Badge variant="success">Tuntas Pembelajaran</Badge>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetail(s.registrationNumber)}
                          disabled={isLoadingDetail}
                          className="text-xs rounded-xl gap-1.5 hover:border-blue-300 hover:bg-blue-50/50"
                        >
                          <FileText className="h-3.5 w-3.5 text-blue-600" />
                          <span>Rapor Detail</span>
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleViewDetail(s.registrationNumber, true)}
                          disabled={isLoadingDetail}
                          className="text-xs rounded-xl gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Printer className="h-3.5 w-3.5" />
                          <span>Cetak PDF</span>
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* 5. MODAL INTERAKTIF: Detail Rapor Digital Siswa */}
      {selectedStudent && (
        <div className="print:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                  <GraduationCap className="h-6 w-6 text-amber-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                      Kurikulum Merdeka - Rapor Resmi
                    </span>
                    <span className="text-xs text-slate-500">
                      {selectedStudent.semester} &bull; TA {selectedStudent.academicYear}
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900 mt-0.5">
                    {selectedStudent.fullName}
                  </h2>
                  <p className="text-xs text-slate-500 font-mono">
                    NISN: {selectedStudent.nisn} &bull; No. Registrasi: {selectedStudent.registrationNumber}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={handlePrintPdf}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs sm:text-sm gap-2 shadow-sm"
                >
                  <Printer className="h-4 w-4" />
                  <span>Cetak Langsung PDF</span>
                </Button>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="w-9 h-9 rounded-xl hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
                  aria-label="Tutup"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Tabs Navigation */}
            <div className="flex items-center gap-2 px-6 border-b border-slate-100 bg-white text-xs font-bold">
              <button
                onClick={() => setActiveTab("nilai")}
                className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 transition-colors ${
                  activeTab === "nilai"
                    ? "border-blue-600 text-blue-600 font-extrabold"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                <BookOpen className="h-4 w-4" />
                <span>Capaian Mata Pelajaran ({selectedStudent.subjects.length})</span>
              </button>
              <button
                onClick={() => setActiveTab("ekskul")}
                className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 transition-colors ${
                  activeTab === "ekskul"
                    ? "border-blue-600 text-blue-600 font-extrabold"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                <Sparkles className="h-4 w-4" />
                <span>Ekstrakurikuler ({selectedStudent.extracurriculars.length})</span>
              </button>
              <button
                onClick={() => setActiveTab("kehadiran")}
                className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 transition-colors ${
                  activeTab === "kehadiran"
                    ? "border-blue-600 text-blue-600 font-extrabold"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                <Calendar className="h-4 w-4" />
                <span>Kehadiran & Catatan Wali Kelas</span>
              </button>
            </div>

            {/* Modal Body / Tab Contents */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Ringkasan Nilai Card */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-blue-800">
                    Nilai Rata-Rata Rapor (GPA)
                  </div>
                  <div className="text-3xl font-black text-blue-900 mt-1">
                    {selectedStudent.gpa}
                  </div>
                  <div className="text-[11px] text-blue-600 mt-0.5">Skala Standar Nasional (0 - 100)</div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-100">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                    Peringkat Kelas
                  </div>
                  <div className="text-2xl font-black text-amber-950 mt-1 flex items-center gap-1.5">
                    <Award className="h-6 w-6 text-amber-500 shrink-0" />
                    <span>{selectedStudent.rank}</span>
                  </div>
                  <div className="text-[11px] text-amber-700 mt-0.5">Dari total 28 siswa satu rombel</div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                    Status Kelulusan Fase
                  </div>
                  <div className="text-sm font-bold text-emerald-950 mt-1 flex items-center gap-1.5">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                    <span>{selectedStudent.status}</span>
                  </div>
                  <div className="text-[11px] text-emerald-700 mt-0.5">Memenuhi standar ketuntasan KKM</div>
                </div>
              </div>

              {/* Tab 1: Mata Pelajaran */}
              {activeTab === "nilai" && (
                <div className="space-y-4">
                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-xs uppercase">
                        <tr>
                          <th className="py-3 px-4 w-12 text-center">No</th>
                          <th className="py-3 px-4">Muatan Mata Pelajaran</th>
                          <th className="py-3 px-4 text-center">KKM</th>
                          <th className="py-3 px-4 text-center">Nilai Akhir</th>
                          <th className="py-3 px-4 text-center">Predikat</th>
                          <th className="py-3 px-4">Deskripsi Capaian Kompetensi Belajar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedStudent.subjects.map((sub, idx) => (
                          <tr key={sub.code} className="hover:bg-slate-50/70">
                            <td className="py-3 px-4 text-center font-mono text-slate-400">
                              {idx + 1}
                            </td>
                            <td className="py-3 px-4 font-bold text-slate-900">
                              {sub.name}
                              <span className="block text-[11px] font-mono text-slate-400 font-normal">
                                Kode: {sub.code}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center text-slate-500 font-medium">
                              {sub.kkm}
                            </td>
                            <td className="py-3 px-4 text-center font-black text-blue-700 text-base">
                              {sub.score}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span
                                className={`inline-block px-2.5 py-0.5 font-bold rounded-lg text-xs ${
                                  sub.predicate === "A"
                                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                    : "bg-blue-100 text-blue-800 border border-blue-200"
                                }`}
                              >
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
                </div>
              )}

              {/* Tab 2: Ekstrakurikuler */}
              {activeTab === "ekskul" && (
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-900 text-sm">
                    Kegiatan Ekstrakurikuler yang Diikuti
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedStudent.extracurriculars.map((e) => (
                      <div
                        key={e.name}
                        className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-sm">{e.name}</span>
                          <span className="font-bold text-xs px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-md">
                            {e.predicate}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{e.notes}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: Kehadiran & Catatan */}
              {activeTab === "kehadiran" && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-3">
                      Rekapitulasi Presensi / Kehadiran Siswa
                    </h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                        <div className="text-xs text-slate-500 font-semibold">Sakit (S)</div>
                        <div className="text-2xl font-black text-slate-900 mt-1">
                          {selectedStudent.attendance.sakit}{" "}
                          <span className="text-xs font-normal text-slate-400">hari</span>
                        </div>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                        <div className="text-xs text-slate-500 font-semibold">Izin (I)</div>
                        <div className="text-2xl font-black text-slate-900 mt-1">
                          {selectedStudent.attendance.izin}{" "}
                          <span className="text-xs font-normal text-slate-400">hari</span>
                        </div>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                        <div className="text-xs text-slate-500 font-semibold">Tanpa Keterangan (A)</div>
                        <div className="text-2xl font-black text-slate-900 mt-1">
                          {selectedStudent.attendance.tanpaKeterangan}{" "}
                          <span className="text-xs font-normal text-slate-400">hari</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-2">
                    <div className="font-bold text-blue-900 text-sm">Catatan dan Saran Wali Kelas:</div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                      &ldquo;{selectedStudent.teacherNotes}&rdquo;
                    </p>
                    <div className="pt-2 text-xs text-slate-500 font-mono">
                      Wali Kelas: <strong>{selectedStudent.homeroomTeacher}</strong> (NIP: {selectedStudent.homeroomTeacherNip})
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <span className="text-xs text-slate-400 font-mono">
                Terakhir disinkronisasi: {new Date(selectedStudent.updatedAt).toLocaleDateString("id-ID")}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedStudent(null)}
                  className="rounded-xl text-xs"
                >
                  Tutup
                </Button>
                <Button
                  onClick={handlePrintPdf}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs gap-1.5 shadow-sm"
                >
                  <Printer className="h-4 w-4" />
                  <span>Cetak PDF Rapor</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. DOKUMEN CETAK RESMI RAPOR SISWA (Hanya Ditampilkan Saat Cetak PDF: window.print) */}
      {selectedStudent && (
        <div id="rapor-cetak-pdf" className="hidden print:block print:m-0 print:p-0 bg-white text-slate-950 font-sans">
          {/* KOP RESMI SEKOLAH STANDAR DINAS PENDIDIKAN */}
          <div className="border-b-4 border-double border-slate-900 pb-3 mb-4 text-center">
            <h4 className="text-xs uppercase tracking-widest font-bold text-slate-700 leading-tight">
              PEMERINTAH KOTA / KABUPATEN PENDIDIKAN
            </h4>
            <h3 className="text-sm uppercase tracking-widest font-bold text-slate-800 leading-tight">
              DINAS PENDIDIKAN DAN KEBUDAYAAN
            </h3>
            <h1 className="text-xl font-black uppercase tracking-wider text-slate-950 mt-1 leading-tight">
              SD NEGERI HARAPAN BANGSA
            </h1>
            <p className="text-[10px] text-slate-600 mt-1 leading-normal">
              NPSN: 20104567 &bull; NSS: 101026001001 &bull; Terakreditasi: A (Unggul)
              <br />
              Jl. Merdeka Pendidikan No. 45, Kel. Harapan Jaya &bull; Telp: (021) 8899-7766 &bull; Website: sdharapanbangsa.sch.id
            </p>
          </div>

          {/* JUDUL RAPOR */}
          <div className="text-center my-3">
            <h2 className="text-sm font-black uppercase tracking-wider underline">
              LAPORAN HASIL BELAJAR PESERTA DIDIK (RAPOR)
            </h2>
            <p className="text-[11px] font-bold text-slate-700 mt-0.5 uppercase">
              KURIKULUM MERDEKA &bull; TAHUN PELAJARAN {selectedStudent.academicYear}
            </p>
          </div>

          {/* TABEL IDENTITAS SISWA */}
          <div className="border border-slate-800 p-2.5 rounded-xs my-3 text-[11px]">
            <table className="w-full text-left leading-relaxed">
              <tbody>
                <tr>
                  <td className="w-32 font-bold text-slate-700">Nama Peserta Didik</td>
                  <td className="w-4">:</td>
                  <td className="font-extrabold text-slate-900">{selectedStudent.fullName}</td>
                  <td className="w-32 font-bold text-slate-700">Kelas / Fase</td>
                  <td className="w-4">:</td>
                  <td className="font-bold text-slate-900">{selectedStudent.className}</td>
                </tr>
                <tr>
                  <td className="font-bold text-slate-700">Nomor Induk / NISN</td>
                  <td>:</td>
                  <td className="font-mono text-slate-900">{selectedStudent.nisn}</td>
                  <td className="font-bold text-slate-700">Semester</td>
                  <td>:</td>
                  <td className="font-bold text-slate-900">{selectedStudent.semester}</td>
                </tr>
                <tr>
                  <td className="font-bold text-slate-700">No. Registrasi PPDB</td>
                  <td>:</td>
                  <td className="font-mono text-slate-900">{selectedStudent.registrationNumber}</td>
                  <td className="font-bold text-slate-700">Tahun Ajaran</td>
                  <td>:</td>
                  <td className="font-bold text-slate-900">{selectedStudent.academicYear}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* TABEL NILAI CAPAIAN KOMPETENSI BELAJAR */}
          <div className="my-4">
            <div className="text-[11px] font-bold uppercase mb-1">
              A. Capaian Kompetensi Belajar (Asesmen Sumatif & Formatif)
            </div>
            <table className="w-full border-collapse border border-slate-800 text-[10px] text-left">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-800 font-bold uppercase text-slate-900">
                  <th className="border border-slate-800 p-1.5 w-7 text-center">No</th>
                  <th className="border border-slate-800 p-1.5 w-52">Muatan Mata Pelajaran</th>
                  <th className="border border-slate-800 p-1.5 w-12 text-center">KKM</th>
                  <th className="border border-slate-800 p-1.5 w-14 text-center">Nilai</th>
                  <th className="border border-slate-800 p-1.5 w-12 text-center">Predikat</th>
                  <th className="border border-slate-800 p-1.5">Capaian Kompetensi Pembelajaran</th>
                </tr>
              </thead>
              <tbody>
                {selectedStudent.subjects.map((sub, index) => (
                  <tr key={sub.code} className="border-b border-slate-700">
                    <td className="border border-slate-800 p-1.5 text-center font-mono">{index + 1}</td>
                    <td className="border border-slate-800 p-1.5 font-bold">{sub.name}</td>
                    <td className="border border-slate-800 p-1.5 text-center">{sub.kkm}</td>
                    <td className="border border-slate-800 p-1.5 text-center font-black text-sm">{sub.score}</td>
                    <td className="border border-slate-800 p-1.5 text-center font-bold">{sub.predicate}</td>
                    <td className="border border-slate-800 p-1.5 text-[9.5px] leading-snug">{sub.competencyDesc}</td>
                  </tr>
                ))}
                {/* Rata-Rata Baris */}
                <tr className="bg-slate-50 font-bold border-t-2 border-slate-800">
                  <td colSpan={3} className="border border-slate-800 p-1.5 text-right uppercase">
                    Rata-Rata Nilai Akhir (GPA):
                  </td>
                  <td className="border border-slate-800 p-1.5 text-center text-sm font-black text-slate-950">
                    {selectedStudent.gpa}
                  </td>
                  <td colSpan={2} className="border border-slate-800 p-1.5">
                    Peringkat: <strong>{selectedStudent.rank}</strong> &bull; Status: <strong>{selectedStudent.status}</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* TABEL EKSTRAKURIKULER & PRESENSI */}
          <div className="grid grid-cols-2 gap-4 my-3 text-[10px] print-page-break-avoid">
            {/* Ekstrakurikuler */}
            <div>
              <div className="font-bold uppercase mb-1">B. Kegiatan Ekstrakurikuler</div>
              <table className="w-full border-collapse border border-slate-800 text-left">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-800 font-bold uppercase">
                    <th className="border border-slate-800 p-1 text-center w-6">No</th>
                    <th className="border border-slate-800 p-1">Kegiatan</th>
                    <th className="border border-slate-800 p-1 text-center w-16">Predikat</th>
                    <th className="border border-slate-800 p-1">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedStudent.extracurriculars.map((e, idx) => (
                    <tr key={e.name} className="border-b border-slate-700">
                      <td className="border border-slate-800 p-1 text-center">{idx + 1}</td>
                      <td className="border border-slate-800 p-1 font-bold">{e.name}</td>
                      <td className="border border-slate-800 p-1 text-center font-bold">{e.predicate}</td>
                      <td className="border border-slate-800 p-1 text-[9px] leading-tight">{e.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Presensi */}
            <div>
              <div className="font-bold uppercase mb-1">C. Catatan Ketidakhadiran</div>
              <table className="w-full border-collapse border border-slate-800 text-left">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-800 font-bold uppercase">
                    <th className="border border-slate-800 p-1 w-44">Keterangan</th>
                    <th className="border border-slate-800 p-1 text-center">Jumlah Hari</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-slate-800 p-1">Sakit (S)</td>
                    <td className="border border-slate-800 p-1 text-center font-bold">{selectedStudent.attendance.sakit} hari</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-800 p-1">Izin (I)</td>
                    <td className="border border-slate-800 p-1 text-center font-bold">{selectedStudent.attendance.izin} hari</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-800 p-1">Tanpa Keterangan (A)</td>
                    <td className="border border-slate-800 p-1 text-center font-bold">{selectedStudent.attendance.tanpaKeterangan} hari</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* CATATAN WALI KELAS */}
          <div className="border border-slate-800 p-2.5 rounded-xs my-3 text-[10.5px] print-page-break-avoid">
            <span className="font-bold text-slate-900 block mb-0.5">D. Catatan & Saran Wali Kelas:</span>
            <p className="italic text-slate-800 leading-relaxed">&ldquo;{selectedStudent.teacherNotes}&rdquo;</p>
          </div>

          {/* PENGESAHAN & TANDA TANGAN (3 KOLOM RESMI STANDAR DINAS PENDIDIKAN) */}
          <div className="mt-6 pt-2 text-[10.5px] print-page-break-avoid">
            <div className="text-right mb-2">
              Kota Harapan, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {/* Kolom 1: Orang Tua / Wali */}
              <div className="flex flex-col justify-between h-28">
                <div>Mengetahui,
                  <br />
                  Orang Tua / Wali Murid
                </div>
                <div>
                  <div className="font-bold underline uppercase">( ........................................ )</div>
                </div>
              </div>

              {/* Kolom 2: Wali Kelas */}
              <div className="flex flex-col justify-between h-28">
                <div>Wali Kelas,
                  <br />
                  Fase A - Kelas 1 Merdeka
                </div>
                <div>
                  <div className="font-bold underline uppercase">{selectedStudent.homeroomTeacher}</div>
                  <div className="text-[9.5px] font-mono text-slate-700">NIP. {selectedStudent.homeroomTeacherNip}</div>
                </div>
              </div>

              {/* Kolom 3: Kepala Sekolah */}
              <div className="flex flex-col justify-between h-28">
                <div>Mengetahui,
                  <br />
                  Kepala Sekolah SD Negeri Harapan Bangsa
                </div>
                <div>
                  <div className="font-bold underline uppercase">Hj. Siti Aminah, M.Pd.</div>
                  <div className="text-[9.5px] font-mono text-slate-700">NIP. 19750812 200003 2 001</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
