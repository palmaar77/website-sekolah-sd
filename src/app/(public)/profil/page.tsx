import prisma from "@/lib/prisma";
import {
  GraduationCap,
  Target,
  Compass,
  History,
  Building,
  Users,
  CheckCircle2,
  Award,
  Layers,
} from "lucide-react";
import { Card } from "@/components/ui/card";

export const metadata = {
  title: "Profil Sekolah",
  description:
    "Sejarah, Visi, Misi, Struktur Organisasi, Pendidik, dan Fasilitas SD Negeri Harapan Bangsa.",
};


export default async function ProfilPage() {
  let profile: any = null;
  let teachers: any[] = [];
  let facilities: any[] = [];

  try {
    profile = await prisma.schoolProfile.findUnique({
      where: { id: "default-profile" },
    });
    if (!profile) {
      profile = await prisma.schoolProfile.findFirst();
    }

    [teachers, facilities] = await Promise.all([
      prisma.teacher.findMany({
        where: { isActive: true },
        orderBy: { order: "asc" },
      }),
      prisma.facility.findMany({
        orderBy: { order: "asc" },
      }),
    ]);
  } catch (err) {
    // Graceful fallback
  }

  const missions: string[] = (profile?.mission || "")
    .split("\n")
    .map((m: string) => m.trim())
    .filter(Boolean);

  const goals: string[] = (profile?.goals || "")
    .split("\n")
    .map((g: string) => g.trim())
    .filter(Boolean);

  return (
    <div className="space-y-16 pb-24">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-white/10 px-3.5 py-1 rounded-full border border-white/15">
            Tentang Lembaga
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
            Profil & Identitas Sekolah
          </h1>
          <p className="text-sm sm:text-base text-blue-100 max-w-2xl mx-auto">
            Mengenal lebih dekat sejarah, visi misi, tenaga pengajar, dan fasilitas penunjang belajar di {profile?.schoolName}.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* 1. Identitas Sekolah & Sambutan */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 text-center">
            <div className="relative inline-block">
              <img
                src={
                  profile?.principalPhoto ||
                  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80"
                }
                alt={profile?.principalName || "Kepala Sekolah"}
                className="w-72 h-96 object-cover rounded-3xl shadow-xl border-4 border-white bg-slate-100 mx-auto"
              />
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-blue-700 text-white py-2 px-5 rounded-xl shadow-lg text-xs font-bold whitespace-nowrap">
                Kepala Sekolah
              </div>
            </div>
            <div className="mt-6 text-center">
              <h3 className="text-base font-extrabold text-slate-900">
                {profile?.principalName || "Dra. Hj. Siti Rahmawati, M.Pd."}
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                NIP: {profile?.principalNip || "19750512 200003 2 001"}
              </p>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider">
              Identitas Resmi Sekolah
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {profile?.schoolName}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block">NPSN:</span>
                <span className="font-bold text-slate-900 text-sm">{profile?.npsn}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block">Status Akreditasi:</span>
                <span className="font-bold text-slate-900 text-sm">{profile?.accreditation}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 sm:col-span-2">
                <span className="text-slate-400 block">Alamat Lembaga:</span>
                <span className="font-semibold text-slate-900">
                  {profile?.address}, {profile?.city}, {profile?.province} {profile?.postalCode}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block">Telepon Kantor:</span>
                <span className="font-semibold text-slate-900">{profile?.phone}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block">Email Resmi:</span>
                <span className="font-semibold text-slate-900">{profile?.email}</span>
              </div>
            </div>

            <div className="text-sm text-slate-600 leading-relaxed bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
              <h4 className="font-bold text-blue-900 text-xs uppercase tracking-wider mb-2">
                Pesan Sambutan Kepala Sekolah
              </h4>
              <p>&ldquo;{profile?.principalMessage}&rdquo;</p>
            </div>
          </div>
        </section>

        {/* 2. Sejarah Sekolah */}
        <section className="bg-slate-50 rounded-3xl p-8 sm:p-12 border border-slate-100 space-y-4">
          <div className="inline-flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
            <History className="h-4 w-4" />
            <span>Sejarah & Perjalanan Lembaga</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Tumbuh Bersama Masyarakat</h2>
          <div className="text-sm sm:text-base text-slate-600 leading-relaxed space-y-3">
            <p className="whitespace-pre-line">{profile?.history}</p>
          </div>
        </section>

        {/* 3. Visi, Misi & Tujuan */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              Arah & Komitmen
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900">Visi, Misi & Tujuan Sekolah</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Visi */}
            <Card className="p-6 border-t-4 border-t-blue-600 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                  <Compass className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-3">Visi Sekolah</h3>
                <p className="text-sm text-slate-600 leading-relaxed italic bg-slate-50 p-4 rounded-xl border border-slate-100">
                  &ldquo;{profile?.vision}&rdquo;
                </p>
              </div>
            </Card>

            {/* Misi */}
            <Card className="p-6 border-t-4 border-t-amber-500 md:col-span-2">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                <Target className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-3">Misi Sekolah</h3>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                {missions.map((m: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{m}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Tujuan */}
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-3xl p-8 sm:p-10 space-y-4">
            <h3 className="font-bold text-lg sm:text-xl text-amber-300">Tujuan Strategis Pendidikan</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs sm:text-sm text-blue-100">
              {goals.map((g: string, idx: number) => (
                <div key={idx} className="bg-white/10 backdrop-blur-xs p-4 rounded-2xl border border-white/10">
                  <div className="font-bold text-amber-400 text-base mb-1">0{idx + 1}</div>
                  <p className="leading-relaxed">{g}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Struktur Organisasi */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              Tata Kelola
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900">Struktur Organisasi Sekolah</h2>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 text-center">
            {/* Visual Hierarchy */}
            <div className="inline-block p-4 bg-blue-600 text-white font-bold text-sm rounded-2xl shadow-md">
              <div>Kepala Sekolah</div>
              <div className="text-xs font-normal text-blue-100 mt-0.5">{profile?.principalName}</div>
            </div>

            <div className="w-0.5 h-8 bg-slate-300 mx-auto my-1" />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs text-xs font-semibold text-slate-800">
                Komite Sekolah & Orang Tua
              </div>
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs text-xs font-semibold text-slate-800">
                Tata Usaha & IT Sekolah
              </div>
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs text-xs font-semibold text-slate-800">
                Koordinator Kurikulum & Kesiswaan
              </div>
            </div>

            <div className="w-0.5 h-8 bg-slate-300 mx-auto my-1" />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-700">
                Dewan Guru Fase A (Kelas 1 & 2)
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-700">
                Dewan Guru Fase B (Kelas 3 & 4)
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-700">
                Dewan Guru Fase C (Kelas 5 & 6)
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-700">
                Guru Mapel Agama & PJOK
              </div>
            </div>
          </div>
        </section>

        {/* 5. Data Guru & Tenaga Kependidikan */}
        <section id="guru" className="space-y-8 scroll-mt-24">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              Pendidik Berdedikasi
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900">Guru & Tenaga Kependidikan</h2>
            <p className="text-sm text-slate-500">
              Profil para guru dan staf profesional yang membimbing putra-putri Anda setiap hari.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {teachers.map((t) => (
              <Card key={t.id} className="p-5 flex items-start gap-4 hover:shadow-lg transition-shadow">
                <img
                  src={
                    t.photo ||
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
                  }
                  alt={t.name}
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shrink-0 bg-slate-100"
                />
                <div className="min-w-0">
                  <h4 className="font-bold text-slate-900 text-sm truncate">{t.name}</h4>
                  <p className="text-xs font-bold text-blue-600 mt-0.5">{t.role}</p>
                  <p className="text-[11px] text-slate-500 mt-1">{t.subject || "-"}</p>
                  {t.education && (
                    <p className="text-[10px] text-slate-400 mt-0.5">{t.education}</p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* 6. Fasilitas Sekolah */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
              Sarana Prasarana
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900">Fasilitas Penunjang Belajar</h2>
            <p className="text-sm text-slate-500">
              Sarana modern, aman, dan higienis yang mendukung potensi akademik maupun motorik anak.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {facilities.map((fac) => (
              <div
                key={fac.id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all group"
              >
                <div className="aspect-16/10 overflow-hidden bg-slate-100">
                  <img
                    src={
                      fac.imageUrl ||
                      "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80"
                    }
                    alt={fac.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h4 className="font-bold text-slate-900 text-base mb-2">{fac.name}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{fac.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
