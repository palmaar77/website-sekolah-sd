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

    // Ambil data kategori dan item galeri dari persistent storage
    let categories = getGalleryCategories();
    let rawItems = getGalleries(category || undefined);

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

      if (prismaCats && prismaCats.length > 0) {
        const existingCatIds = new Set(categories.map((c) => c.id));
        for (const pCat of prismaCats) {
          if (!existingCatIds.has(pCat.id)) {
            categories.push({
              id: pCat.id,
              name: pCat.name,
              slug: pCat.slug,
              description: pCat.description,
              order: pCat.order,
            });
          }
        }
      }

      if (prismaItems && prismaItems.length > 0) {
        const itemIds = new Set(prismaItems.map((pi) => pi.id));
        const mergedItems = [
          ...prismaItems,
          ...rawItems
            .filter((ri) => !itemIds.has(ri.id))
            .map((item) => ({
              ...item,
              category: {
                id: item.categoryId,
                name: item.categoryName || "Umum",
                slug: categories.find((c) => c.id === item.categoryId)?.slug || "umum",
              },
            })),
        ];
        return NextResponse.json({ success: true, data: mergedItems, categories });
      }
    } catch {
      // Abaikan bila PostgreSQL offline, gunakan data dari persistent file storage
    }

    const items = rawItems.map((item) => ({
      ...item,
      category: {
        id: item.categoryId,
        name: item.categoryName || "Umum",
        slug: categories.find((c) => c.id === item.categoryId)?.slug || "umum",
      },
    }));

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
        {
          success: false,
          message: "Validasi gagal: judul, foto, dan kategori wajib diisi dengan benar.",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // Pastikan kategori ada
    let categories = getGalleryCategories();
    let cat = categories.find(
      (c) => c.id === parsed.data.categoryId || c.slug === parsed.data.categoryId
    );
    if (!cat && categories.length > 0) {
      cat = categories[0];
    }

    const finalCategoryId = cat ? cat.id : parsed.data.categoryId;

    // Simpan ke sistem penyimpanan nyata (persistent file-backed DB)
    const item = createGallery({
      title: parsed.data.title.trim(),
      imageUrl: parsed.data.imageUrl.trim(),
      description: parsed.data.description?.trim() || null,
      categoryId: finalCategoryId,
      isFeatured: parsed.data.isFeatured ?? true,
    });

    const formattedItem = {
      ...item,
      category: {
        id: item.categoryId,
        name: item.categoryName || "Umum",
        slug: cat?.slug || "umum",
      },
    };

    // Sinkronisasi ke Prisma jika database aktif
    try {
      if (cat) {
        await prisma.galleryCategory.upsert({
          where: { id: cat.id },
          update: { name: cat.name, slug: cat.slug },
          create: {
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            description: cat.description || null,
            order: cat.order || 0,
          },
        });
      }

      await prisma.gallery.create({
        data: {
          id: item.id,
          title: item.title,
          imageUrl: item.imageUrl,
          description: item.description,
          categoryId: item.categoryId,
          isFeatured: item.isFeatured,
        },
      });
    } catch (prismaErr) {
      console.warn("Prisma gallery create sync:", prismaErr);
    }

    await logActivity({
      adminId: session.userId,
      adminName: session.name,
      action: "CREATE_GALLERY",
      details: `Menambahkan foto galeri: "${item.title}"`,
    });

    return NextResponse.json({
      success: true,
      message: "Foto galeri berhasil disimpan dan ditampilkan.",
      data: formattedItem,
    });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, message: "Akses ditolak" }, { status: 401 });
    }
    console.error("Gallery create error:", error);
    return NextResponse.json({ success: false, message: "Gagal menambahkan foto galeri" }, { status: 500 });
  }
}
