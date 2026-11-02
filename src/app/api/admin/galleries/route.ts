import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { galleryItemSchema } from "@/lib/validations/gallery";
import { logActivity } from "@/lib/audit";
import {
  getGalleries,
  getGalleryCategories,
  createGallery,
} from "@/lib/storage/db";
import { sanitizeInput } from "@/lib/security/sanitize";
import { apiCreated, apiSuccess, handleApiError } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const category = request.nextUrl.searchParams.get("category");

    // Ambil data kategori dan item galeri dari persistent storage
    const categories = getGalleryCategories();
    const rawItems = getGalleries(category || undefined);

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
        return apiSuccess(mergedItems, { categories });
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

    return apiSuccess(items, { categories });
  } catch (error) {
    return handleApiError(error, "Gagal mengambil data galeri");
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const parsed = galleryItemSchema.safeParse(body);

    if (!parsed.success) {
      return handleApiError(parsed.error);
    }

    // Pastikan kategori ada
    const categories = getGalleryCategories();
    let cat = categories.find(
      (c) => c.id === parsed.data.categoryId || c.slug === parsed.data.categoryId
    );
    if (!cat && categories.length > 0) {
      cat = categories[0];
    }

    const finalCategoryId = cat ? cat.id : parsed.data.categoryId;

    // Sanitasi judul dan deskripsi galeri (OWASP A03)
    const cleanTitle = sanitizeInput(parsed.data.title);
    const cleanDescription = parsed.data.description ? sanitizeInput(parsed.data.description) : null;

    // Simpan ke sistem penyimpanan nyata (persistent file-backed DB)
    const item = createGallery({
      title: cleanTitle,
      imageUrl: parsed.data.imageUrl.trim(),
      description: cleanDescription,
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

    return apiCreated(formattedItem, "Foto galeri berhasil disimpan dan ditampilkan.");
  } catch (error: unknown) {
    return handleApiError(error, "Gagal menambahkan foto galeri");
  }
}
