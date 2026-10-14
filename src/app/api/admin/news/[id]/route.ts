import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { newsSchema } from "@/lib/validations/news";
import { logActivity } from "@/lib/audit";
import { getNewsById, updateNews, deleteNews } from "@/lib/storage/db";
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
      return NextResponse.json({ success: false, message: "Berita tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: item });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "UNAUTHORIZED" || (err as any).name === "AuthorizationError") {
      return NextResponse.json({ success: false, message: "Akses ditolak" }, { status: 401 });
    }
    return NextResponse.json({ success: false, message: "Kesalahan server" }, { status: 500 });
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
      return NextResponse.json(
        { success: false, message: "Validasi gagal", errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;

    let updated;
    try {
      updated = updateNews(id, {
        title: data.title,
        excerpt: data.excerpt,
        content: data.content,
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
          title: data.title,
          excerpt: data.excerpt,
          content: data.content,
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
        details: `Memperbarui berita: "${data.title}"`,
      });
    } catch {}

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "UNAUTHORIZED" || (err as any).name === "AuthorizationError") {
      return NextResponse.json({ success: false, message: "Akses ditolak" }, { status: 401 });
    }
    console.error("Update news error:", error);
    return NextResponse.json({ success: false, message: "Gagal memperbarui berita" }, { status: 500 });
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

    return NextResponse.json({
      success: true,
      message: deleted ? "Berita berhasil dihapus dari sistem" : "Berita telah dihapus",
    });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "UNAUTHORIZED" || (err as any).name === "AuthorizationError") {
      return NextResponse.json({ success: false, message: "Akses ditolak" }, { status: 401 });
    }
    console.error("Delete news error:", error);
    return NextResponse.json({ success: false, message: "Gagal menghapus berita" }, { status: 500 });
  }
}
