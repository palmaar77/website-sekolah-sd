"use client";

import * as React from "react";
import { PlusCircle, Edit2, Trash2, Bell, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { formatDateIndo } from "@/lib/utils";

interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  isImportant: boolean;
  isActive: boolean;
  startDate: string;
  endDate: string | null;
  createdAt: string;
}

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = React.useState<AnnouncementItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);

  // Form State
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [isImportant, setIsImportant] = React.useState(false);
  const [isActive, setIsActive] = React.useState(true);

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/announcements");
      const data = await res.json();
      if (data.success) {
        setAnnouncements(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setEditId(null);
    setTitle("");
    setContent("");
    setIsImportant(false);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: AnnouncementItem) => {
    setIsEditing(true);
    setEditId(item.id);
    setTitle(item.title);
    setContent(item.content);
    setIsImportant(item.isImportant);
    setIsActive(item.isActive);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = { title, content, isImportant, isActive };
      const url = isEditing
        ? `/api/admin/announcements/${editId}`
        : "/api/admin/announcements";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchAnnouncements();
      } else {
        alert(data.message || "Gagal menyimpan pengumuman");
      }
    } catch {
      alert("Terjadi kesalahan.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, itemTitle: string) => {
    if (!confirm(`Hapus pengumuman "${itemTitle}"?`)) return;
    try {
      const res = await fetch(`/api/admin/announcements/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchAnnouncements();
      } else {
        alert(data.message || "Gagal menghapus pengumuman");
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
            Pengumuman Sekolah
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Sampaikan maklumat resmi, jadwal libur, dan agenda penting sekolah kepada orang tua.
          </p>
        </div>
        <Button onClick={handleOpenCreate} variant="primary" className="gap-2">
          <PlusCircle className="h-4 w-4" />
          <span>Buat Pengumuman Baru</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Memuat pengumuman...</div>
        ) : announcements.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm bg-white rounded-2xl border border-slate-100">
            Belum ada pengumuman sekolah.
          </div>
        ) : (
          announcements.map((item) => (
            <Card key={item.id} className="p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-2 max-w-3xl">
                <div className="flex items-center gap-2 flex-wrap">
                  {item.isImportant && (
                    <Badge variant="danger" className="gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      <span>Sangat Penting</span>
                    </Badge>
                  )}
                  {item.isActive ? (
                    <Badge variant="success">Aktif Tampil</Badge>
                  ) : (
                    <Badge variant="outline">Nonaktif</Badge>
                  )}
                  <span className="text-xs text-slate-400">
                    Diterbitkan: {formatDateIndo(item.createdAt, true)}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {item.content}
                </p>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-start shrink-0">
                <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(item)}>
                  <Edit2 className="h-4 w-4 text-blue-600" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id, item.title)}>
                  <Trash2 className="h-4 w-4 text-rose-600" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? "Edit Pengumuman" : "Buat Pengumuman Baru"}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Judul Pengumuman"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Jadwal Libur Awal Ramadhan 1446 H"
          />

          <Textarea
            label="Isi Pengumuman"
            required
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Tuliskan isi pengumuman lengkap..."
          />

          <div className="space-y-2 pt-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isImportant"
                checked={isImportant}
                onChange={(e) => setIsImportant(e.target.checked)}
                className="h-4 w-4 text-rose-600 rounded border-slate-300"
              />
              <label htmlFor="isImportant" className="text-xs font-semibold text-rose-700">
                Tandai sebagai Pengumuman Sangat Penting (Highlight Merah di Beranda)
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded border-slate-300"
              />
              <label htmlFor="isActive" className="text-xs font-medium text-slate-700">
                Aktif (Tampilkan kepada publik)
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" isLoading={isSaving}>
              Simpan Pengumuman
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
