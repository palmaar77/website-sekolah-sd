"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { formatDateIndo } from "@/lib/utils";

interface GalleryItem {
  id: string;
  title: string;
  imageUrl: string;
  description: string | null;
  categoryId: string;
  category: { id: string; name: string; slug: string };
  createdAt: Date | string;
}

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
}

export function GalleryClient({
  items,
  categories,
}: {
  items: GalleryItem[];
  categories: CategoryItem[];
}) {
  const [selectedCat, setSelectedCat] = React.useState<string>("all");
  const [activePhoto, setActivePhoto] = React.useState<GalleryItem | null>(null);

  const filteredItems = React.useMemo(() => {
    if (selectedCat === "all") return items;
    return items.filter((item) => item.category.slug === selectedCat);
  }, [items, selectedCat]);

  return (
    <div className="space-y-8">
      {/* Category Pills */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 flex-wrap">
        <button
          onClick={() => setSelectedCat("all")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            selectedCat === "all"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Semua Dokumentasi ({items.length})
        </button>
        {categories.map((c) => {
          const count = items.filter((i) => i.category.slug === c.slug).length;
          return (
            <button
              key={c.id}
              onClick={() => setSelectedCat(c.slug)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCat === c.slug
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {c.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {filteredItems.length === 0 ? (
        <div className="py-20 text-center text-slate-400 text-sm bg-slate-50 rounded-3xl border border-slate-100">
          Belum ada dokumentasi pada kategori ini.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredItems.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setActivePhoto(photo)}
              className="group cursor-pointer bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-xs hover:shadow-xl transition-all flex flex-col justify-between"
            >
              <div className="aspect-4/3 overflow-hidden bg-slate-100 relative">
                <img
                  src={photo.imageUrl}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-xs text-[10px] font-bold text-white">
                  {photo.category.name}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-blue-600 transition-colors">
                  {photo.title}
                </h3>
                {photo.description && (
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                    {photo.description}
                  </p>
                )}
                <div className="text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-100">
                  {formatDateIndo(photo.createdAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      <Modal
        isOpen={Boolean(activePhoto)}
        onClose={() => setActivePhoto(null)}
        title={activePhoto?.title}
        maxWidth="xl"
      >
        {activePhoto && (
          <div className="space-y-4">
            <div className="rounded-2xl overflow-hidden bg-slate-950 aspect-16/10 flex items-center justify-center">
              <img
                src={activePhoto.imageUrl}
                alt={activePhoto.title}
                className="max-w-full max-h-[60vh] object-contain mx-auto"
              />
            </div>
            {activePhoto.description && (
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                {activePhoto.description}
              </p>
            )}
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
              <span>Kategori: <strong>{activePhoto.category.name}</strong></span>
              <span>{formatDateIndo(activePhoto.createdAt)}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
