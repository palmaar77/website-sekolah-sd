"use client";

import * as React from "react";
import {
  PlusCircle,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  Eye,
  CheckCircle,
  AlertCircle,
  FileText,
  Upload,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { formatDateIndo } from "@/lib/utils";

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  category: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  isFeatured: boolean;
  publishedAt: string;
  createdAt: string;
  author?: { name: string };
}

export default function AdminNewsPage() {
  const [news, setNews] = React.useState<NewsItem[]>([]);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);

  // Form State
  const [title, setTitle] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [category, setCategory] = React.useState("Kegiatan");
  const [excerpt, setExcerpt] = React.useState("");
  const [content, setContent] = React.useState("");
  const [coverImage, setCoverImage] = React.useState("");
  const [status, setStatus] = React.useState<"DRAFT" | "PUBLISHED">("PUBLISHED");
  const [isFeatured, setIsFeatured] = React.useState(false);

  const fetchNews = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter) params.append("status", statusFilter);
      const res = await fetch(`/api/admin/news?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setNews(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchNews();
  }, [search, statusFilter]);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setEditId(null);
    setTitle("");
    setSlug("");
    setCategory("Kegiatan");
    setExcerpt("");
    setContent("");
    setCoverImage("");
    setStatus("PUBLISHED");
    setIsFeatured(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: NewsItem) => {
    setIsEditing(true);
    setEditId(item.id);
    setTitle(item.title);
    setSlug(item.slug);
    setCategory(item.category);
    setExcerpt(item.excerpt);
    setContent(item.content);
    setCoverImage(item.coverImage || "");
    setStatus(item.status === "DRAFT" ? "DRAFT" : "PUBLISHED");
    setIsFeatured(item.isFeatured);
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setCoverImage(data.url);
      } else {
        alert(data.message || "Gagal upload gambar");
      }
    } catch {
      alert("Terjadi kesalahan saat upload gambar");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        title,
        slug: slug || undefined,
        category,
        excerpt,
        content,
        coverImage: coverImage || null,
        status,
        isFeatured,
      };

      const url = isEditing ? `/api/admin/news/${editId}` : "/api/admin/news";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchNews();
      } else {
        alert(data.message || "Gagal menyimpan berita");
      }
    } catch {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, itemTitle: string) => {
    if (!confirm(`Hapus berita "${itemTitle}"?`)) return;
    try {
      const res = await fetch(`/api/admin/news/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchNews();
      } else {
        alert(data.message || "Gagal menghapus berita");
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
            Manajemen Berita & Artikel
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola publikasi artikel kegiatan, prestasi, dan kabar sekolah.
          </p>
        </div>
        <Button onClick={handleOpenCreate} variant="primary" className="gap-2">
          <PlusCircle className="h-4 w-4" />
          <span>Tulis Berita Baru</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari judul berita..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none"
            >
              <option value="">Semua Status</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>
        </div>
      </Card>

      {/* News Table */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Memuat data berita...</div>
        ) : news.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            Tidak ada berita ditemukan. Silakan tambahkan berita pertama.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-6">Judul Berita</th>
                  <th className="py-3.5 px-6">Kategori</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Tanggal</th>
                  <th className="py-3.5 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {news.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-medium text-slate-900 max-w-md">
                      <div className="font-bold text-slate-900 line-clamp-1">{item.title}</div>
                      <div className="text-xs text-slate-400 line-clamp-1 mt-0.5">{item.excerpt}</div>
                    </td>
                    <td className="py-4 px-6 text-slate-600 text-xs font-semibold">
                      <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {item.status === "PUBLISHED" ? (
                        <Badge variant="success">Published</Badge>
                      ) : (
                        <Badge variant="warning">Draft</Badge>
                      )}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-500 whitespace-nowrap">
                      {formatDateIndo(item.createdAt)}
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(item)}
                          title="Edit Berita"
                        >
                          <Edit2 className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item.id, item.title)}
                          title="Hapus Berita"
                        >
                          <Trash2 className="h-4 w-4 text-rose-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal Form Tambah / Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? "Edit Berita" : "Tulis Berita Baru"}
        description="Lengkapi informasi berita untuk dipublikasikan ke website."
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Judul Berita"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Gelar Karya P5 Siswa Kelas 1-6"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Kategori"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={[
                { value: "Kegiatan", label: "Kegiatan Sekolah" },
                { value: "Prestasi", label: "Prestasi & Juara" },
                { value: "Kurikulum", label: "Kurikulum Merdeka" },
                { value: "Kesehatan", label: "Kesehatan & Lingkungan" },
                { value: "Umum", label: "Informasi Umum" },
              ]}
            />
            <Select
              label="Status Publikasi"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              options={[
                { value: "PUBLISHED", label: "Published (Tampil di Website)" },
                { value: "DRAFT", label: "Draft (Hanya Dilihat Admin)" },
              ]}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Gambar Sampul (Cover Image)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="URL Gambar atau pilih file..."
                className="flex-1 h-11 px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
              />
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold">
                <Upload className="h-4 w-4" />
                <span>{isUploading ? "Uploading..." : "Pilih File"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <Textarea
            label="Ringkasan Singkat (Excerpt)"
            required
            rows={2}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Tulis ringkasan 1-2 kalimat untuk kartu berita..."
          />

          <Textarea
            label="Isi Konten Lengkap"
            required
            rows={8}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Tuliskan isi berita secara lengkap di sini..."
          />

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isFeatured"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
            <label htmlFor="isFeatured" className="text-xs font-medium text-slate-700">
              Tampilkan sebagai Berita Unggulan (Featured) di Beranda
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" variant="primary" isLoading={isSaving}>
              Simpan Berita
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
