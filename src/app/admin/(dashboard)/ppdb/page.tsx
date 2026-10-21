"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
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
  Award,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Calendar,
  Check,
} from "lucide-react";
import { Card } from "@/components/ui/card";
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

function AdminPPDBContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const initialStatus = searchParams.get("status") || "";
  const initialPath = searchParams.get("path") || "";
  const autoOpenParam = searchParams.get("open") === "true";

  const [applicants, setApplicants] = React.useState<PPDBApplicant[]>([]);
  const [search, setSearch] = React.useState(initialSearch);
  const [statusFilter, setStatusFilter] = React.useState(initialStatus);
  const [pathFilter, setPathFilter] = React.useState(initialPath);
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
  const [modalFeedback, setModalFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null);
  const [hasAutoOpened, setHasAutoOpened] = React.useState(false);

  // Sinkronkan state ke URL query params
  const syncUrlParams = React.useCallback(
    (newQ: string, newSt: string, newPt: string) => {
      if (typeof window === "undefined") return;
      const params = new URLSearchParams();
      if (newQ.trim()) params.set("search", newQ.trim());
      if (newSt) params.set("status", newSt);
      if (newPt) params.set("path", newPt);

      const qs = params.toString();
      const newUrl = `${window.location.pathname}${qs ? `?${qs}` : ""}`;
      window.history.replaceState(null, "", newUrl);
    },
    []
  );

  const fetchApplicants = React.useCallback(async () => {
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
        const fetchedList: PPDBApplicant[] = data.data || [];
        setApplicants(fetchedList);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalCount(data.pagination?.total || 0);

        // Jika URL memiliki parameter search spesifik (misal PPDB-2025-B2002),
        // otomatis buka modal verifikasi jika diminta atau pendaftar tunggal ditemukan
        if (!hasAutoOpened && initialSearch) {
          const exactMatch = fetchedList.find(
            (a) => a.registrationNumber.toUpperCase() === initialSearch.trim().toUpperCase()
          );
          if (exactMatch && (autoOpenParam || fetchedList.length === 1)) {
            setSelectedApplicant(exactMatch);
            setNewStatus(exactMatch.status);
            setVerificationNotes(exactMatch.verificationNotes || "");
            setIsDetailModalOpen(true);
            setHasAutoOpened(true);
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, pathFilter, page, initialSearch, autoOpenParam, hasAutoOpened]);

  React.useEffect(() => {
    fetchApplicants();
  }, [fetchApplicants]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
    syncUrlParams(value, statusFilter, pathFilter);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
    syncUrlParams(search, value, pathFilter);
  };

  const handlePathFilterChange = (value: string) => {
    setPathFilter(value);
    setPage(1);
    syncUrlParams(search, statusFilter, value);
  };

  const handleOpenDetail = (app: PPDBApplicant) => {
    setSelectedApplicant(app);
    setNewStatus(app.status);
    setVerificationNotes(app.verificationNotes || "");
    setModalFeedback(null);
    setIsDetailModalOpen(true);
  };

  // Quick Template Note helper
  const handleApplyTemplate = (
    targetStatus: "PENDING" | "VERIFYING" | "ACCEPTED" | "REJECTED",
    templateNote: string
  ) => {
    setNewStatus(targetStatus);
    setVerificationNotes(templateNote);
    setModalFeedback(null);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApplicant) return;

    setModalFeedback(null);

    // Validasi Sisi Klien untuk Verifikasi Penolakan
    if (newStatus === "REJECTED" && !verificationNotes.trim()) {
      setModalFeedback({
        type: "error",
        message:
          "Mohon cantumkan catatan verifikasi (alasan penolakan berkas) agar orang tua calon siswa mendapatkan informasi yang jelas.",
      });
      return;
    }

    setIsUpdating(true);
    try {
      const payload = {
        status: newStatus,
        verificationNotes: verificationNotes.trim() ? verificationNotes.trim() : null,
      };

      const res = await fetch(`/api/admin/ppdb/${selectedApplicant.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setModalFeedback({
          type: "success",
          message: data.message || "Status verifikasi berhasil disimpan.",
        });

        // Update objek terpilih di modal langsung
        setSelectedApplicant((prev) =>
          prev
            ? {
                ...prev,
                status: newStatus,
                verificationNotes: payload.verificationNotes,
                verifiedAt: new Date().toISOString(),
              }
            : null
        );

        // Refresh daftar data tabel
        fetchApplicants();

        // Tutup modal setelah delay singkat agar user melihat konfirmasi sukses
        setTimeout(() => {
          setIsDetailModalOpen(false);
          setModalFeedback(null);
        }, 1200);
      } else {
        const errorDetail =
          data.errors && typeof data.errors === "object"
            ? Object.values(data.errors).flat().join(". ")
            : "";
        setModalFeedback({
          type: "error",
          message:
            errorDetail ||
            data.message ||
            "Validasi verifikasi gagal: Silakan periksa kembali data status dan catatan.",
        });
      }
    } catch {
      setModalFeedback({
        type: "error",
        message: "Terjadi gangguan jaringan saat memperbarui status verifikasi.",
      });
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
        alert(data.message || "Gagal menghapus pendaftar.");
      }
    } catch {
      alert("Terjadi kesalahan.");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return <Badge variant="success">Diterima (Lolos)</Badge>;
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
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Verifikasi & Data Pendaftar PPDB</span>
            {search && (
              <Badge variant="outline" className="font-mono text-xs text-blue-700 bg-blue-50 border-blue-200">
                Filter: {search}
              </Badge>
            )}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Total {totalCount} calon siswa terdaftar secara daring. Kelola dan verifikasi berkas formulir secara transparan.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchApplicants()}
            isLoading={isLoading}
            className="text-xs font-semibold"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Muat Ulang</span>
          </Button>
          <a
            href={`/api/admin/ppdb?format=csv${statusFilter ? `&status=${statusFilter}` : ""}${pathFilter ? `&path=${pathFilter}` : ""}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
            download
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Ekspor CSV (Excel)</span>
          </a>
        </div>
      </div>

      {/* Filter and Search */}
      <Card className="p-4 bg-white shadow-sm border border-slate-200/80">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="sm:col-span-2 relative">
            <Search className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nomor registrasi (misal: PPDB-2025-B2002), nama calon siswa, NIK, atau wali..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
            />
            {search && (
              <button
                type="button"
                onClick={() => handleSearchChange("")}
                className="absolute right-3 top-3 text-xs text-slate-400 hover:text-slate-600 font-bold"
                title="Hapus pencarian"
              >
                ✕
              </button>
            )}
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
            >
              <option value="">Semua Status Seleksi</option>
              <option value="PENDING">Menunggu Verifikasi</option>
              <option value="VERIFYING">Sedang Diverifikasi</option>
              <option value="ACCEPTED">Diterima (Lolos Seleksi)</option>
              <option value="REJECTED">Tidak Diterima</option>
            </select>
          </div>
          <div>
            <select
              value={pathFilter}
              onChange={(e) => handlePathFilterChange(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
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
      <Card className="overflow-hidden border border-slate-200/80 shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-sm flex flex-col items-center justify-center gap-2">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
            <span>Memuat data pendaftar PPDB...</span>
          </div>
        ) : applicants.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm space-y-3">
            <p>Tidak ada pendaftar yang cocok dengan filter pencarian.</p>
            {search && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSearchChange("")}
                className="text-xs"
              >
                Reset Pencarian
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-600">
                <tr>
                  <th className="py-3.5 px-6">Nomor Registrasi</th>
                  <th className="py-3.5 px-6">Nama Calon Siswa</th>
                  <th className="py-3.5 px-6">Jalur</th>
                  <th className="py-3.5 px-6">Orang Tua / Wali</th>
                  <th className="py-3.5 px-6">Status Verifikasi</th>
                  <th className="py-3.5 px-6">Tanggal Daftar</th>
                  <th className="py-3.5 px-6 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applicants.map((app) => {
                  const isMatch =
                    search &&
                    app.registrationNumber.toUpperCase() === search.trim().toUpperCase();

                  return (
                    <tr
                      key={app.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isMatch ? "bg-blue-50/60 font-semibold" : ""
                      }`}
                    >
                      <td className="py-4 px-6 font-mono text-xs font-bold text-blue-700 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{app.registrationNumber}</span>
                          {isMatch && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] bg-blue-600 text-white font-sans">
                              Cocok
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-900">
                        <div className="font-bold text-slate-900">{app.fullName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {app.gender === "LAKI_LAKI" ? "Laki-laki" : "Perempuan"} • NIK: {app.nik}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-600 font-semibold">
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 text-[11px]">
                          {app.path}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-600">
                        <div className="font-medium text-slate-900">{app.parentName}</div>
                        <a
                          href={`https://wa.me/${app.parentPhone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-500 hover:text-emerald-700 font-mono text-[11px] flex items-center gap-1"
                          title="Hubungi via WhatsApp"
                        >
                          <Phone className="h-3 w-3 text-emerald-600" />
                          <span>{app.parentPhone}</span>
                        </a>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div>
                          {getStatusBadge(app.status)}
                          {app.verificationNotes && (
                            <p
                              className="text-[11px] text-slate-500 truncate max-w-[200px] mt-0.5"
                              title={app.verificationNotes}
                            >
                              {app.verificationNotes}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-500 whitespace-nowrap">
                        {formatDateIndo(app.createdAt)}
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleOpenDetail(app)}
                            className="text-xs font-bold"
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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Halaman {page} dari {totalPages} (Total {totalCount} Calon Siswa)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Sebelumnya
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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
            {/* Feedback Banner */}
            {modalFeedback && (
              <div
                className={`p-4 rounded-xl text-xs flex items-start gap-3 border ${
                  modalFeedback.type === "success"
                    ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                    : "bg-rose-50 border-rose-300 text-rose-900"
                }`}
              >
                {modalFeedback.type === "success" ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="font-semibold leading-relaxed">{modalFeedback.message}</div>
              </div>
            )}

            {/* Header info */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Nomor Registrasi PPDB
                </span>
                <div className="font-mono text-xl font-black text-blue-700">
                  {selectedApplicant.registrationNumber}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Didaftarkan pada: {formatDateIndo(selectedApplicant.createdAt, true)}
                </div>
              </div>
              <div className="text-right sm:text-left">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  Status Saat Ini
                </span>
                <div className="mt-1">{getStatusBadge(selectedApplicant.status)}</div>
              </div>
            </div>

            {/* Biodata Calon Siswa */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <User className="h-4 w-4 text-blue-600" />
                <span>Biodata Calon Siswa</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white p-4 rounded-xl border border-slate-200">
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
                  <span className="text-slate-400 block">Jalur Masuk PPDB:</span>
                  <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 inline-block">
                    {selectedApplicant.path}
                  </span>
                </div>
              </div>
            </div>

            {/* Data Orang Tua / Wali */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Phone className="h-4 w-4 text-amber-600" />
                <span>Data Orang Tua & Domisili</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white p-4 rounded-xl border border-slate-200">
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
                    className="font-mono font-bold text-emerald-600 hover:underline flex items-center gap-1 mt-0.5"
                  >
                    <span>{selectedApplicant.parentPhone}</span>
                    <span className="text-[10px] bg-emerald-50 px-1.5 py-0.5 rounded text-emerald-700 border border-emerald-200 font-sans">
                      Chat WA
                    </span>
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

            {/* Berkas & Dokumen Persyaratan Calon Siswa */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-purple-600" />
                  <span>Berkas & Dokumen Persyaratan Calon Siswa</span>
                </span>
                <span className="text-[11px] font-normal text-slate-500">
                  {selectedApplicant.documents && selectedApplicant.documents.length > 0
                    ? `${selectedApplicant.documents.length} dokumen terlampir`
                    : "Belum ada unggahan berkas digital"}
                </span>
              </h4>

              {selectedApplicant.documents && selectedApplicant.documents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {selectedApplicant.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate">{doc.documentType}</div>
                        <div className="text-[11px] text-slate-500 truncate font-mono">
                          {doc.fileName}
                        </div>
                      </div>
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-white border border-slate-200 text-blue-600 hover:bg-blue-50 transition-colors shrink-0"
                        title="Lihat / Unduh Dokumen"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
                  <span>
                    Calon siswa belum mengunggah dokumen digital atau berkas fisik diserahkan saat daftar ulang di sekolah.
                  </span>
                  <Badge variant="outline" className="text-[10px] shrink-0 font-medium">
                    Berkas Fisik
                  </Badge>
                </div>
              )}
            </div>

            {/* Form Ubah Status Verifikasi */}
            <form onSubmit={handleUpdateStatus} className="pt-4 border-t border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <UserCheck className="h-4 w-4 text-emerald-600" />
                  <span>Tindakan Verifikasi Panitia PPDB</span>
                </h4>
                <span className="text-[11px] text-slate-400">Pastikan keabsahan data sebelum menyimpan</span>
              </div>

              {/* Template Verifikasi Cepat (Quick Action) */}
              <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200/80 space-y-2">
                <div className="text-[11px] font-bold text-blue-900 flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                  <span>Template Tindakan Cepat (1-Klik):</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedApplicant.path === "PRESTASI" && (
                    <button
                      type="button"
                      onClick={() =>
                        handleApplyTemplate(
                          "ACCEPTED",
                          "Piagam / sertifikat kejuaraan terverifikasi absah dan calon siswa dinyatakan lolos seleksi jalur prestasi."
                        )
                      }
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold transition-colors"
                    >
                      🏆 Prestasi Terverifikasi (Lolos)
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      handleApplyTemplate(
                        "ACCEPTED",
                        "Berkas Akta Kelahiran dan Kartu Keluarga telah diverifikasi lengkap dan sesuai prioritas penerimaan."
                      )
                    }
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold transition-colors"
                  >
                    ✅ Berkas Lengkap (Lolos)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleApplyTemplate(
                        "VERIFYING",
                        "Berkas pendaftaran sedang dalam tahap peninjauan dan validasi data oleh panitia PPDB."
                      )
                    }
                    className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-[11px] font-semibold transition-colors"
                  >
                    ⏳ Verifikasi Dokumen
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleApplyTemplate(
                        "VERIFYING",
                        "Mohon orang tua/wali melengkapi berkas atau foto dokumen KK / Akta Kelahiran yang lebih jelas."
                      )
                    }
                    className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-[11px] font-semibold transition-colors"
                  >
                    ⚠️ Perlu Perbaikan Berkas
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleApplyTemplate(
                        "REJECTED",
                        "Mohon maaf, kuota penerimaan untuk jalur ini telah terpenuhi sesuai urutan prioritas skor dan usia."
                      )
                    }
                    className="px-2.5 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-900 text-[11px] font-semibold transition-colors"
                  >
                    ❌ Kuota Terpenuhi
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleApplyTemplate(
                        "REJECTED",
                        "Mohon maaf, usia calon peserta didik belum memenuhi batas minimum seleksi sekolah dasar sesuai juknis PPDB."
                      )
                    }
                    className="px-2.5 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-900 text-[11px] font-semibold transition-colors"
                  >
                    ❌ Usia Belum Cukup
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Status Hasil Seleksi PPDB"
                  value={newStatus}
                  onChange={(e) => {
                    setNewStatus(e.target.value as any);
                    setModalFeedback(null);
                  }}
                  options={[
                    { value: "PENDING", label: "Menunggu Verifikasi" },
                    { value: "VERIFYING", label: "Sedang Diverifikasi" },
                    { value: "ACCEPTED", label: "Diterima (Lolos Seleksi)" },
                    { value: "REJECTED", label: "Tidak Diterima (Ditolak)" },
                  ]}
                />
              </div>

              <Textarea
                label="Catatan Verifikasi Panitia (Dapat dilihat oleh orang tua saat cek status)"
                rows={3}
                value={verificationNotes}
                onChange={(e) => {
                  setVerificationNotes(e.target.value);
                  setModalFeedback(null);
                }}
                placeholder="Tuliskan catatan verifikasi, konfirmasi kelengkapan berkas, atau alasan penolakan..."
                helperText={
                  newStatus === "REJECTED"
                    ? "Wajib diisi: Berikan alasan penolakan agar transparan bagi orang tua."
                    : "Opsional: Berikan catatan kelengkapan dokumen atau informasi jadwal daftar ulang."
                }
              />

              <div className="flex items-center justify-end gap-3 pt-3">
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

export default function AdminPPDBPage() {
  return (
    <React.Suspense
      fallback={
        <div className="p-12 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
          <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
          <span>Memuat antarmuka verifikasi PPDB...</span>
        </div>
      }
    >
      <AdminPPDBContent />
    </React.Suspense>
  );
}
