import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { galleryItemSchema } from "@/lib/validations/gallery";
import { logActivity } from "@/lib/audit";

export async function GET(request: NextRequest) {
  try {
    const category = request.nextUrl.searchParams.get("category");
    const where: any = {};
    if (category) {
      where.category = { slug: category };
    }

    const [items, categories] = await Promise.all([
      prisma.gallery.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
        },
      }),
      prisma.galleryCategory.findMany({
        orderBy: { order: "asc" },
      }),
    ]);

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

    const item = await prisma.gallery.create({
      data: parsed.data,
      include: {
        category: true,
      },
    });

    await logActivity({
      adminId: session.userId,
      adminName: session.name,
      action: "CREATE_GALLERY",
      details: `Menambahkan foto galeri: "${item.title}"`,
    });

    return NextResponse.json({ success: true, data: item });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, message: "Akses ditolak" }, { status: 401 });
    }
    return NextResponse.json({ success: false, message: "Gagal menambahkan foto galeri" }, { status: 500 });
  }
}
