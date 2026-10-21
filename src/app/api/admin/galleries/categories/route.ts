import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { getGalleryCategories, createGalleryCategory } from "@/lib/storage/db";
import { galleryCategorySchema } from "@/lib/validations/gallery";

export async function GET() {
  try {
    const categories = getGalleryCategories();
    return NextResponse.json({ success: true, data: categories });
  } catch {
    return NextResponse.json({ success: false, message: "Gagal mengambil kategori" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const body = await request.json();
    const parsed = galleryCategorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validasi kategori gagal: nama kategori minimal 2 karakter",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const created = createGalleryCategory({
      name: parsed.data.name,
      description: parsed.data.description,
      order: parsed.data.order,
    });

    try {
      await prisma.galleryCategory.upsert({
        where: { id: created.id },
        update: { name: created.name, slug: created.slug },
        create: {
          id: created.id,
          name: created.name,
          slug: created.slug,
          description: created.description,
          order: created.order,
        },
      });
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Kategori baru berhasil ditambahkan",
      data: created,
    });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, message: "Akses ditolak" }, { status: 401 });
    }
    return NextResponse.json({ success: false, message: "Gagal membuat kategori" }, { status: 500 });
  }
}
