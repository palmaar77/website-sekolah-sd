"use client";

import * as React from "react";
import { PlusCircle, Calendar as CalendarIcon, Activity, Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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

  // Modal Calendar
  const [isCalModalOpen, setIsCalModalOpen] = React.useState(false);
  const [calSemester, setCalSemester] = React.useState("Ganjil");
  const [calYear, setCalYear] = React.useState("2025/2026");
  const [calDate, setCalDate] = React.useState("");
  const [calName, setCalName] = React.useState("");
  const [calDesc, setCalDesc] = React.useState("");
  const [calHoliday, setCalHoliday] = React.useState(false);

  // Modal Ekskul
  const [isEkskulModalOpen, setIsEkskulModalOpen] = React.useState(false);
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
    try {
      const res = await fetch("/api/admin/academic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "calendar",
          data: {
            semester: calSemester,
            academicYear: calYear,
            eventDate: calDate,
            eventName: calName,
            description: calDesc || null,
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
        fetchData();
      }
    } catch {
      alert("Terjadi kesalahan.");
    }
  };

  const handleAddEkskul = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/academic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "extracurricular",
          data: {
            name: ekskulName,
            coach: ekskulCoach || null,
            schedule: ekskulSchedule || null,
            category: ekskulCat || null,
            description: ekskulDesc,
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
        fetchData();
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
            Akademik, Kalender & Ekstrakurikuler
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola agenda penting kalender pendidikan dan kegiatan ekstrakurikuler siswa.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
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

      {activeTab === "calendar" ? (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setIsCalModalOpen(true)} variant="primary" className="gap-2">
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
                    <th className="py-3.5 px-6">Semester</th>
                    <th className="py-3.5 px-6">Nama Agenda / Kegiatan</th>
                    <th className="py-3.5 px-6">Keterangan</th>
                    <th className="py-3.5 px-6">Kategori</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {calendars.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-900 whitespace-nowrap">
                        {formatDateIndo(c.eventDate)}
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-600">
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Modal
            isOpen={isCalModalOpen}
            onClose={() => setIsCalModalOpen(false)}
            title="Tambah Agenda Kalender"
          >
            <form onSubmit={handleAddCalendar} className="space-y-4">
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
                  placeholder="2025/2026"
                />
              </div>

              <Input
                label="Tanggal Pelaksanaan"
                type="date"
                required
                value={calDate}
                onChange={(e) => setCalDate(e.target.value)}
              />

              <Input
                label="Nama Agenda Kegiatan"
                required
                value={calName}
                onChange={(e) => setCalName(e.target.value)}
                placeholder="Contoh: Asesmen Sumatif Akhir Semester"
              />

              <Textarea
                label="Deskripsi / Catatan"
                rows={3}
                value={calDesc}
                onChange={(e) => setCalDesc(e.target.value)}
                placeholder="Penjelasan kegiatan..."
              />

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="calHoliday"
                  checked={calHoliday}
                  onChange={(e) => setCalHoliday(e.target.checked)}
                  className="h-4 w-4 text-rose-600 rounded border-slate-300"
                />
                <label htmlFor="calHoliday" className="text-xs font-semibold text-rose-700">
                  Tandai sebagai Hari Libur Nasional / Libur Semester
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsCalModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" variant="primary">
                  Simpan Agenda
                </Button>
              </div>
            </form>
          </Modal>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setIsEkskulModalOpen(true)} variant="primary" className="gap-2">
              <PlusCircle className="h-4 w-4" />
              <span>Tambah Ekstrakurikuler</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {ekskuls.map((e) => (
              <Card key={e.id} className="p-5 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                    {e.category || "Ekstrakurikuler"}
                  </span>
                  <h4 className="font-bold text-slate-900 text-base mt-2">{e.name}</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{e.description}</p>
                  <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                    <div>Pembina: <strong>{e.coach || "-"}</strong></div>
                    <div>Jadwal: <strong>{e.schedule || "-"}</strong></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Modal
            isOpen={isEkskulModalOpen}
            onClose={() => setIsEkskulModalOpen(false)}
            title="Tambah Ekstrakurikuler Baru"
          >
            <form onSubmit={handleAddEkskul} className="space-y-4">
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
                <Button type="button" variant="outline" onClick={() => setIsEkskulModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" variant="primary">
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
