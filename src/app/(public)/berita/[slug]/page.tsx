import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getNewsBySlug, getPublishedNews } from "@/lib/storage/db";
import {
  Calendar,
  User,
  ArrowLeft,
  Share2,
  Clock,
  ChevronRight,
  Eye,
  BookOpen,
} from "lucide-react";
import { formatDateIndo } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";


export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  try {
    const news = await prisma.news.findUnique({
      where: { slug },
    });

    if (!news || news.status !== "PUBLISHED") {
      return { title: "Berita Tidak Ditemukan" };
    }

    return {
      title: news.title,
      description: news.excerpt,
      openGraph: {
        title: news.title,
        description: news.excerpt,
        images: news.coverImage ? [news.coverImage] : [],
        type: "article",
      },
    };
  } catch {
    return { title: "Berita Sekolah" };
  }
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let article: any = null;
  try {
    article = await prisma.news.findUnique({
      where: { slug },
      include: {
        author: {
          select: { name: true },
        },
      },
    });
  } catch {
    // Database connection offline
  }

  // Jika tidak ditemukan di Prisma, ambil dari sistem penyimpanan nyata
  if (!article) {
    article = getNewsBySlug(slug);
  }

  // Jika tidak ditemukan atau masih berstatus draft, jangan tampilkan ke publik!
  if (!article || article.status !== "PUBLISHED") {
    notFound();
  }

  // Ambil berita terkait dalam kategori yang sama
  let relatedNews: any[] = [];
  try {
    relatedNews = await prisma.news.findMany({
      where: {
        category: article.category,
        status: "PUBLISHED",
        NOT: { id: article.id },
      },
      take: 3,
      orderBy: { publishedAt: "desc" },
    });
  } catch {
    const list = getPublishedNews({ category: article.category, limit: 4 });
    relatedNews = list.data.filter((n) => n.id !== article.id).slice(0, 3);
  }

  if (relatedNews.length === 0) {
    const list = getPublishedNews({ limit: 4 });
    relatedNews = list.data.filter((n) => n.id !== article.id).slice(0, 3);
  }

  return (
    <article className="pb-24">
      {/* Breadcrumb Header */}
      <div className="bg-slate-50 border-b border-slate-100 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto flex items-center gap-2 text-xs text-slate-500 flex-wrap">
          <Link href="/" className="hover:text-blue-600">
            Beranda
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/berita" className="hover:text-blue-600">
            Berita
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-slate-800 font-medium truncate max-w-xs">{article.title}</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-8">
        {/* Title & Metadata */}
        <div className="space-y-4">
          <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider">
            {article.category}
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2 border-y border-slate-100 py-3">
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <User className="h-4 w-4 text-blue-600" />
              <span>Oleh: {article.author?.name || "Redaksi Sekolah"}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span>{formatDateIndo(article.publishedAt, true)}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Eye className="h-4 w-4 text-slate-400" />
              <span>{article.viewCount}x dibaca</span>
            </span>
          </div>
        </div>

        {/* Cover Image */}
        {article.coverImage && (
          <div className="aspect-16/9 rounded-3xl overflow-hidden shadow-md bg-slate-100 border border-slate-200">
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Excerpt Lead */}
        <p className="text-base sm:text-lg font-semibold text-slate-700 leading-relaxed border-l-4 border-l-blue-600 pl-4 italic">
          {article.excerpt}
        </p>

        {/* Content Body */}
        <div className="prose prose-slate max-w-none text-sm sm:text-base leading-relaxed text-slate-700 space-y-4 whitespace-pre-line font-normal">
          {article.content}
        </div>

        {/* Back button */}
        <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
          <Link
            href="/berita"
            className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Indeks Berita</span>
          </Link>
        </div>

        {/* Related News */}
        {relatedNews.length > 0 && (
          <div className="pt-12 space-y-6">
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Berita Terkait Lainnya
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedNews.map((rel) => (
                <div
                  key={rel.id}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-xs hover:shadow-md transition-shadow p-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="aspect-16/10 rounded-xl overflow-hidden bg-slate-100 mb-2.5">
                      <img
                        src={
                          rel.coverImage ||
                          "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=400&q=80"
                        }
                        alt={rel.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-[10px] text-blue-600 font-bold uppercase">
                      {rel.category}
                    </span>
                    <h4 className="font-bold text-xs text-slate-900 line-clamp-2 mt-1">
                      <Link href={`/berita/${rel.slug}`} className="hover:underline">
                        {rel.title}
                      </Link>
                    </h4>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-100">
                    {formatDateIndo(rel.publishedAt)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
