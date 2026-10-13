"use client";

import * as React from "react";
import { PlusCircle, Edit2, Trash2, Users, Upload, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";

interface TeacherItem {
  id: string;
  name: string;
  nip: string | null;
  role: string;
  subject: string | null;
  education: string | null;
  photo: string | null;
  order: number;
  isActive: boolean;
}

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = React.useState<TeacherItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);

  // Form State
  const [name, setName] = React.useState("");
  const [nip, setNip] = React.useState("");
  const [role, setRole] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [education, setEducation] = React.useState("");
  const [photo, setPhoto] = React.useState("");
  const [order, setOrder] = React.useState(0);

  const fetchTeachers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/teachers");
      const data = await res.json();
      if (data.success) {
        setTeachers(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchTeachers();
  }, []);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setEditId(null);
    setName("");
    setNip("");
    setRole("");
    setSubject("");
    setEducation("");
    setPhoto("");
    setOrder(teachers.length + 1);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: TeacherItem) => {
    setIsEditing(true);
    setEditId(t.id);
    setName(t.name);
    setNip(t.nip || "");
    setRole(t.role);
    setSubject(t.subject || "");
    setEducation(t.education || "");
    setPhoto(t.photo || "");
    setOrder(t.order);
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
        setPhoto(data.url);
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
    setIsSaving(true);
    try {
      const payload = {
        name,
        nip: nip || null,
        role,
        subject: subject || null,
        education: education || null,
        photo: photo || null,
        order: Number(order),
        isActive: true,
      };

      const url = isEditing ? `/api/admin/teachers/${editId}` : "/api/admin/teachers";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchTeachers();
      } else {
        alert(data.message || "Gagal menyimpan data guru");
      }
    } catch {
      alert("Terjadi kesalahan.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, teacherName: string) => {
    if (!confirm(`Hapus guru ${teacherName}?`)) return;
    try {
      const res = await fetch(`/api/admin/teachers/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchTeachers();
      } else {
        alert(data.message || "Gagal menghapus");
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
            Guru & Tenaga Kependidikan
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola profil pendidik, jabatan, mata pelajaran, dan foto guru sekolah.
          </p>
        </div>
        <Button onClick={handleOpenCreate} variant="primary" className="gap-2">
          <PlusCircle className="h-4 w-4" />
          <span>Tambah Guru / Staf</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading ? (
          <div className="col-span-full p-12 text-center text-slate-400 text-sm">
            Memuat data guru...
          </div>
        ) : teachers.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-400 text-sm bg-white rounded-2xl border border-slate-100">
            Belum ada data guru.
          </div>
        ) : (
          teachers.map((t) => (
            <Card key={t.id} className="p-5 flex flex-col justify-between">
              <div className="flex items-start gap-4">
                <img
                  src={
                    t.photo ||
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
                  }
                  alt={t.name}
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shrink-0 bg-slate-100"
                />
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900 text-sm truncate">{t.name}</h3>
                  <p className="text-xs font-semibold text-blue-600 mt-0.5">{t.role}</p>
                  <p className="text-[11px] text-slate-500 mt-1">{t.subject || "-"}</p>
                  {t.nip && (
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">NIP: {t.nip}</p>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">Urutan: {t.order}</span>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(t)}>
                    <Edit2 className="h-4 w-4 text-blue-600" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id, t.name)}>
                    <Trash2 className="h-4 w-4 text-rose-600" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? "Edit Profil Guru" : "Tambah Guru / Staf Baru"}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nama Lengkap & Gelar"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Dra. Hj. Siti Rahmawati, M.Pd."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="NIP / NUPTK"
              value={nip}
              onChange={(e) => setNip(e.target.value)}
              placeholder="19750512 200003 2 001"
            />
            <Input
              label="Jabatan / Tugas"
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Contoh: Guru Kelas 1A"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Bidang / Mapel"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Tematik Fase A"
            />
            <Input
              label="Pendidikan Terakhir"
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              placeholder="S1 PGSD"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Foto Pendidik
            </label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={photo}
                onChange={(e) => setPhoto(e.target.value)}
                placeholder="URL Foto atau upload file..."
                className="flex-1 h-11 px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
              />
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold">
                <Upload className="h-4 w-4" />
                <span>{isUploading ? "Uploading..." : "Pilih File"}</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>

          <Input
            label="Nomor Urutan Tampil"
            type="number"
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
            helperText="Angka lebih kecil tampil lebih awal"
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" isLoading={isSaving}>
              Simpan Data Guru
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
