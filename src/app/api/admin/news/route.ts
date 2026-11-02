import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { newsSchema } from "@/lib/validations/news";
import { logActivity } from "@/lib/audit";
import { getAllNews, createNews } from "@/lib/storage/db";
import { sanitizeInput } from "@/lib/security/sanitize";
import { apiCreated, apiSuccess, handleApiError } from "@/lib/api-response";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    await requireAuth(["SUPER_ADMIN", "ADMIN", "STAFF"]);
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const status = searchParams.get("status") || "";

    // Ambil data dari persistent storage
    const news = getAllNews({ q, category, status });

    return apiSuccess(news);
  } catch (error: unknown) {
    return handleApiError(error, "Gagal mengambil data berita");
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(["SUPER_ADMIN", "ADMIN", "STAFF"]);
    const body = await request.json();
    const parsed = newsSchema.safeParse(body);

    if (!parsed.success) {
      return handleApiError(parsed.error);
    }

    const data = parsed.data;

    // Sanitasi input teks berita (OWASP A03: XSS Prevention)
    const cleanTitle = sanitizeInput(data.title);
    const cleanExcerpt = sanitizeInput(data.excerpt);
    const cleanContent = sanitizeInput(data.content);

    // 1. Simpan ke sistem penyimpanan nyata
    const item = createNews({
      title: cleanTitle,
      excerpt: cleanExcerpt,
      content: cleanContent,
      coverImage: data.coverImage || null,
      category: data.category,
      status: data.status,
      isFeatured: data.isFeatured,
      authorName: session.name,
      publishedAt: new Date().toISOString(),
    });

    // 2. Coba simpan ke Prisma jika database online
    try {
      await prisma.news.create({
        data: {
          title: item.title,
          slug: item.slug,
          excerpt: item.excerpt,
          content: item.content,
          coverImage: item.coverImage,
          category: item.category,
          status: item.status,
          isFeatured: item.isFeatured,
          authorId: session.userId,
        },
      });
    } catch {}

    try {
      await logActivity({
        adminId: session.userId,
        adminName: session.name,
        action: "CREATE_NEWS",
        details: `Menambahkan berita baru: "${item.title}"`,
      });
    } catch {}

    return apiCreated(item, "Berita berhasil dibuat.");
  } catch (error: unknown) {
    return handleApiError(error, "Gagal membuat berita");
  }
}
