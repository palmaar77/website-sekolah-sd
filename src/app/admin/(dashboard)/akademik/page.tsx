"use client";

import * as React from "react";
import {
  PlusCircle,
  Calendar as CalendarIcon,
  Trash2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { formatDateIndo } from "@/lib/utils";

interface CalendarItem {
  id: string;
  semester: string;
  academicYear: string;
  eventDate: string;
  endDate: string | null;
  eventName: string;
  description: string | null;
  isHoliday: boolean;
}

interface EkskulItem {
  id: string;
  name: string;
  description: string;
  coach: string | null;
  schedule: string | null;
  category: string | null;
}

export default function AdminAcademicPage() {
  const [activeTab, setActiveTab] = React.useState<"calendar" | "ekskul">("calendar");
  const [calendars, setCalendars] = React.useState<CalendarItem[]>([]);
  const [ekskuls, setEkskuls] = React.useState<EkskulItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [successMsg, setSuccessMsg] = React.useState("");

  // Modal Calendar
  const [isCalModalOpen, setIsCalModalOpen] = React.useState(false);
  const [isSavingCal, setIsSavingCal] = React.useState(false);
  const [calError, setCalError] = React.useState("");
  const [calSemester, setCalSemester] = React.useState("Ganjil");
  const [calYear, setCalYear] = React.useState("2025/2026");
  const [calDate, setCalDate] = React.useState("");
  const [calEndDate, setCalEndDate] = React.useState("");
  const [calName, setCalName] = React.useState("");
  const [calDesc, setCalDesc] = React.useState("");
  const [calHoliday, setCalHoliday] = React.useState(false);

  // Modal Ekskul
  const [isEkskulModalOpen, setIsEkskulModalOpen] = React.useState(false);
  const [isSavingEkskul, setIsSavingEkskul] = React.useState(false);
  const [ekskulError, setEkskulError] = React.useState("");
  const [ekskulName, setEkskulName] = React.useState("");
  const [ekskulCoach, setEkskulCoach] = React.useState("");
  const [ekskulSchedule, setEkskulSchedule] = React.useState("");
  const [ekskulCat, setEkskulCat] = React.useState("Kepanduan");
  const [ekskulDesc, setEkskulDesc] = React.useState("");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/academic");
      const data = await res.json();
      if (data.success) {
        setCalendars(data.calendars || []);
        setEkskuls(data.extracurriculars || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const handleAddCalendar = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingCal(true);
    setCalError("");

    try {
      const res = await fetch("/api/admin/academic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "calendar",
          data: {
            semester: calSemester,
            academicYear: calYear.trim() || "2025/2026",
            eventDate: calDate,
            endDate: calEndDate || null,
            eventName: calName.trim(),
            description: calDesc.trim() || null,
            isHoliday: calHoliday,
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsCalModalOpen(false);
        setCalName("");
        setCalDesc("");
        setCalDate("");
        setCalEndDate("");
        setCalHoliday(false);
        setSuccessMsg("Agenda kalender akademik berhasil ditambahkan dan diperbarui di portal!");
        setTimeout(() => setSuccessMsg(""), 4000);
        fetchData();
      } else {
        setCalError(data.message || "Gagal menyimpan agenda kalender.");
      }
    } catch {
      setCalError("Terjadi kesalahan jaringan saat menyimpan agenda.");
    } finally {
      setIsSavingCal(false);
    }
  };

  const handleDeleteCalendar = async (id: string, name: string) => {
    if (!confirm(`Hapus agenda kalender "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/academic?id=${id}&type=calendar`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg("Agenda kalender berhasil dihapus.");
        setTimeout(() => setSuccessMsg(""), 4000);
        fetchData();
      } else {
        alert(data.message || "Gagal menghapus agenda kalender.");
      }
    } catch {
      alert("Terjadi kesalahan jaringan.");
    }
  };

  const handleAddEkskul = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingEkskul(true);
    setEkskulError("");

    try {
      const res = await fetch("/api/admin/academic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "extracurricular",
          data: {
            name: ekskulName.trim(),
            coach: ekskulCoach.trim() || null,
            schedule: ekskulSchedule.trim() || null,
            category: ekskulCat || null,
            description: ekskulDesc.trim(),
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsEkskulModalOpen(false);
        setEkskulName("");
        setEkskulCoach("");
        setEkskulSchedule("");
        setEkskulDesc("");
        setSuccessMsg("Ekstrakurikuler berhasil ditambahkan.");
        setTimeout(() => setSuccessMsg(""), 4000);
        fetchData();
      } else {
        setEkskulError(data.message || "Gagal menyimpan ekstrakurikuler.");
      }
    } catch {
      setEkskulError("Terjadi kesalahan jaringan.");
    } finally {
      setIsSavingEkskul(false);
    }
  };

  const handleDeleteEkskul = async (id: string, name: string) => {
    if (!confirm(`Hapus ekstrakurikuler "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/academic?id=${id}&type=extracurricular`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg("Ekstrakurikuler berhasil dihapus.");
        setTimeout(() => setSuccessMsg(""), 4000);
        fetchData();
      } else {
        alert(data.message || "Gagal menghapus ekstrakurikuler.");
      }
    } catch {
      alert("Terjadi kesalahan jaringan.");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Akademik, Kalender & Ekstrakurikuler
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola agenda penting kalender pendidikan dan kegiatan ekstrakurikuler siswa yang tampil di website.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("calendar")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "calendar"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Kalender Pendidikan ({calendars.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("ekskul")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "ekskul"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Ekstrakurikuler Siswa ({ekskuls.length})
        </button>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-slate-400 text-sm">Memuat data akademik...</div>
      ) : activeTab === "calendar" ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-500">
              Agenda yang disimpan di sini akan otomatis tampil di Beranda Portal Utama dan halaman Akademik.
            </p>
            <Button
              type="button"
              onClick={() => {
                setCalError("");
                setIsCalModalOpen(true);
              }}
              variant="primary"
              className="gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Tambah Agenda Kalender</span>
            </Button>
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="py-3.5 px-6">Tanggal Kegiatan</th>
                    <th className="py-3.5 px-6">Semester / TA</th>
                    <th className="py-3.5 px-6">Nama Agenda / Kegiatan</th>
                    <th className="py-3.5 px-6">Keterangan</th>
                    <th className="py-3.5 px-6">Kategori</th>
                    <th className="py-3.5 px-6 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {calendars.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                        Belum ada agenda kalender pendidikan. Klik tombol &quot;Tambah Agenda Kalender&quot; untuk menambahkan.
                      </td>
                    </tr>
                  ) : (
                    calendars.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-6 font-bold text-slate-900 whitespace-nowrap">
                          {formatDateIndo(c.eventDate)}
                          {c.endDate && ` - ${formatDateIndo(c.endDate)}`}
                        </td>
                        <td className="py-4 px-6 text-xs text-slate-600 whitespace-nowrap">
                          {c.semester} ({c.academicYear})
                        </td>
                        <td className="py-4 px-6 font-semibold text-slate-900">
                          {c.eventName}
                        </td>
                        <td className="py-4 px-6 text-xs text-slate-500 max-w-xs truncate">
                          {c.description || "-"}
                        </td>
                        <td className="py-4 px-6">
                          {c.isHoliday ? (
                            <Badge variant="danger">Libur Resmi</Badge>
                          ) : (
                            <Badge variant="info">Kegiatan Sekolah</Badge>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteCalendar(c.id, c.eventName)}
                            className="text-rose-600 hover:bg-rose-50"
                            title="Hapus Agenda"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          <Modal
            isOpen={isCalModalOpen}
            onClose={() => setIsCalModalOpen(false)}
            title="Tambah Agenda Kalender Akademik"
          >
            <form onSubmit={handleAddCalendar} className="space-y-4">
              {calError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                  <span>{calError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Semester"
                  value={calSemester}
                  onChange={(e) => setCalSemester(e.target.value)}
                  options={[
                    { value: "Ganjil", label: "Semester Ganjil" },
                    { value: "Genap", label: "Semester Genap" },
                  ]}
                />
                <Input
                  label="Tahun Ajaran"
                  required
                  value={calYear}
                  onChange={(e) => setCalYear(e.target.value)}
                  placeholder="Contoh: 2025/2026"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Tanggal Mulai"
                  type="date"
                  required
                  value={calDate}
                  onChange={(e) => setCalDate(e.target.value)}
                />
                <Input
                  label="Tanggal Selesai (Opsional)"
                  type="date"
                  value={calEndDate}
                  onChange={(e) => setCalEndDate(e.target.value)}
                />
              </div>

              <Input
                label="Nama Agenda Kegiatan"
                required
                value={calName}
                onChange={(e) => setCalName(e.target.value)}
                placeholder="Contoh: Asesmen Sumatif Akhir Semester"
              />

              <Textarea
                label="Deskripsi / Catatan (Opsional)"
                rows={3}
                value={calDesc}
                onChange={(e) => setCalDesc(e.target.value)}
                placeholder="Keterangan singkat kegiatan..."
              />

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="calHoliday"
                  checked={calHoliday}
                  onChange={(e) => setCalHoliday(e.target.checked)}
                  className="h-4 w-4 text-rose-600 rounded border-slate-300"
                />
                <label htmlFor="calHoliday" className="text-xs font-semibold text-rose-700 cursor-pointer">
                  Tandai sebagai Hari Libur Nasional / Libur Semester
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCalModalOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit" variant="primary" isLoading={isSavingCal}>
                  Simpan Agenda
                </Button>
              </div>
            </form>
          </Modal>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button
              type="button"
              onClick={() => {
                setEkskulError("");
                setIsEkskulModalOpen(true);
              }}
              variant="primary"
              className="gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Tambah Ekstrakurikuler</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {ekskuls.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-100">
                Belum ada kegiatan ekstrakurikuler yang ditambahkan.
              </div>
            ) : (
              ekskuls.map((e) => (
                <Card key={e.id} className="p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                        {e.category || "Ekstrakurikuler"}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteEkskul(e.id, e.name)}
                        className="text-rose-600 hover:bg-rose-50 h-7 w-7"
                        title="Hapus Ekstrakurikuler"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <h4 className="font-bold text-slate-900 text-base mt-2">{e.name}</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{e.description}</p>
                    <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                      <div>
                        Pembina: <strong>{e.coach || "-"}</strong>
                      </div>
                      <div>
                        Jadwal: <strong>{e.schedule || "-"}</strong>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          <Modal
            isOpen={isEkskulModalOpen}
            onClose={() => setIsEkskulModalOpen(false)}
            title="Tambah Ekstrakurikuler Baru"
          >
            <form onSubmit={handleAddEkskul} className="space-y-4">
              {ekskulError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                  <span>{ekskulError}</span>
                </div>
              )}

              <Input
                label="Nama Ekstrakurikuler"
                required
                value={ekskulName}
                onChange={(e) => setEkskulName(e.target.value)}
                placeholder="Contoh: Seni Musik Angklung"
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Pelatih / Pembina"
                  value={ekskulCoach}
                  onChange={(e) => setEkskulCoach(e.target.value)}
                  placeholder="Nama pembina..."
                />
                <Input
                  label="Jadwal Latihan"
                  value={ekskulSchedule}
                  onChange={(e) => setEkskulSchedule(e.target.value)}
                  placeholder="Sabtu, 08.00 - 10.00 WIB"
                />
              </div>
              <Select
                label="Kategori"
                value={ekskulCat}
                onChange={(e) => setEkskulCat(e.target.value)}
                options={[
                  { value: "Kepanduan", label: "Kepanduan / Pramuka" },
                  { value: "Olahraga", label: "Olahraga & Ketangkasan" },
                  { value: "Seni & Budaya", label: "Seni & Budaya" },
                  { value: "Sains & Teknologi", label: "Sains & Teknologi" },
                  { value: "Keagamaan", label: "Keagamaan" },
                ]}
              />
              <Textarea
                label="Deskripsi Ekstrakurikuler"
                required
                rows={3}
                value={ekskulDesc}
                onChange={(e) => setEkskulDesc(e.target.value)}
                placeholder="Manfaat dan kegiatan ekskul..."
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEkskulModalOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit" variant="primary" isLoading={isSavingEkskul}>
                  Simpan Ekstrakurikuler
                </Button>
              </div>
            </form>
          </Modal>
        </div>
      )}
    </div>
  );
}
