import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { newsSchema } from "@/lib/validations/news";
import { logActivity } from "@/lib/audit";
import { getAllNews, createNews } from "@/lib/storage/db";
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

    return NextResponse.json({ success: true, data: news });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "UNAUTHORIZED" || (err as any).name === "AuthorizationError") {
      return NextResponse.json({ success: false, message: "Akses ditolak" }, { status: 401 });
    }
    return NextResponse.json({ success: false, message: "Gagal mengambil data berita" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(["SUPER_ADMIN", "ADMIN", "STAFF"]);
    const body = await request.json();
    const parsed = newsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Validasi gagal", errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // 1. Simpan ke sistem penyimpanan nyata
    const item = createNews({
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
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

    return NextResponse.json({ success: true, data: item });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "UNAUTHORIZED" || (err as any).name === "AuthorizationError") {
      return NextResponse.json({ success: false, message: "Akses ditolak" }, { status: 401 });
    }
    console.error("Create news error:", error);
    return NextResponse.json({ success: false, message: "Gagal membuat berita" }, { status: 500 });
  }
}
