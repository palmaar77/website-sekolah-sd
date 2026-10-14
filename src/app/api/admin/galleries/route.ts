import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { galleryItemSchema } from "@/lib/validations/gallery";
import { logActivity } from "@/lib/audit";
import {
  getGalleries,
  getGalleryCategories,
  createGallery,
} from "@/lib/storage/db";

export async function GET(request: NextRequest) {
  try {
    const category = request.nextUrl.searchParams.get("category");

    // Ambil data kategori dan item galeri dari persistent file-backed database
    const categories = getGalleryCategories();
    const rawItems = getGalleries(category || undefined);

    const items = rawItems.map((item) => ({
      ...item,
      category: {
        id: item.categoryId,
        name: item.categoryName || "Umum",
        slug: categories.find((c) => c.id === item.categoryId)?.slug || "umum",
      },
    }));

    // Coba query prisma secara background / non-blocking jika database PostgreSQL aktif
    try {
      const where: any = {};
      if (category) {
        where.category = { slug: category };
      }
      const [prismaItems, prismaCats] = await Promise.all([
        prisma.gallery.findMany({
          where,
          orderBy: { createdAt: "desc" },
          include: { category: { select: { id: true, name: true, slug: true } } },
        }),
        prisma.galleryCategory.findMany({ orderBy: { order: "asc" } }),
      ]);
      if (prismaItems.length > 0) {
        return NextResponse.json({ success: true, data: prismaItems, categories: prismaCats });
      }
    } catch {
      // Abaikan bila PostgreSQL offline, gunakan data dari persistent file storage
    }

    return NextResponse.json({ success: true, data: items, categories });
  } catch (error) {
    console.error("Gallery error:", error);
    return NextResponse.json({ success: false, message: "Gagal mengambil data galeri" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const parsed = galleryItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Validasi gagal", errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Simpan ke sistem penyimpanan nyata (persistent file-backed DB)
    const item = createGallery({
      title: parsed.data.title,
      imageUrl: parsed.data.imageUrl,
      description: parsed.data.description || null,
      categoryId: parsed.data.categoryId,
      isFeatured: parsed.data.isFeatured ?? true,
    });

    const categories = getGalleryCategories();
    const formattedItem = {
      ...item,
      category: {
        id: item.categoryId,
        name: item.categoryName || "Umum",
        slug: categories.find((c) => c.id === item.categoryId)?.slug || "umum",
      },
    };

    // Sinkronisasi ke Prisma jika database aktif
    try {
      await prisma.gallery.create({
        data: parsed.data,
      });
    } catch {
      // Abaikan jika database PostgreSQL offline
    }

    await logActivity({
      adminId: session.userId,
      adminName: session.name,
      action: "CREATE_GALLERY",
      details: `Menambahkan foto galeri: "${item.title}"`,
    });

    return NextResponse.json({ success: true, data: formattedItem });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, message: "Akses ditolak" }, { status: 401 });
    }
    return NextResponse.json({ success: false, message: "Gagal menambahkan foto galeri" }, { status: 500 });
  }
}

