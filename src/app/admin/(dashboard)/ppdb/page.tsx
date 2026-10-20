"use client";

import * as React from "react";
import {
  Search,
  Download,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  UserCheck,
  FileSpreadsheet,
  Trash2,
  FileText,
  User,
  Phone,
  Home,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatDateIndo } from "@/lib/utils";

interface PPDBApplicant {
  id: string;
  registrationNumber: string;
  fullName: string;
  nik: string;
  birthPlace: string;
  birthDate: string;
  gender: "LAKI_LAKI" | "PEREMPUAN";
  religion: string | null;
  address: string;
  rt?: string | null;
  rw?: string | null;
  rtRw?: string | null;
  village?: string | null;
  district?: string | null;
  parentName: string;
  parentPhone: string;
  parentJob: string | null;
  previousSchool: string | null;
  path: "ZONASI" | "AFIRMASI" | "PRESTASI" | "PERPINDAHAN_TUGAS";
  status: "PENDING" | "VERIFYING" | "ACCEPTED" | "REJECTED";
  verificationNotes: string | null;
  verifiedBy: string | null;
  verifiedAt: string | null;
  createdAt: string;
  documents?: { id: string; documentType: string; fileUrl: string; fileName: string }[];
}

export default function AdminPPDBPage() {
  const [applicants, setApplicants] = React.useState<PPDBApplicant[]>([]);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const [pathFilter, setPathFilter] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalCount, setTotalCount] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);

  // Detail & Verification Modal
  const [selectedApplicant, setSelectedApplicant] = React.useState<PPDBApplicant | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = React.useState(false);
  const [newStatus, setNewStatus] = React.useState<"PENDING" | "VERIFYING" | "ACCEPTED" | "REJECTED">("PENDING");
  const [verificationNotes, setVerificationNotes] = React.useState("");
  const [isUpdating, setIsUpdating] = React.useState(false);

  const fetchApplicants = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter) params.append("status", statusFilter);
      if (pathFilter) params.append("path", pathFilter);
      params.append("page", String(page));
      params.append("limit", "10");

      const res = await fetch(`/api/admin/ppdb?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setApplicants(data.data);
        setTotalPages(data.pagination.totalPages || 1);
        setTotalCount(data.pagination.total || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchApplicants();
  }, [search, statusFilter, pathFilter, page]);

  const handleOpenDetail = (app: PPDBApplicant) => {
    setSelectedApplicant(app);
    setNewStatus(app.status);
    setVerificationNotes(app.verificationNotes || "");
    setIsDetailModalOpen(true);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApplicant) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/ppdb/${selectedApplicant.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          verificationNotes: verificationNotes || null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsDetailModalOpen(false);
        fetchApplicants();
      } else {
        alert(data.message || "Gagal memperbarui status pendaftar.");
      }
    } catch {
      alert("Terjadi kesalahan.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus pendaftar ${name}? Data pendaftaran akan dihapus permanen.`)) return;
    try {
      const res = await fetch(`/api/admin/ppdb/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchApplicants();
      } else {
        alert(data.message || "Gagal menghapus.");
      }
    } catch {
      alert("Terjadi kesalahan.");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return <Badge variant="success">Diterima</Badge>;
      case "VERIFYING":
        return <Badge variant="warning">Sedang Diverifikasi</Badge>;
      case "REJECTED":
        return <Badge variant="danger">Tidak Diterima</Badge>;
      default:
        return <Badge variant="info">Menunggu Verifikasi</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Verifikasi & Data Pendaftar PPDB
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Total {totalCount} calon siswa terdaftar secara daring.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={`/api/admin/ppdb?format=csv${statusFilter ? `&status=${statusFilter}` : ""}${pathFilter ? `&path=${pathFilter}` : ""}`}
            download
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Ekspor CSV (Excel)</span>
          </a>
        </div>
      </div>

      {/* Filter and Search */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="sm:col-span-2 relative">
            <Search className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nomor registrasi, nama calon siswa, NIK, atau wali..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none"
            >
              <option value="">Semua Status Seleksi</option>
              <option value="PENDING">Menunggu Verifikasi</option>
              <option value="VERIFYING">Sedang Diverifikasi</option>
              <option value="ACCEPTED">Diterima</option>
              <option value="REJECTED">Tidak Diterima</option>
            </select>
          </div>
          <div>
            <select
              value={pathFilter}
              onChange={(e) => setPathFilter(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none"
            >
              <option value="">Semua Jalur Masuk</option>
              <option value="ZONASI">Zonasi</option>
              <option value="AFIRMASI">Afirmasi</option>
              <option value="PRESTASI">Prestasi</option>
              <option value="PERPINDAHAN_TUGAS">Perpindahan Orang Tua</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Memuat data pendaftar PPDB...</div>
        ) : applicants.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            Tidak ada pendaftar yang cocok dengan filter pencarian.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-6">Nomor Registrasi</th>
                  <th className="py-3.5 px-6">Nama Calon Siswa</th>
                  <th className="py-3.5 px-6">Jalur</th>
                  <th className="py-3.5 px-6">Orang Tua / Wali</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Tanggal Daftar</th>
                  <th className="py-3.5 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applicants.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-mono text-xs font-bold text-blue-700 whitespace-nowrap">
                      {app.registrationNumber}
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-900">
                      <div className="font-bold">{app.fullName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {app.gender === "LAKI_LAKI" ? "Laki-laki" : "Perempuan"} • NIK: {app.nik}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-600 font-semibold">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                        {app.path}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-600">
                      <div className="font-medium text-slate-900">{app.parentName}</div>
                      <div className="text-slate-400 font-mono">{app.parentPhone}</div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">{getStatusBadge(app.status)}</td>
                    <td className="py-4 px-6 text-xs text-slate-500 whitespace-nowrap">
                      {formatDateIndo(app.createdAt)}
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleOpenDetail(app)}
                          className="text-xs"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Verifikasi</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(app.id, app.fullName)}
                          className="text-rose-600 hover:bg-rose-50"
                          title="Hapus Data Pendaftar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Halaman {page} dari {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Sebelumnya
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                Selanjutnya
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Detail & Verifikasi Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Detail & Verifikasi Berkas Calon Siswa"
        maxWidth="2xl"
      >
        {selectedApplicant && (
          <div className="space-y-6">
            {/* Header info */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Nomor Registrasi PPDB
                </span>
                <div className="font-mono text-lg font-black text-blue-700">
                  {selectedApplicant.registrationNumber}
                </div>
              </div>
              <div className="text-right sm:text-left">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  Status Saat Ini
                </span>
                <div className="mt-0.5">{getStatusBadge(selectedApplicant.status)}</div>
              </div>
            </div>

            {/* Biodata Calon Siswa */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <User className="h-4 w-4 text-blue-600" />
                <span>Biodata Calon Siswa</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white p-4 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block">Nama Lengkap:</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedApplicant.fullName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">NIK Calon Siswa:</span>
                  <span className="font-mono font-semibold text-slate-900">{selectedApplicant.nik}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Tempat, Tanggal Lahir:</span>
                  <span className="font-semibold text-slate-900">
                    {selectedApplicant.birthPlace}, {formatDateIndo(selectedApplicant.birthDate)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Jenis Kelamin:</span>
                  <span className="font-semibold text-slate-900">
                    {selectedApplicant.gender === "LAKI_LAKI" ? "Laki-laki" : "Perempuan"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Asal TK / PAUD:</span>
                  <span className="font-semibold text-slate-900">
                    {selectedApplicant.previousSchool || "-"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Jalur Masuk:</span>
                  <span className="font-bold text-blue-700">{selectedApplicant.path}</span>
                </div>
              </div>
            </div>

            {/* Data Orang Tua / Wali */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Phone className="h-4 w-4 text-amber-600" />
                <span>Data Orang Tua & Domisili</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white p-4 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block">Nama Orang Tua / Wali:</span>
                  <span className="font-bold text-slate-900">{selectedApplicant.parentName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Nomor Telepon / WhatsApp:</span>
                  <a
                    href={`https://wa.me/${selectedApplicant.parentPhone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono font-bold text-blue-600 hover:underline"
                  >
                    {selectedApplicant.parentPhone} (Hubungi via WA)
                  </a>
                </div>
                <div>
                  <span className="text-slate-400 block">Pekerjaan:</span>
                  <span className="font-semibold text-slate-900">
                    {selectedApplicant.parentJob || "-"}
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-400 block">Alamat Tempat Tinggal:</span>
                  <span className="font-semibold text-slate-900 leading-relaxed">
                    {selectedApplicant.address}
                    {selectedApplicant.rt || selectedApplicant.rw
                      ? ` (RT ${selectedApplicant.rt || "-"} / RW ${selectedApplicant.rw || "-"})`
                      : selectedApplicant.rtRw
                      ? ` (RT/RW: ${selectedApplicant.rtRw})`
                      : ""}
                    {selectedApplicant.village ? `, Kel. ${selectedApplicant.village}` : ""}
                    {selectedApplicant.district ? `, Kec. ${selectedApplicant.district}` : ""}
                  </span>
                </div>
              </div>
            </div>

            {/* Form Ubah Status Verifikasi */}
            <form onSubmit={handleUpdateStatus} className="pt-4 border-t border-slate-200 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Tindakan Verifikasi Panitia PPDB
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Status Hasil Seleksi"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  options={[
                    { value: "PENDING", label: "Menunggu Verifikasi" },
                    { value: "VERIFYING", label: "Sedang Diverifikasi" },
                    { value: "ACCEPTED", label: "Diterima (Lolos Seleksi)" },
                    { value: "REJECTED", label: "Tidak Diterima" },
                  ]}
                />
              </div>

              <Textarea
                label="Catatan Verifikasi Panitia (Dapat dilihat oleh orang tua)"
                rows={3}
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                placeholder="Contoh: Berkas Akta Kelahiran dan Kartu Keluarga lengkap dan sesuai domisili prioritas..."
              />

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDetailModalOpen(false)}
                >
                  Tutup
                </Button>
                <Button type="submit" variant="primary" isLoading={isUpdating}>
                  Simpan Status Verifikasi
                </Button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
}
