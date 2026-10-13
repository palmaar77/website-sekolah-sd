import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { newsSchema } from "@/lib/validations/news";
import { slugify } from "@/lib/utils";
import { logActivity } from "@/lib/audit";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const item = await prisma.news.findUnique({
      where: { id },
    });

    if (!item) {
      return NextResponse.json({ success: false, message: "Berita tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: item });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "UNAUTHORIZED") {
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
    const session = await requireAuth();
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
    const existing = await prisma.news.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, message: "Berita tidak ditemukan" }, { status: 404 });
    }

    let slug = existing.slug;
    if (data.slug && data.slug !== existing.slug) {
      let baseSlug = slugify(data.slug);
      let finalSlug = baseSlug;
      let counter = 1;
      while (await prisma.news.findFirst({ where: { slug: finalSlug, NOT: { id } } })) {
        finalSlug = `${baseSlug}-${counter}`;
        counter++;
      }
      slug = finalSlug;
    }

    const updated = await prisma.news.update({
      where: { id },
      data: {
        title: data.title,
        slug,
        excerpt: data.excerpt,
        content: data.content,
        coverImage: data.coverImage,
        category: data.category,
        status: data.status,
        isFeatured: data.isFeatured,
      },
    });

    await logActivity({
      adminId: session.userId,
      adminName: session.name,
      action: "UPDATE_NEWS",
      details: `Memperbarui berita: "${updated.title}"`,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, message: "Akses ditolak" }, { status: 401 });
    }
    return NextResponse.json({ success: false, message: "Gagal memperbarui berita" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const existing = await prisma.news.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ success: false, message: "Berita tidak ditemukan" }, { status: 404 });
    }

    await prisma.news.delete({ where: { id } });

    await logActivity({
      adminId: session.userId,
      adminName: session.name,
      action: "DELETE_NEWS",
      details: `Menghapus berita: "${existing.title}"`,
    });

    return NextResponse.json({ success: true, message: "Berita berhasil dihapus" });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, message: "Akses ditolak" }, { status: 401 });
    }
    return NextResponse.json({ success: false, message: "Gagal menghapus berita" }, { status: 500 });
  }
}
