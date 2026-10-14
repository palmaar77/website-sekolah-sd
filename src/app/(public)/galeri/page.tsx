import prisma from "@/lib/prisma";
import { getGalleries, getGalleryCategories } from "@/lib/storage/db";
import { GalleryClient } from "./gallery-client";

export const metadata = {
  title: "Galeri Dokumentasi",
  description:
    "Dokumentasi foto kegiatan belajar mengajar, upacara, ekstrakurikuler, dan prestasi SD Negeri Harapan Bangsa.",
};

export default async function GaleriPage() {
  let items: any[] = [];
  let categories: any[] = [];

  try {
    [items, categories] = await Promise.all([
      prisma.gallery.findMany({
        orderBy: { createdAt: "desc" },
        include: { category: true },
      }),
      prisma.galleryCategory.findMany({
        orderBy: { order: "asc" },
      }),
    ]);
  } catch {
    // Database offline, ambil dari sistem penyimpanan nyata
    items = getGalleries();
    categories = getGalleryCategories();
  }

  if (items.length === 0) {
    items = getGalleries();
    categories = getGalleryCategories();
  }

  return (
    <div className="space-y-12 pb-24">
      <section className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-white/10 px-3.5 py-1 rounded-full border border-white/15">
            Dokumentasi Visual
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
            Galeri Kegiatan Sekolah
          </h1>
          <p className="text-sm sm:text-base text-blue-100 max-w-2xl mx-auto">
            Merekam momen berharga keceriaan, kreativitas, dan proses belajar peserta didik di lingkungan sekolah.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <GalleryClient items={items} categories={categories} />
      </div>
    </div>
  );
}
