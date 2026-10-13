import Link from "next/link";
import prisma from "@/lib/prisma";
import {
  FileText,
  Calendar,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  Users,
  Search,
  ShieldCheck,
  MapPin,
  Award,
  BookOpen,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatDateIndo } from "@/lib/utils";

export const metadata = {
  title: "Informasi PPDB 2025/2026",
  description:
    "Persyaratan, Jadwal, Alur Pendaftaran, dan Kuota Penerimaan Peserta Didik Baru SD Negeri Harapan Bangsa.",
};


export default async function PPDBInfoPage() {
  let setting: any = null;

  try {
    setting = await prisma.pPDBSetting.findUnique({
      where: { id: "default-ppdb" },
    });
    if (!setting) {
      setting = await prisma.pPDBSetting.findFirst();
    }
  } catch {
    // Graceful fallback
  }

  const requirementsList: string[] = (setting?.requirements || "")
    .split("\n")
    .map((r: string) => r.trim())
    .filter(Boolean);

  const flowList: string[] = (setting?.flowDescription || "")
    .split("\n")
    .map((f: string) => f.trim())
    .filter(Boolean);

  const faqs = [
    {
      q: "Berapa batas usia minimal calon peserta didik baru kelas 1 SD?",
      a: "Sesuai regulasi Kemendikbudristek, prioritas utama diberikan kepada anak yang telah berusia 7 tahun pada tanggal 1 Juli tahun berjalan. Usia paling rendah adalah 6 tahun pada tanggal 1 Juli tahun berjalan.",
    },
    {
      q: "Apakah anak yang belum pernah bersekolah TK / PAUD dapat mendaftar?",
      a: "Bisa. Ijazah atau surat keterangan dari TK/PAUD bersifat opsional dan bukan merupakan syarat mutlak penerimaan di Sekolah Dasar.",
    },
    {
      q: "Dokumen apa saja yang harus disiapkan saat pendaftaran daring?",
      a: "Orang tua cukup menyiapkan NIK calon siswa, Akta Kelahiran, Kartu Keluarga (KK), dan nomor kontak aktif WhatsApp yang dapat dihubungi panitia verifikator.",
    },
    {
      q: "Bagaimana cara mengetahui pengumuman hasil seleksi?",
      a: "Hasil verifikasi dapat dicek langsung secara berkala pada menu 'Cek Status Pendaftaran' di website ini menggunakan nomor registrasi unik yang didapatkan saat mendaftar.",
    },
  ];

  return (
    <div className="space-y-16 pb-24">
      {/* Hero Banner PPDB */}
      <section className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center space-y-5">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-amber-300 bg-amber-400/20 px-4 py-1.5 rounded-full border border-amber-400/30">
            Tahun Ajaran {setting?.academicYear || "2025/2026"}
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
            Penerimaan Peserta Didik Baru (PPDB)
          </h1>
          <p className="text-sm sm:text-base text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Bergabunglah bersama keluarga besar SD Negeri Harapan Bangsa. Kami menyambut putra-putri Anda untuk bertumbuh dalam lingkungan belajar ramah anak yang menyenangkan.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/ppdb/daftar"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-sm px-8 py-4 rounded-xl shadow-lg shadow-amber-400/20 transition-all hover:scale-105 active:scale-95"
            >
              <span>Daftar Online Sekarang</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/ppdb/status"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-7 py-4 rounded-xl border border-white/30 backdrop-blur-sm"
            >
              <Search className="h-4 w-4 text-amber-400" />
              <span>Cek Status Hasil Seleksi</span>
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* 1. Jalur & Kuota Pendaftaran */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              Kapasitas & Alokasi
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900">Jalur Penerimaan & Kuota</h2>
            <p className="text-sm text-slate-500">
              Total Kuota Siswa Baru: <strong>{setting?.quota || 120} Siswa</strong> (4 Rombongan Belajar)
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 border-t-4 border-t-blue-600 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <MapPin className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Jalur Zonasi (70%)</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Diperuntukkan bagi calon siswa yang berdomisili di dalam wilayah zonasi kelurahan terdekat sekolah.
              </p>
            </Card>

            <Card className="p-6 border-t-4 border-t-emerald-600 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Jalur Afirmasi (15%)</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Bagi calon siswa dari keluarga ekonomi kurang mampu atau penyandang disabilitas ringan/inklusif.
              </p>
            </Card>

            <Card className="p-6 border-t-4 border-t-amber-500 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Award className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Jalur Prestasi (10%)</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Apresiasi bagi calon siswa yang memiliki piagam kejuaraan seni, olahraga, atau keagamaan resmi.
              </p>
            </Card>

            <Card className="p-6 border-t-4 border-t-purple-600 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Perpindahan Tugas (5%)</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Diperuntukkan bagi anak dari orang tua yang berpindah tugas kedinasan atau anak guru sekolah.
              </p>
            </Card>
          </div>
        </section>

        {/* 2. Jadwal & Alur Pendaftaran */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Jadwal */}
          <Card className="p-6 sm:p-8 space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                Agenda
              </span>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-2">
                Jadwal Pelaksanaan PPDB
              </h3>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-slate-900">Pendaftaran Daring (Online)</div>
                  <div className="text-[11px] text-slate-500">Pengisian formulir & berkas</div>
                </div>
                <div className="text-xs font-bold text-blue-700 whitespace-nowrap">
                  1 Mei - 30 Juni 2025
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-slate-900">Verifikasi Berkas Panitia</div>
                  <div className="text-[11px] text-slate-500">Validasi data domisili & identitas</div>
                </div>
                <div className="text-xs font-bold text-blue-700 whitespace-nowrap">
                  1 - 4 Juli 2025
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-slate-900">Pengumuman Kelulusan Seleksi</div>
                  <div className="text-[11px] text-slate-500">Diumumkan di website resmi</div>
                </div>
                <div className="text-xs font-bold text-amber-800 whitespace-nowrap">
                  5 Juli 2025
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-slate-900">Daftar Ulang Siswa Baru</div>
                  <div className="text-[11px] text-slate-500">Konfirmasi berkas fisik di sekolah</div>
                </div>
                <div className="text-xs font-bold text-blue-700 whitespace-nowrap">
                  7 - 10 Juli 2025
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-slate-900">Masa Pengenalan Lingkungan (MPLS)</div>
                  <div className="text-[11px] text-slate-500">Hari pertama masuk sekolah ramah anak</div>
                </div>
                <div className="text-xs font-bold text-emerald-700 whitespace-nowrap">
                  14 Juli 2025
                </div>
              </div>
            </div>
          </Card>

          {/* Persyaratan */}
          <Card className="p-6 sm:p-8 space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                Kelengkapan
              </span>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-2">
                Persyaratan Calon Siswa
              </h3>
            </div>

            <ul className="space-y-3 text-xs sm:text-sm text-slate-700">
              {requirementsList.map((req: string, idx: number) => (
                <li key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{req}</span>
                </li>
              ))}
            </ul>

            <div className="p-4 rounded-2xl bg-blue-50 text-blue-900 text-xs space-y-1 border border-blue-100">
              <div className="font-bold">Catatan Penting:</div>
              <p className="text-blue-800 leading-relaxed">
                Seluruh proses pendaftaran tidak dipungut biaya apapun (Gratis). Mohon pastikan nomor telepon / WhatsApp yang diinput aktif untuk menerima info verifikasi.
              </p>
            </div>
          </Card>
        </section>

        {/* 3. Alur Pendaftaran */}
        <section className="bg-slate-50 rounded-3xl p-8 sm:p-12 border border-slate-100 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-100/60 px-3 py-1 rounded-full">
              Langkah Demi Langkah
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900">Alur Pendaftaran Online</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 text-center">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-black text-sm flex items-center justify-center mx-auto shadow-md">
                1
              </div>
              <h4 className="font-bold text-sm text-slate-900">Isi Formulir</h4>
              <p className="text-xs text-slate-500">Orang tua mengisi data diri calon siswa dan wali secara lengkap.</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-black text-sm flex items-center justify-center mx-auto shadow-md">
                2
              </div>
              <h4 className="font-bold text-sm text-slate-900">Nomor Registrasi</h4>
              <p className="text-xs text-slate-500">Sistem otomatis menerbitkan kode pendaftaran resmi (PPDB-2025-XXXXX).</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-black text-sm flex items-center justify-center mx-auto shadow-md">
                3
              </div>
              <h4 className="font-bold text-sm text-slate-900">Verifikasi Panitia</h4>
              <p className="text-xs text-slate-500">Panitia sekolah memverifikasi kesesuaian dokumen dan jalur seleksi.</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-black text-sm flex items-center justify-center mx-auto shadow-md">
                4
              </div>
              <h4 className="font-bold text-sm text-slate-900">Cek Status Hasil</h4>
              <p className="text-xs text-slate-500">Pantau pengumuman kelulusan di website dengan nomor registrasi.</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-black text-sm flex items-center justify-center mx-auto shadow-md">
                5
              </div>
              <h4 className="font-bold text-sm text-slate-900">Daftar Ulang</h4>
              <p className="text-xs text-slate-500">Calon siswa yang diterima melakukan konfirmasi daftar ulang.</p>
            </div>
          </div>
        </section>

        {/* 4. FAQ PPDB */}
        <section id="faq" className="space-y-8 scroll-mt-24">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
              Tanya Jawab
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900">Pertanyaan yang Sering Diajukan (FAQ)</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {faqs.map((f, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
                <h4 className="font-bold text-slate-900 text-sm flex items-start gap-2">
                  <HelpCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>{f.q}</span>
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed pl-6">{f.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
