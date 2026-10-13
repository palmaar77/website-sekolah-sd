"use client";

import * as React from "react";
import { PlusCircle, Trash2, Upload, ImageIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { formatDateIndo } from "@/lib/utils";

interface GalleryItem {
  id: string;
  title: string;
  imageUrl: string;
  description: string | null;
  categoryId: string;
  category: { id: string; name: string; slug: string };
  createdAt: string;
}

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
}

export default function AdminGalleryPage() {
  const [items, setItems] = React.useState<GalleryItem[]>([]);
  const [categories, setCategories] = React.useState<CategoryItem[]>([]);
  const [selectedCat, setSelectedCat] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);

  // Form State
  const [title, setTitle] = React.useState("");
  const [imageUrl, setImageUrl] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [categoryId, setCategoryId] = React.useState("");

  const fetchGallery = async () => {
    setIsLoading(true);
    try {
      const url = selectedCat
        ? `/api/admin/galleries?category=${selectedCat}`
        : "/api/admin/galleries";
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setItems(data.data);
        setCategories(data.categories || []);
        if (!categoryId && data.categories?.length > 0) {
          setCategoryId(data.categories[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchGallery();
  }, [selectedCat]);

  const handleOpenCreate = () => {
    setTitle("");
    setImageUrl("");
    setDescription("");
    if (categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id);
    }
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        setImageUrl(data.url);
      } else {
        alert(data.message || "Gagal upload foto");
      }
    } catch {
      alert("Terjadi kesalahan.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) {
      alert("Harap masukkan atau upload foto terlebih dahulu.");
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/galleries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          imageUrl,
          description: description || null,
          categoryId,
          isFeatured: true,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchGallery();
      } else {
        alert(data.message || "Gagal menambahkan foto");
      }
    } catch {
      alert("Terjadi kesalahan.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, itemTitle: string) => {
    if (!confirm(`Hapus foto "${itemTitle}"?`)) return;
    try {
      const res = await fetch(`/api/admin/galleries/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchGallery();
      } else {
        alert(data.message || "Gagal menghapus foto");
      }
    } catch {
      alert("Terjadi kesalahan.");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Galeri Dokumentasi Kegiatan
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Unggah dokumentasi foto kegiatan belajar, ekstrakurikuler, upacara, dan prestasi anak.
          </p>
        </div>
        <Button onClick={handleOpenCreate} variant="primary" className="gap-2">
          <PlusCircle className="h-4 w-4" />
          <span>Tambah Foto Baru</span>
        </Button>
      </div>

      {/* Filter Categories */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCat("")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            selectedCat === ""
              ? "bg-blue-600 text-white"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          Semua Foto ({items.length})
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCat(c.slug)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCat === c.slug
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Photo Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400 text-sm">Memuat galeri foto...</div>
      ) : items.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-sm bg-white rounded-2xl border border-slate-100">
          Belum ada foto dalam kategori ini.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {items.map((item) => (
            <Card key={item.id} className="p-3 overflow-hidden flex flex-col justify-between group">
              <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-slate-100 mb-3">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-xs text-[10px] text-white font-semibold">
                  {item.category?.name}
                </span>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xs line-clamp-1">{item.title}</h4>
                {item.description && (
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                    {item.description}
                  </p>
                )}
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>{formatDateIndo(item.createdAt)}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(item.id, item.title)}
                  className="h-7 w-7 text-rose-600 hover:bg-rose-50"
                  title="Hapus Foto"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Upload */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tambah Foto Galeri Baru"
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Judul Foto Kegiatan"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Upacara Bendera HUT RI"
          />

          <Select
            label="Kategori Kegiatan"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              File Foto
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                required
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="URL Gambar atau pilih file..."
                className="flex-1 h-11 px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
              />
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold">
                <Upload className="h-4 w-4" />
                <span>{isUploading ? "Uploading..." : "Upload"}</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>

          <Textarea
            label="Keterangan / Caption"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Deskripsi singkat kegiatan dalam foto..."
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" isLoading={isSaving}>
              Simpan Foto
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
