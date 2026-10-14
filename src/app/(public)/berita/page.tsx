import Link from "next/link";
import prisma from "@/lib/prisma";
import { getPublishedNews } from "@/lib/storage/db";
import { Search, Calendar, User, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatDateIndo } from "@/lib/utils";

export const metadata = {
  title: "Berita & Pengumuman",
  description:
    "Kabar kegiatan belajar, prestasi kejuaraan, dan pengumuman resmi SD Negeri Harapan Bangsa.",
};


export default async function BeritaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}) {
  const { q = "", category = "", page = "1" } = await searchParams;
  const currentPage = Math.max(1, parseInt(page, 10));
  const limit = 9;
  const skip = (currentPage - 1) * limit;

  const where: any = {
    status: "PUBLISHED", // Draft tidak boleh terlihat oleh pengunjung!
  };

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { content: { contains: q, mode: "insensitive" } },
      { excerpt: { contains: q, mode: "insensitive" } },
    ];
  }

  if (category) {
    where.category = category;
  }

  let news: any[] = [];
  let totalCount = 0;
  let categories: any[] = [];

  try {
    [news, totalCount, categories] = await Promise.all([
      prisma.news.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishedAt: "desc" },
        include: { author: { select: { name: true } } },
      }),
      prisma.news.count({ where }),
      prisma.news.findMany({
        where: { status: "PUBLISHED" },
        select: { category: true },
        distinct: ["category"],
      }),
    ]);
  } catch (err) {
    // Database offline, ambil dari sistem penyimpanan nyata (Persistent Storage)
    const storageResult = getPublishedNews({
      q,
      category,
      page: currentPage,
      limit,
    });
    news = storageResult.data;
    totalCount = storageResult.total;
    categories = storageResult.categories.map((c) => ({ category: c }));
  }

  // Jika hasil query Prisma kosong, ambil dari persistent storage
  if (news.length === 0 && !q && !category) {
    const storageResult = getPublishedNews({
      q,
      category,
      page: currentPage,
      limit,
    });
    news = storageResult.data;
    totalCount = storageResult.total;
    categories = storageResult.categories.map((c) => ({ category: c }));
  }

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="space-y-12 pb-24">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-white/10 px-3.5 py-1 rounded-full border border-white/15">
            Warta Sekolah
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
            Berita & Kabar Sekolah
          </h1>
          <p className="text-sm sm:text-base text-blue-100 max-w-2xl mx-auto">
            Ikuti berbagai aktivitas menarik, inovasi pembelajaran, dan torehan prestasi siswa kami.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Search & Category Filter */}
        <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <form method="GET" action="/berita" className="relative w-full sm:w-96">
            <Search className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Cari judul atau topik berita..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
            />
          </form>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
            <Link
              href="/berita"
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                !category
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              Semua Kategori
            </Link>
            {categories.map((c) => (
              <Link
                key={c.category}
                href={`/berita?category=${encodeURIComponent(c.category)}`}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  category === c.category
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {c.category}
              </Link>
            ))}
          </div>
        </div>

        {/* News Grid */}
        {news.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border border-slate-100 space-y-3">
            <h3 className="text-lg font-bold text-slate-800">Tidak ada berita ditemukan</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Silakan coba kata kunci lain atau pilih kategori yang berbeda.
            </p>
            <Link
              href="/berita"
              className="inline-block mt-2 text-xs font-bold text-blue-600 hover:underline"
            >
              Reset Pencarian
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {news.map((item) => (
              <article
                key={item.id}
                className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-100 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="aspect-16/10 overflow-hidden bg-slate-100 relative">
                    <img
                      src={
                        item.coverImage ||
                        "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=600&q=80"
                      }
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-blue-600 text-white text-[11px] font-bold shadow-md">
                      {item.category}
                    </span>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-4 text-xs text-slate-400 mb-2">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formatDateIndo(item.publishedAt)}</span>
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors line-clamp-2">
                      <Link href={`/berita/${item.slug}`}>{item.title}</Link>
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                      {item.excerpt}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-0">
                  <Link
                    href={`/berita/${item.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    <span>Baca Selengkapnya</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-8">
            {currentPage > 1 && (
              <Link
                href={`/berita?page=${currentPage - 1}${q ? `&q=${q}` : ""}${category ? `&category=${category}` : ""}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Sebelumnya</span>
              </Link>
            )}
            <span className="text-xs text-slate-500 font-medium">
              Halaman {currentPage} dari {totalPages}
            </span>
            {currentPage < totalPages && (
              <Link
                href={`/berita?page=${currentPage + 1}${q ? `&q=${q}` : ""}${category ? `&category=${category}` : ""}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <span>Selanjutnya</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
