import Link from "next/link";
import prisma from "@/lib/prisma";
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  Users,
  Award,
  Heart,
  Shield,
  ArrowRight,
  Calendar,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  ChevronRight,
  Bell,
  Star,
  Quote,
  Smartphone,
  Image as ImageIcon,
  MessageCircle,
} from "lucide-react";
import { formatDateIndo } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";


export default async function HomePage() {
  let profile: any = null;
  let latestNews: any[] = [];
  let announcements: any[] = [];
  let featuredGalleries: any[] = [];
  let ekskuls: any[] = [];

  try {
    profile = await prisma.schoolProfile.findUnique({
      where: { id: "default-profile" },
    });
    if (!profile) {
      profile = await prisma.schoolProfile.findFirst();
    }

    [latestNews, announcements, featuredGalleries, ekskuls] = await Promise.all([
      prisma.news.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        take: 3,
      }),
      prisma.announcement.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        take: 2,
      }),
      prisma.gallery.findMany({
        where: { isFeatured: true },
        take: 6,
        include: { category: true },
      }),
      prisma.extracurricular.findMany({
        where: { isActive: true },
        take: 4,
      }),
    ]);
  } catch (err) {
    // Graceful fallback if database connection is pending
  }

  const schoolName = profile?.schoolName || "SD Negeri Harapan Bangsa";
  const studentCount = profile?.studentCount || 480;
  const teacherCount = profile?.teacherCount || 28;
  const classroomCount = profile?.classroomCount || 18;
  const accreditation = profile?.accreditation || "A";

  return (
    <div className="flex flex-col min-h-screen">
      {/* Pengumuman Penting Banner (Jika ada) */}
      {announcements.length > 0 && announcements[0].isImportant && (
        <div className="bg-amber-400 text-slate-950 px-4 py-2.5 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 text-center border-b border-amber-500">
          <Bell className="h-4 w-4 shrink-0 text-slate-900 animate-bounce" />
          <span>
            <strong>PENGUMUMAN PENTING:</strong> {announcements[0].title}
          </span>
          <Link
            href="/pengumuman"
            className="underline font-bold hover:text-blue-900 ml-1 inline-flex items-center gap-0.5"
          >
            <span>Selengkapnya</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-blue-800 to-indigo-900 text-white pt-16 pb-24 lg:pt-20 lg:pb-32">
        {/* Background Decorative Circles */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden pointer-events-none opacity-20">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-amber-400 blur-3xl" />
          <div className="absolute top-1/2 right-0 w-80 h-80 rounded-full bg-blue-400 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Headline */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-amber-300 text-xs font-bold tracking-wide">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Pendidikan Karakter & Kurikulum Merdeka</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight sm:leading-tight lg:leading-tight">
                {profile?.heroHeadline || "Membentuk Generasi Cerdas, Berakhlak Mulia & Ceria"}
              </h1>

              <p className="text-base sm:text-lg text-blue-100 font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
                {profile?.heroSubheadline ||
                  "Sekolah Dasar ramah anak yang menumbuhkan potensi, empati, dan kreativitas putra-putri Anda melalui suasana belajar yang aman, suportif, dan membahagiakan."}
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  href="/ppdb"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-sm px-7 py-3.5 rounded-xl shadow-lg shadow-amber-400/20 transition-all hover:scale-105 active:scale-95"
                >
                  <span>Pendaftaran PPDB 2025</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/profil"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-6 py-3.5 rounded-xl border border-white/30 backdrop-blur-sm transition-all"
                >
                  <span>Kenali Sekolah Kami</span>
                </Link>
              </div>

              {/* Akreditasi Pills */}
              <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs text-blue-200">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Akreditasi {accreditation} (Unggul)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-amber-400" />
                  <span>Sekolah Ramah Anak (SRA)</span>
                </span>
              </div>
            </div>

            {/* Right Hero Image Collage */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="aspect-4/3 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20 bg-blue-950 relative">
                  <img
                    src="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80"
                    alt="Kegiatan Belajar Siswa"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                    <p className="text-xs font-bold leading-tight">
                      Pembelajaran Kolaboratif Berpusat pada Anak
                    </p>
                    <p className="text-[10px] text-blue-200 mt-0.5">
                      Ruang kelas ceria & interaktif setiap hari
                    </p>
                  </div>
                </div>

                {/* Floating Badge */}
                <div className="absolute -bottom-6 -left-6 bg-white text-slate-900 p-4 rounded-2xl shadow-xl border border-slate-100 hidden sm:flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-400 flex items-center justify-center text-slate-950 font-black text-lg">
                    100%
                  </div>
                  <div>
                    <div className="font-extrabold text-xs">Lulusan Berkarakter</div>
                    <div className="text-[10px] text-slate-500">Profil Pelajar Pancasila</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          1. TAMPILAN KHUSUS HANDPHONE (Mobile Only: block md:hidden)
          Menu Cepat Layanan (App Launcher) & Ringkasan Khusus Layar HP
         ========================================================================= */}
      <section className="block md:hidden px-4 -mt-6 relative z-30 mb-6">
        {/* Launcher Menu Pintasan HP */}
        <div className="bg-white rounded-3xl p-5 shadow-xl border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Smartphone className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 leading-none">
                  Akses Cepat Layanan
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Pintasan praktis untuk orang tua & siswa</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Online 24/7
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <Link
              href="/ppdb"
              className="flex flex-col items-center text-center p-2.5 rounded-2xl bg-gradient-to-b from-amber-50 to-amber-100/40 border border-amber-200/60 active:scale-95 transition-transform"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center shadow-md shadow-amber-400/20 mb-1.5">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-slate-900 leading-tight">PPDB 2025</span>
              <span className="text-[10px] text-amber-700 font-semibold mt-0.5">Daftar Baru</span>
            </Link>

            <Link
              href="/siswa/login"
              className="flex flex-col items-center text-center p-2.5 rounded-2xl bg-gradient-to-b from-blue-50 to-blue-100/40 border border-blue-200/60 active:scale-95 transition-transform"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 mb-1.5">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-slate-900 leading-tight">Portal Siswa</span>
              <span className="text-[10px] text-blue-700 font-semibold mt-0.5">Nilai & Info</span>
            </Link>

            <Link
              href="/pengumuman"
              className="flex flex-col items-center text-center p-2.5 rounded-2xl bg-gradient-to-b from-rose-50 to-rose-100/40 border border-rose-200/60 active:scale-95 transition-transform"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-500/20 mb-1.5">
                <Bell className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-slate-900 leading-tight">Pengumuman</span>
              <span className="text-[10px] text-rose-700 font-semibold mt-0.5">Info Terkini</span>
            </Link>

            <Link
              href="/galeri"
              className="flex flex-col items-center text-center p-2.5 rounded-2xl bg-gradient-to-b from-purple-50 to-purple-100/40 border border-purple-200/60 active:scale-95 transition-transform"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20 mb-1.5">
                <ImageIcon className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-slate-900 leading-tight">Galeri Foto</span>
              <span className="text-[10px] text-purple-700 font-semibold mt-0.5">Dokumentasi</span>
            </Link>

            <Link
              href="/akademik"
              className="flex flex-col items-center text-center p-2.5 rounded-2xl bg-gradient-to-b from-emerald-50 to-emerald-100/40 border border-emerald-200/60 active:scale-95 transition-transform"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 mb-1.5">
                <BookOpen className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-slate-900 leading-tight">Kurikulum</span>
              <span className="text-[10px] text-emerald-700 font-semibold mt-0.5">Kalender & P5</span>
            </Link>

            <Link
              href="/kontak"
              className="flex flex-col items-center text-center p-2.5 rounded-2xl bg-gradient-to-b from-sky-50 to-sky-100/40 border border-sky-200/60 active:scale-95 transition-transform"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-md shadow-sky-500/20 mb-1.5">
                <Phone className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-slate-900 leading-tight">Hubungi Kami</span>
              <span className="text-[10px] text-sky-700 font-semibold mt-0.5">Lokasi & WA</span>
            </Link>
          </div>

          {/* Banner Bantuan Cepat WhatsApp Mobile */}
          <div className="mt-4 p-3 rounded-2xl bg-blue-50/80 border border-blue-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <MessageCircle className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 leading-tight">Konsultasi PPDB & Bantuan</p>
                <p className="text-[10px] text-slate-500">Tanyakan langsung pada admin sekolah</p>
              </div>
            </div>
            <Link
              href="/kontak"
              className="shrink-0 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl shadow-xs active:scale-95 transition-all"
            >
              Tanya Admin
            </Link>
          </div>
        </div>

        {/* Statistik Ringkas Khusus Handphone */}
        <div className="mt-4 bg-slate-50 border border-slate-200/80 rounded-3xl p-4">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-extrabold text-slate-800">Ringkasan Statistik Sekolah</span>
            <span className="text-[10px] text-blue-700 font-bold bg-blue-100 px-2 py-0.5 rounded-full">
              Data Resmi
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs flex flex-col items-center text-center">
              <span className="text-2xl font-black text-blue-600">{studentCount}+</span>
              <span className="text-xs font-bold text-slate-700 mt-0.5">Siswa Aktif</span>
              <span className="text-[10px] text-slate-400">Kelas 1 - 6</span>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs flex flex-col items-center text-center">
              <span className="text-2xl font-black text-blue-600">{teacherCount}</span>
              <span className="text-xs font-bold text-slate-700 mt-0.5">Guru & Tendik</span>
              <span className="text-[10px] text-slate-400">Tersertifikasi</span>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs flex flex-col items-center text-center">
              <span className="text-2xl font-black text-blue-600">{classroomCount}</span>
              <span className="text-xs font-bold text-slate-700 mt-0.5">Rombel</span>
              <span className="text-[10px] text-slate-400">Media Digital</span>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-amber-200 shadow-xs flex flex-col items-center text-center">
              <span className="text-2xl font-black text-amber-500">{accreditation}</span>
              <span className="text-xs font-bold text-slate-700 mt-0.5">Akreditasi</span>
              <span className="text-[10px] text-amber-600 font-semibold">Predikat Unggul</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. TAMPILAN KHUSUS LAPTOP / DESKTOP (Desktop Only: hidden md:block)
          Statistik Bar Horizontal Lengkap & Luas
         ========================================================================= */}
      <section className="hidden md:block relative -mt-10 z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            <div className="flex flex-col items-center text-center p-2">
              <span className="text-3xl sm:text-4xl font-black text-blue-600 tracking-tight">
                {studentCount}+
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-700 mt-1">
                Peserta Didik Aktif
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">Kelas 1 hingga Kelas 6</span>
            </div>

            <div className="flex flex-col items-center text-center p-2">
              <span className="text-3xl sm:text-4xl font-black text-blue-600 tracking-tight">
                {teacherCount}
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-700 mt-1">
                Guru & Tenaga Didik
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">Tersertifikasi & Berdedikasi</span>
            </div>

            <div className="flex flex-col items-center text-center p-2">
              <span className="text-3xl sm:text-4xl font-black text-blue-600 tracking-tight">
                {classroomCount}
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-700 mt-1">
                Rombongan Belajar
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">Dilengkapi Media Digital</span>
            </div>

            <div className="flex flex-col items-center text-center p-2">
              <span className="text-3xl sm:text-4xl font-black text-amber-500 tracking-tight">
                {accreditation}
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-700 mt-1">
                Akreditasi Nasional
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">Predikat Unggul BAN-S/M</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SAMBUTAN KEPALA SEKOLAH & PROFIL SINGKAT */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 text-center lg:text-left">
              <div className="relative inline-block">
                <img
                  src={
                    profile?.principalPhoto ||
                    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80"
                  }
                  alt={profile?.principalName || "Kepala Sekolah"}
                  className="w-64 h-80 sm:w-72 sm:h-96 object-cover rounded-3xl shadow-xl border-4 border-white bg-slate-200"
                />
                <div className="absolute -bottom-4 right-0 bg-blue-700 text-white py-2 px-4 rounded-xl shadow-lg text-xs font-bold">
                  Kepala Sekolah
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider">
                Sambutan Kepala Sekolah
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                Menyemai Karakter & Kebahagiaan Belajar Sejak Dini
              </h2>
              <div className="text-slate-600 text-sm sm:text-base leading-relaxed space-y-3">
                <p>
                  &ldquo;{profile?.principalMessage}&rdquo;
                </p>
              </div>
              <div className="pt-2">
                <h4 className="font-extrabold text-slate-900 text-base">
                  {profile?.principalName || "Dra. Hj. Siti Rahmawati, M.Pd."}
                </h4>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  NIP: {profile?.principalNip || "19750512 200003 2 001"}
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/profil"
                  className="inline-flex items-center gap-1.5 text-blue-600 font-bold text-sm hover:underline"
                >
                  <span>Baca Visi, Misi & Sejarah Lengkap Sekolah</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. KEUNGGULAN SEKOLAH (6 PILAR) */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              Mengapa Memilih Kami?
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Keunggulan SD Negeri Harapan Bangsa
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Kami mengintegrasikan kurikulum nasional dengan pembiasaan budi pekerti luhur dan sarana pendukung tumbuh kembang anak.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 rounded-3xl bg-slate-50 hover:bg-white border border-slate-100 hover:border-blue-100 hover:shadow-xl transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <BookOpen className="h-6 w-6 text-amber-400" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Kurikulum Merdeka Interaktif</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Pembelajaran berdiferensiasi yang menyesuaikan minat dan kesiapan belajar anak melalui Proyek Penguatan Profil Pelajar Pancasila (P5).
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 hover:bg-white border border-slate-100 hover:border-blue-100 hover:shadow-xl transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Heart className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Sekolah Ramah Anak (SRA)</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Lingkungan aman bebas perundungan (anti-bullying), disiplin positif tanpa kekerasan, dan fasilitas yang higienis serta nyaman.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 hover:bg-white border border-slate-100 hover:border-blue-100 hover:shadow-xl transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Award className="h-6 w-6 text-amber-300" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Guru Bersertifikasi & Peduli</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Pendidik berlatar belakang S1/S2 PGSD yang terlatih dalam psikologi perkembangan anak serta berjiwa sabar dan mengayomi.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 hover:bg-white border border-slate-100 hover:border-blue-100 hover:shadow-xl transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Sparkles className="h-6 w-6 text-amber-300" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Literasi Digital & Koding</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Laboratorium komputer modern mengenalkan logika komputasi ramah anak dan pemanfaatan teknologi secara bertanggung jawab.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 hover:bg-white border border-slate-100 hover:border-blue-100 hover:shadow-xl transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6 text-amber-300" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Ragam Ekstrakurikuler</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Pramuka, tari tradisional, robotika, drumband, futsal, hingga olimpiade sains untuk mengasah minat dan bakat non-akademik.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 hover:bg-white border border-slate-100 hover:border-blue-100 hover:shadow-xl transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-cyan-600 text-white flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Shield className="h-6 w-6 text-amber-300" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Pembiasaan Karakter Luhur</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Doa bersama pagi hari, sholat dhuha / ibadah pagi, senyum salam sapa (5S), dan sarana UKS sehat terstandar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. BERITA & PENGUMUMAN TERBARU */}
      <section className="py-20 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-100/60 px-3 py-1 rounded-full">
                Kabar & Pengumuman
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
                Berita Terbaru Sekolah
              </h2>
            </div>
            <Link
              href="/berita"
              className="inline-flex items-center gap-1.5 text-blue-600 font-bold text-sm hover:underline"
            >
              <span>Lihat Semua Berita</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {latestNews.map((n) => (
              <article
                key={n.id}
                className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-100 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="aspect-16/10 overflow-hidden bg-slate-100 relative">
                    <img
                      src={
                        n.coverImage ||
                        "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=600&q=80"
                      }
                      alt={n.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-blue-600 text-white text-[11px] font-bold shadow-md">
                      {n.category}
                    </span>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{formatDateIndo(n.publishedAt)}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors line-clamp-2">
                      <Link href={`/berita/${n.slug}`}>{n.title}</Link>
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                      {n.excerpt}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-0">
                  <Link
                    href={`/berita/${n.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    <span>Baca Selengkapnya</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 6. GALERI KEGIATAN UNGGULAN */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                Dokumentasi Visual
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
                Galeri Keceriaan Sekolah
              </h2>
            </div>
            <Link
              href="/galeri"
              className="inline-flex items-center gap-1.5 text-blue-600 font-bold text-sm hover:underline"
            >
              <span>Buka Seluruh Galeri</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {featuredGalleries.map((g) => (
              <div
                key={g.id}
                className="group relative aspect-square rounded-2xl overflow-hidden shadow-sm bg-slate-100"
              >
                <img
                  src={g.imageUrl}
                  alt={g.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <span className="text-[11px] font-bold text-white line-clamp-2">
                    {g.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. TESTIMONI ORANG TUA SISWA */}
      <section className="py-20 bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Kata Orang Tua
            </span>
            <h2 className="text-3xl font-black tracking-tight">
              Kepercayaan Keluarga Besar Harapan Bangsa
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/15 space-y-4">
              <div className="flex text-amber-400 gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-blue-100 leading-relaxed italic">
                &ldquo;Putri saya sangat bersemangat ke sekolah setiap hari. Gurunya sangat sabar dan komunikatif melaporkan perkembangan belajar secara berkala.&rdquo;
              </p>
              <div className="pt-2 border-t border-white/10">
                <div className="font-bold text-sm">Bunda Clarissa</div>
                <div className="text-[11px] text-blue-200">Orang tua siswa Kelas 2</div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/15 space-y-4">
              <div className="flex text-amber-400 gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-blue-100 leading-relaxed italic">
                &ldquo;Penerapan Kurikulum Merdeka di sekolah ini sangat nyata. Anak-anak diajak berpikir mandiri dan berani mengemukakan pendapat di depan kelas.&rdquo;
              </p>
              <div className="pt-2 border-t border-white/10">
                <div className="font-bold text-sm">Bapak Hendra W.</div>
                <div className="text-[11px] text-blue-200">Orang tua siswa Kelas 4</div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/15 space-y-4">
              <div className="flex text-amber-400 gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-blue-100 leading-relaxed italic">
                &ldquo;Fasilitas UKS dan lingkungan sekolah yang bersih membuat kami sebagai orang tua merasa sangat tenang menitipkan putra kami menuntut ilmu.&rdquo;
              </p>
              <div className="pt-2 border-t border-white/10">
                <div className="font-bold text-sm">Ibu Ratna Sari</div>
                <div className="text-[11px] text-blue-200">Orang tua siswa Kelas 1</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. CTA PPDB */}
      <section className="py-16 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Siap Bergabung dengan Keluarga Besar Kami?
          </h2>
          <p className="text-sm sm:text-base text-slate-900 max-w-2xl mx-auto font-medium">
            Pendaftaran Peserta Didik Baru (PPDB) Tahun Ajaran 2025/2026 dibuka secara daring. Dapatkan informasi syarat, alur, dan kuota penerimaan sekarang.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/ppdb/daftar"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-black text-sm px-8 py-4 rounded-xl shadow-lg transition-all active:scale-95"
            >
              <span>Daftar Online Sekarang</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/ppdb/status"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-slate-900 hover:bg-slate-100 font-bold text-sm px-6 py-4 rounded-xl shadow-xs"
            >
              <span>Cek Status Pendaftaran</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
