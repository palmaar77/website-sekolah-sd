"use client";

import * as React from "react";
import {
  PlusCircle,
  Trash2,
  Upload,
  ImageIcon,
  FolderPlus,
  Edit3,
  Search,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ExternalLink,
  Tag,
  Star,
  RefreshCw,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { formatDateIndo } from "@/lib/utils";

interface GalleryItem {
  id: string;
  title: string;
  imageUrl: string;
  description: string | null;
  categoryId: string;
  category: { id: string; name: string; slug: string };
  isFeatured?: boolean;
  createdAt: string;
}

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  order?: number;
}

const DEFAULT_SAMPLE_IMAGES = [
  {
    title: "Praktikum Sains Cilik di Laboratorium",
    categorySlug: "kegiatan-belajar",
    url: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80",
    description: "Peserta didik antusias mencoba eksperimen kepadatan cairan dan sains menyenangkan.",
  },
  {
    title: "Upacara Bendera Khidmat Hari Senin",
    categorySlug: "upacara",
    url: "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?auto=format&fit=crop&w=800&q=80",
    description: "Seluruh guru dan siswa berbaris rapi mengheningkan cipta serta menyanyikan lagu Indonesia Raya.",
  },
  {
    title: "Latihan Sandi Pramuka Siaga Ceria",
    categorySlug: "ekstrakurikuler",
    url: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=800&q=80",
    description: "Aktivitas pembinaan karakter mandiri, nalar kritis, dan gotong royong di alam terbuka.",
  },
  {
    title: "Apresiasi Juara Lomba Mewarnai & Melukis",
    categorySlug: "lomba-prestasi",
    url: "https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=800&q=80",
    description: "Penganugerahan piala dan sertifikat prestasi seni rupa tingkat kota.",
  },
  {
    title: "Membaca Menyenangkan di Pojok Literasi",
    categorySlug: "kegiatan-belajar",
    url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80",
    description: "Pembiasaan membaca buku cerita rakyat 15 menit sebelum kegiatan belajar mengajar dimulai.",
  },
];

export default function AdminGalleryPage() {
  const [items, setItems] = React.useState<GalleryItem[]>([]);
  const [categories, setCategories] = React.useState<CategoryItem[]>([]);
  const [selectedCat, setSelectedCat] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);

  // Modal Gallery State (Tambah / Edit)
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<GalleryItem | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [formFeedback, setFormFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form Fields
  const [title, setTitle] = React.useState("");
  const [imageUrl, setImageUrl] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [categoryId, setCategoryId] = React.useState("");
  const [isFeatured, setIsFeatured] = React.useState(true);

  // Modal Category State (Tambah Kategori Baru)
  const [isCatModalOpen, setIsCatModalOpen] = React.useState(false);
  const [newCatName, setNewCatName] = React.useState("");
  const [newCatDesc, setNewCatDesc] = React.useState("");
  const [isSavingCat, setIsSavingCat] = React.useState(false);
  const [catFeedback, setCatFeedback] = React.useState<string | null>(null);

  const fetchGallery = async () => {
    setIsLoading(true);
    try {
      const url = selectedCat
        ? `/api/admin/galleries?category=${encodeURIComponent(selectedCat)}`
        : "/api/admin/galleries";
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setItems(data.data || []);
        const cats = data.categories || [];
        setCategories(cats);

        // Pastikan categoryId selalu terpilih
        if (!categoryId && cats.length > 0) {
          setCategoryId(cats[0].id);
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
    setEditingItem(null);
    setTitle("");
    setImageUrl("");
    setDescription("");
    setIsFeatured(true);
    setFormFeedback(null);

    if (categories.length > 0) {
      // Prioritaskan kategori aktif jika ada
      const activeCat = categories.find((c) => c.slug === selectedCat);
      setCategoryId(activeCat ? activeCat.id : categories[0].id);
    }
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: GalleryItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setImageUrl(item.imageUrl);
    setDescription(item.description || "");
    setCategoryId(item.categoryId || (categories.length > 0 ? categories[0].id : ""));
    setIsFeatured(item.isFeatured ?? true);
    setFormFeedback(null);
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setFormFeedback({
        type: "error",
        message: "Ukuran berkas melebihi batas maksimal 5MB.",
      });
      return;
    }

    setIsUploading(true);
    setFormFeedback(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success && data.url) {
        setImageUrl(data.url);
        setFormFeedback({
          type: "success",
          message: "Foto berhasil diunggah! Anda dapat melengkapi judul dan menyimpannya.",
        });
      } else {
        setFormFeedback({
          type: "error",
          message: data.message || "Gagal mengunggah foto. Pastikan format JPG, PNG, atau WebP.",
        });
      }
    } catch {
      setFormFeedback({
        type: "error",
        message: "Terjadi gangguan jaringan saat mengunggah foto.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handlePickSample = (sample: (typeof DEFAULT_SAMPLE_IMAGES)[0]) => {
    setTitle(sample.title);
    setImageUrl(sample.url);
    setDescription(sample.description);

    const matchingCat = categories.find((c) => c.slug === sample.categorySlug);
    if (matchingCat) {
      setCategoryId(matchingCat.id);
    }
    setFormFeedback(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormFeedback(null);

    const cleanTitle = title.trim();
    const cleanUrl = imageUrl.trim();

    if (cleanTitle.length < 3) {
      setFormFeedback({
        type: "error",
        message: "Judul foto minimal 3 karakter.",
      });
      return;
    }

    if (!cleanUrl) {
      setFormFeedback({
        type: "error",
        message: "Foto wajib dilampirkan (bisa upload file atau masukkan URL gambar).",
      });
      return;
    }

    if (!categoryId && categories.length > 0) {
      setCategoryId(categories[0].id);
    }

    const targetCategoryId = categoryId || (categories.length > 0 ? categories[0].id : "cat-001");

    setIsSaving(true);
    try {
      const isEdit = Boolean(editingItem);
      const url = isEdit ? `/api/admin/galleries/${editingItem!.id}` : "/api/admin/galleries";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: cleanTitle,
          imageUrl: cleanUrl,
          description: description.trim() || null,
          categoryId: targetCategoryId,
          isFeatured,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFormFeedback({
          type: "success",
          message: data.message || (isEdit ? "Foto berhasil diperbarui." : "Foto berhasil ditambahkan."),
        });
        fetchGallery();
        setTimeout(() => {
          setIsModalOpen(false);
          setFormFeedback(null);
        }, 800);
      } else {
        const errDetail =
          data.errors && typeof data.errors === "object"
            ? Object.values(data.errors).flat().join(". ")
            : "";
        setFormFeedback({
          type: "error",
          message: errDetail || data.message || "Gagal menyimpan foto galeri.",
        });
      }
    } catch {
      setFormFeedback({
        type: "error",
        message: "Terjadi kesalahan server saat menyimpan galeri.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, itemTitle: string) => {
    if (!confirm(`Hapus foto "${itemTitle}"? Foto akan dihapus dari galeri website.`)) return;
    try {
      const res = await fetch(`/api/admin/galleries/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchGallery();
      } else {
        alert(data.message || "Gagal menghapus foto.");
      }
    } catch {
      alert("Terjadi kesalahan.");
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setIsSavingCat(true);
    setCatFeedback(null);
    try {
      const res = await fetch("/api/admin/galleries/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCatName.trim(),
          description: newCatDesc.trim() || null,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setCategories((prev) => [...prev, data.data]);
        setCategoryId(data.data.id);
        setIsCatModalOpen(false);
        setNewCatName("");
        setNewCatDesc("");
        setFormFeedback({
          type: "success",
          message: `Kategori "${data.data.name}" berhasil dibuat dan dipilih otomatis!`,
        });
      } else {
        setCatFeedback(data.message || "Gagal membuat kategori.");
      }
    } catch {
      setCatFeedback("Terjadi kesalahan koneksi saat membuat kategori.");
    } finally {
      setIsSavingCat(false);
    }
  };

  // Filter items berdasarkan search query
  const filteredItems = items.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      item.title.toLowerCase().includes(q) ||
      (item.description && item.description.toLowerCase().includes(q)) ||
      (item.category?.name && item.category.name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Galeri Dokumentasi Kegiatan</span>
            <Badge variant="outline" className="font-mono text-xs text-blue-700 bg-blue-50 border-blue-200">
              {filteredItems.length} Foto
            </Badge>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola dokumentasi foto kegiatan belajar, ekstrakurikuler, upacara, dan prestasi anak secara mudah dan interaktif.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => setIsCatModalOpen(true)}
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs font-semibold"
          >
            <FolderPlus className="h-4 w-4 text-slate-600" />
            <span>Kategori Baru</span>
          </Button>
          <Button onClick={handleOpenCreate} variant="primary" className="gap-2 shadow-sm">
            <PlusCircle className="h-4 w-4" />
            <span>Tambah Foto Baru</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 bg-white border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari foto berdasarkan judul atau kegiatan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-xs text-slate-400 hover:text-slate-600 font-bold p-1"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchGallery()}
              isLoading={isLoading}
              className="text-xs text-slate-600"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Segarkan</span>
            </Button>
          </div>
        </div>

        {/* Filter Categories Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCat("")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              selectedCat === ""
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
            }`}
          >
            <span>Semua Foto</span>
            <span
              className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                selectedCat === "" ? "bg-blue-700 text-white" : "bg-slate-200 text-slate-700"
              }`}
            >
              {items.length}
            </span>
          </button>
          {categories.map((c) => {
            const count = items.filter((i) => i.categoryId === c.id || i.category?.slug === c.slug).length;
            const isSelected = selectedCat === c.slug;

            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCat(c.slug)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                }`}
              >
                <span>{c.name}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                    isSelected ? "bg-blue-700 text-white" : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Photo Grid */}
      {isLoading ? (
        <div className="p-16 text-center text-slate-400 text-sm flex flex-col items-center justify-center gap-3">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
          <span>Memuat koleksi galeri foto...</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
            <ImageIcon className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 text-base">Belum Ada Foto dalam Kategori Ini</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Dokumentasi foto kegiatan sekolah belum ditambahkan. Klik tombol di bawah untuk menambahkan foto perdana.
            </p>
          </div>
          <Button onClick={handleOpenCreate} variant="primary" size="sm" className="gap-2">
            <PlusCircle className="h-4 w-4" />
            <span>Tambah Foto Sekarang</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className="p-3.5 overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all border border-slate-200/80 bg-white rounded-2xl"
            >
              <div>
                <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-slate-100 mb-3 border border-slate-100">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-xs text-[10px] text-white font-semibold flex items-center gap-1">
                    <Tag className="h-2.5 w-2.5 text-blue-300" />
                    <span>{item.category?.name || "Kegiatan"}</span>
                  </span>
                  {item.isFeatured && (
                    <span className="absolute top-2 right-2 p-1 rounded-md bg-amber-500/90 text-slate-950 font-bold" title="Tampil di Beranda">
                      <Star className="h-3 w-3 fill-slate-950" />
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-xs line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h4>
                  {item.description && (
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>{formatDateIndo(item.createdAt)}</span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenEdit(item)}
                    className="h-7 w-7 text-blue-600 hover:bg-blue-50"
                    title="Edit Foto"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </Button>
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
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Upload & Input Galeri */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "Edit Foto Galeri" : "Tambah Foto Galeri Baru"}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formFeedback && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 border ${
                formFeedback.type === "success"
                  ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                  : "bg-rose-50 border-rose-300 text-rose-900"
              }`}
            >
              {formFeedback.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="font-semibold leading-relaxed">{formFeedback.message}</div>
            </div>
          )}

          {/* Quick Preset Samples (Bila tambah baru) */}
          {!editingItem && (
            <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl space-y-1.5">
              <div className="text-[11px] font-bold text-blue-900 flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                <span>Pilihan Cepat Contoh Foto Kegiatan (1-Klik):</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {DEFAULT_SAMPLE_IMAGES.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePickSample(sample)}
                    className="px-2.5 py-1 rounded-lg bg-white border border-blue-200 hover:bg-blue-600 hover:text-white text-blue-900 text-[11px] font-medium transition-colors shadow-2xs"
                  >
                    {sample.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Input
            label="Judul Foto Kegiatan"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Upacara Peringatan Hari Pendidikan Nasional"
          />

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Kategori Kegiatan <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsCatModalOpen(true)}
                className="text-xs text-blue-600 hover:underline font-bold flex items-center gap-1"
              >
                <FolderPlus className="h-3 w-3" />
                <span>+ Buat Kategori Baru</span>
              </button>
            </div>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="flex h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 transition-colors focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
              required
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Image Input & Upload */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              File Foto / URL Gambar <span className="text-rose-500">*</span>
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                required
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Masukkan URL foto atau unggah berkas dari komputer..."
                className="flex-1 h-11 px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
              />
              <label className="cursor-pointer inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold shrink-0 transition-colors">
                <Upload className="h-4 w-4 text-blue-600" />
                <span>{isUploading ? "Mengunggah..." : "Pilih Berkas"}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
            </div>

            {/* Live Image Preview */}
            {imageUrl && (
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                <div className="w-16 h-12 rounded-lg bg-slate-200 overflow-hidden shrink-0 border border-slate-200">
                  <img
                    src={imageUrl}
                    alt="Pratinjau"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80";
                    }}
                  />
                </div>
                <div className="min-w-0 flex-1 text-xs">
                  <div className="font-semibold text-slate-800">Pratinjau Gambar Aktif</div>
                  <div className="text-slate-400 truncate text-[11px] font-mono">{imageUrl}</div>
                </div>
              </div>
            )}
          </div>

          <Textarea
            label="Keterangan / Caption Kegiatan"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Deskripsi singkat momen kegiatan yang ada di dalam foto..."
          />

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isFeatured"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
            />
            <label htmlFor="isFeatured" className="text-xs font-semibold text-slate-700 cursor-pointer">
              Sematkan foto ini di Beranda & Galeri Unggulan
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" isLoading={isSaving}>
              {editingItem ? "Perbarui Foto" : "Simpan Foto"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Tambah Kategori Baru */}
      <Modal
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        title="Tambah Kategori Galeri Baru"
        maxWidth="sm"
      >
        <form onSubmit={handleCreateCategory} className="space-y-4">
          {catFeedback && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              {catFeedback}
            </div>
          )}

          <Input
            label="Nama Kategori"
            required
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="Contoh: Pentas Seni & Budaya"
          />

          <Textarea
            label="Keterangan Kategori (Opsional)"
            rows={2}
            value={newCatDesc}
            onChange={(e) => setNewCatDesc(e.target.value)}
            placeholder="Dokumentasi pertunjukan kreativitas siswa..."
          />

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsCatModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSavingCat}>
              Simpan Kategori
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
