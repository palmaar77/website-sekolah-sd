import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { newsSchema } from "@/lib/validations/news";
import { logActivity } from "@/lib/audit";
import { getNewsById, updateNews, deleteNews } from "@/lib/storage/db";
import { sanitizeInput } from "@/lib/security/sanitize";
import { apiNotFound, apiSuccess, handleApiError } from "@/lib/api-response";
import prisma from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth(["SUPER_ADMIN", "ADMIN", "STAFF"]);
    const { id } = await params;

    let item = getNewsById(id);
    if (!item) {
      try {
        item = await prisma.news.findUnique({ where: { id } }) as any;
      } catch {}
    }

    if (!item) {
      return apiNotFound("Berita tidak ditemukan");
    }

    return apiSuccess(item);
  } catch (error: unknown) {
    return handleApiError(error, "Kesalahan server saat mengambil berita");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(["SUPER_ADMIN", "ADMIN", "STAFF"]);
    const { id } = await params;
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

    let updated;
    try {
      updated = updateNews(id, {
        title: cleanTitle,
        excerpt: cleanExcerpt,
        content: cleanContent,
        coverImage: data.coverImage || null,
        category: data.category,
        status: data.status,
        isFeatured: data.isFeatured,
      });
    } catch {
      // Jika di storage gagal, cek Prisma
    }

    try {
      await prisma.news.update({
        where: { id },
        data: {
          title: cleanTitle,
          excerpt: cleanExcerpt,
          content: cleanContent,
          coverImage: data.coverImage || null,
          category: data.category,
          status: data.status,
          isFeatured: data.isFeatured,
        },
      });
    } catch {}

    try {
      await logActivity({
        adminId: session.userId,
        adminName: session.name,
        action: "UPDATE_NEWS",
        details: `Memperbarui berita: "${cleanTitle}"`,
      });
    } catch {}

    return apiSuccess(updated);
  } catch (error: unknown) {
    return handleApiError(error, "Gagal memperbarui berita");
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(["SUPER_ADMIN", "ADMIN"]);
    const { id } = await params;

    const deleted = deleteNews(id);

    try {
      await prisma.news.delete({ where: { id } });
    } catch {}

    try {
      await logActivity({
        adminId: session.userId,
        adminName: session.name,
        action: "DELETE_NEWS",
        details: `Menghapus berita ID: ${id}`,
      });
    } catch {}

    return apiSuccess({
      message: deleted ? "Berita berhasil dihapus dari sistem" : "Berita telah dihapus",
    });
  } catch (error: unknown) {
    return handleApiError(error, "Gagal menghapus berita");
  }
}
