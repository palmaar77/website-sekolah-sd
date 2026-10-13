import prisma from "@/lib/prisma";
import { Bell, AlertTriangle, Calendar, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateIndo } from "@/lib/utils";

export const metadata = {
  title: "Pengumuman Resmi",
  description:
    "Pengumuman dan maklumat resmi SD Negeri Harapan Bangsa untuk orang tua dan masyarakat.",
};


export default async function PengumumanPage() {
  let announcements: any[] = [];
  try {
    announcements = await prisma.announcement.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    // Graceful fallback
  }

  return (
    <div className="space-y-12 pb-24">
      <section className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-white/10 px-3.5 py-1 rounded-full border border-white/15">
            Maklumat & Informasi
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
            Pengumuman Resmi Sekolah
          </h1>
          <p className="text-sm sm:text-base text-blue-100 max-w-2xl mx-auto">
            Daftar pengumuman terkini seputar kalender kegiatan belajar, jadwal libur, dan informasi kesiswaan.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {announcements.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border border-slate-100 text-slate-400 text-sm">
            Tidak ada pengumuman aktif saat ini.
          </div>
        ) : (
          announcements.map((a) => (
            <Card
              key={a.id}
              className={`p-6 sm:p-8 transition-all ${
                a.isImportant ? "border-l-4 border-l-rose-500 bg-rose-50/20" : "bg-white"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {a.isImportant ? (
                    <Badge variant="danger" className="gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      <span>Sangat Penting</span>
                    </Badge>
                  ) : (
                    <Badge variant="info">Informasi</Badge>
                  )}
                  <span className="text-xs text-slate-400 font-medium">
                    Diterbitkan: {formatDateIndo(a.createdAt, true)}
                  </span>
                </div>

                <h2 className="text-lg sm:text-xl font-bold text-slate-900">{a.title}</h2>

                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  {a.content}
                </p>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
