import prisma from "@/lib/prisma";
import {
  BookOpen,
  CalendarDays,
  Sparkles,
  Trophy,
  Activity,
  CheckCircle2,
  Award,
  Clock,
  Download,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateIndo } from "@/lib/utils";

export const metadata = {
  title: "Akademik & Kurikulum",
  description:
    "Kurikulum Merdeka, Program Pembelajaran, Kalender Akademik, dan Ragam Ekstrakurikuler SD Negeri Harapan Bangsa.",
};


export default async function AkademikPage() {
  let calendars: any[] = [];
  let extracurriculars: any[] = [];
  let achievements: any[] = [];

  try {
    [calendars, extracurriculars, achievements] = await Promise.all([
      prisma.academicCalendar.findMany({
        orderBy: { eventDate: "asc" },
      }),
      prisma.extracurricular.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.achievement.findMany({
        orderBy: { year: "desc" },
      }),
    ]);
  } catch (err) {
    // Graceful fallback
  }

  const ganjilEvents = calendars.filter((c) => c.semester === "Ganjil");
  const genapEvents = calendars.filter((c) => c.semester === "Genap");

  return (
    <div className="space-y-16 pb-24">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-white/10 px-3.5 py-1 rounded-full border border-white/15">
            Program Belajar & Prestasi
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
            Akademik, Kurikulum & Prestasi
          </h1>
          <p className="text-sm sm:text-base text-blue-100 max-w-2xl mx-auto">
            Pendekatan Kurikulum Merdeka yang menyenangkan, kalender pendidikan terstruktur, serta wadah pengembangan bakat siswa.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* 1. Kurikulum Merdeka & Pendekatan */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-5">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              Fondasi Belajar
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Penerapan Kurikulum Merdeka
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              SD Negeri Harapan Bangsa menerapkan Kurikulum Merdeka secara menyeluruh dari Fase A (Kelas 1-2), Fase B (Kelas 3-4), hingga Fase C (Kelas 5-6). Pembelajaran difokuskan pada penguatan fondasi literasi, numerasi, dan pembentukan karakter anak tanpa tekanan berlebih.
            </p>

            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Pembelajaran Berdiferensiasi</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Guru mendampingi siswa sesuai kecepatan dan gaya belajar masing-masing anak.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Proyek Profil Pelajar Pancasila (P5)</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Eksplorasi kontekstual seperti kearifan lokal, gaya hidup sehat berkelanjutan, dan kewirausahaan cilik.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Pembiasaan Positif Pagi Hari</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Doa bersama, membaca buku cerita 15 menit, dan senam kesegaran jasmani.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="aspect-4/3 rounded-3xl overflow-hidden shadow-xl border border-slate-200">
              <img
                src="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80"
                alt="Kurikulum Belajar"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* 2. Kalender Akademik Dinamis */}
        <section id="kalender" className="space-y-8 scroll-mt-24">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              Agenda Penting
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900">Kalender Akademik Sekolah</h2>
            <p className="text-sm text-slate-500">
              Jadwal kegiatan pembelajaran, asesmen sumatif, dan masa libur resmi sekolah.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Semester Ganjil */}
            <Card className="p-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-blue-600" />
                  <span>Semester Ganjil</span>
                </h3>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                  Tahun Ajaran 2025/2026
                </span>
              </div>

              {ganjilEvents.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">Belum ada agenda terdaftar.</div>
              ) : (
                <div className="space-y-3">
                  {ganjilEvents.map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        item.isHoliday ? "bg-rose-50/40 border-rose-100" : "bg-slate-50 border-slate-100"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          {formatDateIndo(item.eventDate)}
                        </span>
                        {item.isHoliday ? (
                          <Badge variant="danger">Libur</Badge>
                        ) : (
                          <Badge variant="info">Kegiatan</Badge>
                        )}
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 mt-1">{item.eventName}</h4>
                      {item.description && (
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Semester Genap */}
            <Card className="p-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-amber-500" />
                  <span>Semester Genap</span>
                </h3>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">
                  Tahun Ajaran 2025/2026
                </span>
              </div>

              {genapEvents.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Agenda semester genap akan segera diperbarui.
                </div>
              ) : (
                <div className="space-y-3">
                  {genapEvents.map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        item.isHoliday ? "bg-rose-50/40 border-rose-100" : "bg-slate-50 border-slate-100"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          {formatDateIndo(item.eventDate)}
                        </span>
                        {item.isHoliday ? (
                          <Badge variant="danger">Libur</Badge>
                        ) : (
                          <Badge variant="info">Kegiatan</Badge>
                        )}
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 mt-1">{item.eventName}</h4>
                      {item.description && (
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </section>

        {/* 3. Ekstrakurikuler */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
              Bakat & Minat
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900">Ragam Ekstrakurikuler</h2>
            <p className="text-sm text-slate-500">
              Wadah pengembangan potensi non-akademik, kepemimpinan, dan kesehatan fisik anak.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {extracurriculars.map((e) => (
              <Card key={e.id} className="p-5 flex flex-col justify-between hover:shadow-lg transition-shadow">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                    {e.category || "Ekstrakurikuler"}
                  </span>
                  <h4 className="font-bold text-slate-900 text-base mt-3">{e.name}</h4>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{e.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                  <div>Pembina: <strong className="text-slate-800">{e.coach || "-"}</strong></div>
                  <div>Jadwal: <strong className="text-slate-800">{e.schedule || "-"}</strong></div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* 4. Prestasi Siswa */}
        <section className="bg-slate-50 rounded-3xl p-8 sm:p-12 border border-slate-100 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                Kebanggaan Sekolah
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                Daftar Prestasi Siswa
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {achievements.map((a) => (
              <div
                key={a.id}
                className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
                  <Trophy className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-800">
                    {a.level} • {a.year}
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm mt-1">{a.title}</h4>
                  <p className="text-xs text-blue-700 font-semibold mt-0.5">{a.studentName}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{a.competition}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
