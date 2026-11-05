"use client";

import * as React from "react";
import Link from "next/link";
import {
  CreditCard,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Printer,
  Download,
  Plus,
  ArrowRight,
  TrendingUp,
  Wallet,
  Building,
  RefreshCw,
  X,
  FileCheck,
  Check,
  ShieldCheck,
  QrCode,
  Upload,
  Image as ImageIcon,
  Trash2,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  PaymentTransaction,
  PaymentStatus,
  PaymentType,
  PaymentMethod,
  SchoolQRISSetting,
} from "@/lib/services/payments";
import { formatDateIndo, formatRupiah } from "@/lib/utils";
import { sanitizeCsvCell } from "@/lib/security/sanitize";

export default function AdminPembayaranPage() {
  const [payments, setPayments] = React.useState<PaymentTransaction[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [typeFilter, setTypeFilter] = React.useState<string>("ALL");

  // Modal Catat Pembayaran Manual / Kasir
  const [isManualModalOpen, setIsManualModalOpen] = React.useState(false);
  const [manualStudentReg, setManualStudentReg] = React.useState("");
  const [manualStudentName, setManualStudentName] = React.useState("");
  const [manualStudentClass, setManualStudentClass] = React.useState("Kelas 1-A");
  const [manualParentName, setManualParentName] = React.useState("");
  const [manualParentPhone, setManualParentPhone] = React.useState("081234567890");
  const [manualType, setManualType] = React.useState<PaymentType>("SPP");
  const [manualPeriod, setManualPeriod] = React.useState("Juli 2026");
  const [manualAmount, setManualAmount] = React.useState(350000);
  const [manualMethod, setManualMethod] = React.useState<PaymentMethod>("TUNAI");
  const [isSubmittingManual, setIsSubmittingManual] = React.useState(false);

  // Status Action (Konfirmasi Lunas)
  const [confirmingId, setConfirmingId] = React.useState<string | null>(null);

  // Modal & State Pengaturan QRIS
  const [isQrisModalOpen, setIsQrisModalOpen] = React.useState(false);
  const [qrisSetting, setQrisSetting] = React.useState<SchoolQRISSetting>({
    enabled: true,
    merchantName: "SD NEGERI HARAPAN BANGSA",
    nmid: "ID1026048192847",
    acquirer: "QRIS Standar Bank Indonesia",
    customImageUrl: null,
    instructions:
      "Buka aplikasi mobile banking atau e-wallet (BCA, Mandiri, BRI, BNI, GoPay, OVO, ShopeePay, DANA), lalu pindai kode QRIS di atas.",
    updatedAt: new Date().toISOString(),
  });
  const [qrisLoading, setQrisLoading] = React.useState(false);
  const [qrisSaving, setQrisSaving] = React.useState(false);
  const [qrisFeedback, setQrisFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null);
  const [qrisInputMode, setQrisInputMode] = React.useState<"UPLOAD" | "URL" | "DYNAMIC">("UPLOAD");
  const [qrisUrlInput, setQrisUrlInput] = React.useState("");
  const [qrisPreviewImage, setQrisPreviewImage] = React.useState<string | null>(null);
  const [qrisFile, setQrisFile] = React.useState<File | null>(null);

  const fetchQrisSetting = React.useCallback(() => {
    setQrisLoading(true);
    fetch("/api/admin/payment/qris")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setQrisSetting(json.data);
          if (json.data.customImageUrl) {
            setQrisPreviewImage(json.data.customImageUrl);
            if (json.data.customImageUrl.startsWith("http")) {
              setQrisUrlInput(json.data.customImageUrl);
              setQrisInputMode("URL");
            } else {
              setQrisInputMode("UPLOAD");
            }
          } else {
            setQrisPreviewImage(null);
            setQrisInputMode("DYNAMIC");
          }
        }
      })
      .catch(() => {})
      .finally(() => setQrisLoading(false));
  }, []);

  React.useEffect(() => {
    if (isQrisModalOpen) {
      fetchQrisSetting();
      setQrisFeedback(null);
    }
  }, [isQrisModalOpen, fetchQrisSetting]);

  const handleQrisFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Silakan pilih file berkas gambar (PNG, JPG, JPEG, WEBP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran gambar maksimal 5MB");
      return;
    }

    setQrisFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      setQrisPreviewImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveQris = async (e: React.FormEvent) => {
    e.preventDefault();
    setQrisSaving(true);
    setQrisFeedback(null);

    try {
      let res: Response;

      if (qrisInputMode === "DYNAMIC") {
        // Reset gambar kustom, gunakan generator dinamis
        res = await fetch("/api/admin/payment/qris", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            merchantName: qrisSetting.merchantName,
            nmid: qrisSetting.nmid,
            acquirer: qrisSetting.acquirer,
            instructions: qrisSetting.instructions,
            enabled: qrisSetting.enabled,
            customImageUrl: null,
          }),
        });
      } else if (qrisInputMode === "UPLOAD" && qrisFile) {
        const formData = new FormData();
        formData.append("file", qrisFile);
        formData.append("merchantName", qrisSetting.merchantName);
        formData.append("nmid", qrisSetting.nmid);
        formData.append("acquirer", qrisSetting.acquirer);
        formData.append("instructions", qrisSetting.instructions || "");
        formData.append("enabled", String(qrisSetting.enabled));

        res = await fetch("/api/admin/payment/qris", {
          method: "POST",
          body: formData,
        });
      } else {
        const finalUrl = qrisInputMode === "URL" ? qrisUrlInput.trim() : qrisPreviewImage;
        res = await fetch("/api/admin/payment/qris", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            merchantName: qrisSetting.merchantName,
            nmid: qrisSetting.nmid,
            acquirer: qrisSetting.acquirer,
            instructions: qrisSetting.instructions,
            enabled: qrisSetting.enabled,
            customImageUrl: finalUrl || null,
          }),
        });
      }

      const json = await res.json();
      if (res.ok && json.success) {
        setQrisSetting(json.data);
        setQrisFeedback({
          type: "success",
          message: "Pengaturan QRIS berhasil disimpan! Semua transaksi QRIS berikutnya akan menggunakan QRIS ini.",
        });
        if (json.data.customImageUrl) {
          setQrisPreviewImage(json.data.customImageUrl);
        } else {
          setQrisPreviewImage(null);
        }
      } else {
        setQrisFeedback({
          type: "error",
          message: json.message || "Gagal menyimpan pengaturan QRIS.",
        });
      }
    } catch {
      setQrisFeedback({
        type: "error",
        message: "Terjadi kesalahan jaringan saat menyimpan QRIS.",
      });
    } finally {
      setQrisSaving(false);
    }
  };

  const handleResetQrisDefault = async () => {
    if (!confirm("Reset QRIS ke setelan bawaan sistem (menghapus gambar kustom)?")) return;
    setQrisSaving(true);
    setQrisFeedback(null);

    try {
      const res = await fetch("/api/admin/payment/qris", { method: "DELETE" });
      const json = await res.json();
      if (res.ok && json.success) {
        setQrisSetting(json.data);
        setQrisPreviewImage(null);
        setQrisFile(null);
        setQrisUrlInput("");
        setQrisInputMode("DYNAMIC");
        setQrisFeedback({
          type: "success",
          message: "Gambar QRIS kustom berhasil dihapus. Menggunakan generator QRIS bawaan.",
        });
      } else {
        alert(json.message || "Gagal mereset QRIS.");
      }
    } catch {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setQrisSaving(false);
    }
  };

  const fetchPayments = React.useCallback(() => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("query", searchQuery.trim());
    if (statusFilter !== "ALL") params.set("status", statusFilter);
    if (typeFilter !== "ALL") params.set("paymentType", typeFilter);

    fetch(`/api/payment?${params.toString()}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setPayments(json.data);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [searchQuery, statusFilter, typeFilter]);

  React.useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Hitung Statistik Keuangan
  const stats = React.useMemo(() => {
    let totalRevenue = 0;
    let successCount = 0;
    let pendingCount = 0;
    let sppRevenue = 0;

    for (const p of payments) {
      if (p.status === "SUCCESS") {
        totalRevenue += p.totalAmount;
        successCount++;
        if (p.paymentType === "SPP") {
          sppRevenue += p.amount;
        }
      } else if (p.status === "PENDING") {
        pendingCount++;
      }
    }

    return { totalRevenue, successCount, pendingCount, sppRevenue };
  }, [payments]);

  // Konfirmasi Manual Menjadi LUNAS
  const handleConfirmSuccess = async (id: string) => {
    if (!confirm("Konfirmasi pembayaran ini menjadi LUNAS?")) return;
    setConfirmingId(id);

    try {
      const res = await fetch(`/api/admin/payment/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "SUCCESS",
          notes: "Dikonfirmasi manual oleh Bendahara Sekolah",
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        fetchPayments();
      } else {
        alert(json.message || "Gagal memperbarui status transaksi.");
      }
    } catch {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setConfirmingId(null);
    }
  };

  // Simpan Pembayaran Manual / Kasir
  const handleSaveManualPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingManual(true);

    try {
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentRegistrationNumber: manualStudentReg || "REG-MANUAL",
          studentName: manualStudentName,
          studentClass: manualStudentClass,
          parentName: manualParentName,
          parentPhone: manualParentPhone,
          paymentType: manualType,
          paymentTitle:
            manualType === "SPP"
              ? `SPP Bulan ${manualPeriod}`
              : `Uang Gedung (${manualPeriod})`,
          period: manualPeriod,
          amount: manualAmount,
          adminFee: 0,
          paymentMethod: manualMethod,
          paymentGateway: "SIMULATION",
          notes: "Pembayaran tunai di loket Tata Usaha Sekolah",
        }),
      });

      const json = await res.json();
      if (res.ok && json.success && json.data?.transaction) {
        // Langsung tandai lunas karena ini pembayaran tunai/kasir
        await fetch(`/api/admin/payment/${json.data.transaction.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "SUCCESS" }),
        });

        setIsManualModalOpen(false);
        fetchPayments();
        alert("Pembayaran tunai berhasil dicatat dan kwitansi resmi diterbitkan!");
      } else {
        alert(json.message || "Gagal mencatat pembayaran.");
      }
    } catch {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setIsSubmittingManual(false);
    }
  };

  // Ekspor Data ke CSV Aman
  const handleExportCSV = () => {
    if (payments.length === 0) {
      alert("Tidak ada data transaksi untuk diekspor.");
      return;
    }

    const headers = [
      "No. Invoice",
      "No. Kwitansi",
      "Tanggal",
      "Nama Siswa",
      "No. Registrasi",
      "Kelas",
      "Jenis",
      "Periode",
      "Nominal",
      "Admin Fee",
      "Total Bayar",
      "Metode",
      "Gateway",
      "Status",
    ];

    const rows = payments.map((p) => [
      sanitizeCsvCell(p.invoiceNumber),
      sanitizeCsvCell(p.receiptNumber || "-"),
      sanitizeCsvCell(formatDateIndo(p.paidAt || p.createdAt)),
      sanitizeCsvCell(p.studentName),
      sanitizeCsvCell(p.studentRegistrationNumber),
      sanitizeCsvCell(p.studentClass),
      sanitizeCsvCell(p.paymentType),
      sanitizeCsvCell(p.period),
      p.amount,
      p.adminFee,
      p.totalAmount,
      sanitizeCsvCell(p.paymentMethod),
      sanitizeCsvCell(p.paymentGateway),
      sanitizeCsvCell(p.status),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_Pembayaran_Sekolah_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md">
              Modul Keuangan & SPP
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Manajemen Pembayaran & Kwitansi
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola tagihan SPP bulanan, uang gedung, verifikasi gateway Midtrans/Xendit, dan cetak kwitansi resmi.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            onClick={() => setIsQrisModalOpen(true)}
            variant="outline"
            size="sm"
            className="rounded-xl text-xs font-bold gap-1.5 border-purple-200 text-purple-700 bg-purple-50/70 hover:bg-purple-100 hover:text-purple-800 transition-all active:scale-95"
          >
            <QrCode className="h-4 w-4 text-purple-600" />
            <span>Atur QRIS Sekolah</span>
          </Button>

          <Button
            onClick={handleExportCSV}
            variant="outline"
            size="sm"
            className="rounded-xl text-xs font-bold gap-1.5"
          >
            <Download className="h-4 w-4 text-slate-600" />
            <span>Ekspor CSV</span>
          </Button>

          <Button
            onClick={() => setIsManualModalOpen(true)}
            variant="primary"
            size="sm"
            className="rounded-xl text-xs font-bold gap-1.5 bg-blue-600 hover:bg-blue-700 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Catat Bayar Tunai / Loket</span>
          </Button>
        </div>
      </div>

      {/* 4 Kartu Statistik Keuangan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Pemasukan Sah</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 mt-2">
            {formatRupiah(stats.totalRevenue)}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">
            {stats.successCount} transaksi terverifikasi
          </div>
        </Card>

        <Card className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Penerimaan SPP</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 mt-2">
            {formatRupiah(stats.sppRevenue)}
          </div>
          <div className="text-[11px] text-blue-700 font-semibold mt-1">
            Iuran bulanan siswa aktif
          </div>
        </Card>

        <Card className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Menunggu Pembayaran</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl font-black text-amber-700 mt-2">
            {stats.pendingCount} Transaksi
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Menunggu transfer siswa/wali
          </div>
        </Card>

        <Card className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Gateway Terintegrasi</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="text-sm font-black text-slate-900 mt-2">
            Midtrans & Xendit
          </div>
          <div className="text-[11px] text-purple-700 font-semibold mt-1">
            Sandbox Simulator Aktif
          </div>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <Card className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <div className="sm:col-span-6 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari No. Invoice, Nama Siswa, No. Registrasi..."
              className="pl-10 h-10 rounded-xl text-xs sm:text-sm"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700"
            >
              <option value="ALL">Semua Status</option>
              <option value="SUCCESS">Lunas (Berhasil)</option>
              <option value="PENDING">Menunggu Bayar</option>
              <option value="FAILED">Gagal</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700"
            >
              <option value="ALL">Semua Jenis Tagihan</option>
              <option value="SPP">SPP Bulanan</option>
              <option value="UANG_GEDUNG">Uang Gedung & Sarana</option>
              <option value="SERAGAM">Paket Seragam</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Tabel Seluruh Transaksi */}
      <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">No. Invoice & Kwitansi</th>
                <th className="py-3 px-4">Nama Siswa & Kelas</th>
                <th className="py-3 px-4">Tagihan & Periode</th>
                <th className="py-3 px-4">Metode & Gateway</th>
                <th className="py-3 px-4">Total Bayar</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 font-medium">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Memuat data transaksi...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Tidak ada transaksi yang cocok dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                payments.map((p) => {
                  const isSuccess = p.status === "SUCCESS";
                  const isPending = p.status === "PENDING";

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-slate-900 block">
                          {p.invoiceNumber}
                        </span>
                        {p.receiptNumber ? (
                          <span className="text-[10px] font-mono text-emerald-700 font-semibold block">
                            {p.receiptNumber}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 block">Belum ada kwitansi</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{p.studentName}</span>
                        <span className="text-[11px] text-slate-500 block">
                          {p.studentClass} &bull; {p.studentRegistrationNumber}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800 block">{p.paymentTitle}</span>
                        <span className="text-[11px] text-slate-400 block">{p.period}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-900 block">
                          {p.paymentMethod.replace("_", " ")}
                        </span>
                        <span className="text-[10px] text-slate-400 block">{p.paymentGateway}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-black text-slate-900 block">
                          {formatRupiah(p.totalAmount)}
                        </span>
                        {p.adminFee > 0 && (
                          <span className="text-[10px] text-slate-400 block">
                            +Admin {formatRupiah(p.adminFee)}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                            isSuccess
                              ? "bg-emerald-100 text-emerald-800"
                              : isPending
                              ? "bg-amber-100 text-amber-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {isSuccess && <CheckCircle2 className="h-3 w-3" />}
                          {isPending && <Clock className="h-3 w-3" />}
                          <span>{isSuccess ? "Lunas" : isPending ? "Menunggu" : "Gagal"}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {isSuccess ? (
                            <Link
                              href={`/pembayaran/kwitansi/${p.invoiceNumber}`}
                              target="_blank"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition-colors"
                              title="Cetak Kwitansi PDF"
                            >
                              <Printer className="h-3.5 w-3.5" />
                              <span>Kwitansi</span>
                            </Link>
                          ) : isPending ? (
                            <Button
                              onClick={() => handleConfirmSuccess(p.id)}
                              disabled={confirmingId === p.id}
                              size="sm"
                              variant="outline"
                              className="h-8 text-[11px] font-bold text-emerald-700 border-emerald-300 hover:bg-emerald-50 rounded-lg gap-1"
                              title="Tandai Sudah Diterima Tunai"
                            >
                              <Check className="h-3 w-3" />
                              <span>Konfirmasi Lunas</span>
                            </Button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* MODAL CATAT PEMBAYARAN TUNAI / LOKET */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                    Catat Pembayaran Loket / Tunai
                  </h3>
                  <p className="text-xs text-slate-500">
                    Input penerimaan dana tunai di sekolah dan terbitkan kwitansi resmi instan.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveManualPayment} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Nama Lengkap Siswa"
                  required
                  value={manualStudentName}
                  onChange={(e) => setManualStudentName(e.target.value)}
                  placeholder="Contoh: Muhammad Rizky"
                  className="text-xs"
                />
                <Input
                  label="Kelas / Rombel"
                  required
                  value={manualStudentClass}
                  onChange={(e) => setManualStudentClass(e.target.value)}
                  placeholder="Contoh: Kelas 3-B"
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="No. Registrasi / NISN"
                  value={manualStudentReg}
                  onChange={(e) => setManualStudentReg(e.target.value)}
                  placeholder="PPDB-2025-XXXXX"
                  className="text-xs font-mono"
                />
                <Input
                  label="Nama Orang Tua / Pembayar"
                  required
                  value={manualParentName}
                  onChange={(e) => setManualParentName(e.target.value)}
                  placeholder="Nama Pembayar"
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Jenis Tagihan:</label>
                  <select
                    value={manualType}
                    onChange={(e) => {
                      const t = e.target.value as PaymentType;
                      setManualType(t);
                      if (t === "SPP") setManualAmount(350000);
                      else if (t === "UANG_GEDUNG") setManualAmount(1000000);
                    }}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-medium"
                  >
                    <option value="SPP">SPP Bulanan</option>
                    <option value="UANG_GEDUNG">Uang Gedung & Sarana</option>
                    <option value="SERAGAM">Paket Seragam</option>
                  </select>
                </div>

                <Input
                  label="Periode / Bulan"
                  required
                  value={manualPeriod}
                  onChange={(e) => setManualPeriod(e.target.value)}
                  placeholder="Contoh: Juli 2026"
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Nominal Diterima (Rp)"
                  type="number"
                  required
                  value={manualAmount}
                  onChange={(e) => setManualAmount(parseInt(e.target.value, 10) || 0)}
                  className="text-xs font-bold"
                />

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Metode Transaksi:</label>
                  <select
                    value={manualMethod}
                    onChange={(e) => setManualMethod(e.target.value as PaymentMethod)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-medium"
                  >
                    <option value="TUNAI">Uang Tunai (Cash di Loket)</option>
                    <option value="BCA_VA">Transfer Bank BCA</option>
                    <option value="MANDIRI_VA">Transfer Bank Mandiri</option>
                    <option value="QRIS">QRIS Kasir</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsManualModalOpen(false)}
                  className="text-xs rounded-xl"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingManual}
                  variant="primary"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl"
                >
                  {isSubmittingManual ? "Menyimpan..." : "Simpan & Terbitkan Kwitansi"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Pengaturan QRIS Resmi Sekolah */}
      {isQrisModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Header Modal */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-purple-50 to-indigo-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                  <QrCode className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Pengaturan QRIS Resmi Sekolah
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ganti gambar barcode QRIS rekening sekolah atau kelola nama merchant penerima dana.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsQrisModalOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body Modal with Live Preview & Form */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Feedback Alert */}
              {qrisFeedback && (
                <div
                  className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2.5 ${
                    qrisFeedback.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-rose-50 text-rose-800 border border-rose-200"
                  }`}
                >
                  {qrisFeedback.type === "success" ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                  )}
                  <span>{qrisFeedback.message}</span>
                </div>
              )}

              <form onSubmit={handleSaveQris} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  {/* Kolom Kiri: Live Preview QRIS (Kartu Standar Indonesia) */}
                  <div className="md:col-span-5 flex flex-col items-center">
                    <div className="w-full max-w-[280px] bg-white border-2 border-slate-200 rounded-3xl p-4 shadow-lg text-center space-y-3 relative overflow-hidden">
                      {/* Banner Header QRIS */}
                      <div className="bg-red-600 text-white py-1 px-3 rounded-lg font-black tracking-widest text-xs flex items-center justify-between">
                        <span>QRIS</span>
                        <span className="text-[9px] font-bold tracking-normal opacity-90">PEMBAYARAN</span>
                      </div>

                      <div className="space-y-0.5">
                        <div className="font-black text-slate-900 text-xs sm:text-sm tracking-tight leading-tight uppercase">
                          {qrisSetting.merchantName || "SD NEGERI HARAPAN BANGSA"}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500">
                          NMID: <span className="font-bold">{qrisSetting.nmid || "ID1026048192847"}</span>
                        </div>
                      </div>

                      {/* Display QR Code */}
                      <div className="w-48 h-48 mx-auto bg-slate-50 border border-slate-200 rounded-2xl p-2 flex items-center justify-center overflow-hidden shadow-inner">
                        {qrisPreviewImage ? (
                          <img
                            src={qrisPreviewImage}
                            alt="Preview QRIS Sekolah"
                            className="w-full h-full object-contain rounded-xl"
                          />
                        ) : (
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=QRIS_PREVIEW_${encodeURIComponent(
                              qrisSetting.merchantName || "SEKOLAH"
                            )}`}
                            alt="Preview QRIS Dinamis"
                            className="w-full h-full object-contain"
                          />
                        )}
                      </div>

                      <div className="text-[10px] text-slate-500 font-medium">
                        {qrisSetting.acquirer || "Bank Indonesia / Seluruh Bank & E-Wallet"}
                      </div>

                      {/* Badge Mode */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5">
                        <Badge
                          variant={qrisPreviewImage ? "success" : "info"}
                          className="text-[10px]"
                        >
                          {qrisPreviewImage ? "Gambar QRIS Kustom Aktif" : "QRIS Dinamis Sistem"}
                        </Badge>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400 text-center mt-2">
                      Tampilan yang akan dilihat wali murid saat membayar SPP
                    </span>
                  </div>

                  {/* Kolom Kanan: Pengaturan & Upload */}
                  <div className="md:col-span-7 space-y-4">
                    {/* Tab Pilihan Sumber QRIS */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <ImageIcon className="h-3.5 w-3.5 text-purple-600" />
                        <span>Pilih Sumber Barcode QRIS:</span>
                      </label>
                      <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl text-[11px] font-bold">
                        <button
                          type="button"
                          onClick={() => setQrisInputMode("UPLOAD")}
                          className={`py-2 px-2 rounded-xl transition-all cursor-pointer ${
                            qrisInputMode === "UPLOAD"
                              ? "bg-white text-purple-700 shadow-xs"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          Unggah Berkas
                        </button>
                        <button
                          type="button"
                          onClick={() => setQrisInputMode("URL")}
                          className={`py-2 px-2 rounded-xl transition-all cursor-pointer ${
                            qrisInputMode === "URL"
                              ? "bg-white text-purple-700 shadow-xs"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          Tautan URL
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setQrisInputMode("DYNAMIC");
                            setQrisPreviewImage(null);
                          }}
                          className={`py-2 px-2 rounded-xl transition-all cursor-pointer ${
                            qrisInputMode === "DYNAMIC"
                              ? "bg-white text-purple-700 shadow-xs"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          QRIS Bawaan
                        </button>
                      </div>
                    </div>

                    {/* Input Berkas / URL */}
                    {qrisInputMode === "UPLOAD" && (
                      <div className="p-4 rounded-2xl border-2 border-dashed border-purple-200 bg-purple-50/30 text-center space-y-2">
                        <Upload className="h-6 w-6 text-purple-600 mx-auto" />
                        <div className="text-xs font-bold text-slate-800">
                          Pilih Gambar QRIS dari Komputer / HP
                        </div>
                        <p className="text-[10px] text-slate-500">
                          Format PNG, JPG, JPEG, atau WebP (Maksimal 5MB)
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleQrisFileChange}
                          className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer"
                        />
                      </div>
                    )}

                    {qrisInputMode === "URL" && (
                      <div className="space-y-1">
                        <Input
                          label="URL Gambar QRIS (Direct Link)"
                          value={qrisUrlInput}
                          onChange={(e) => {
                            setQrisUrlInput(e.target.value);
                            setQrisPreviewImage(e.target.value || null);
                          }}
                          placeholder="https://example.com/qris-sekolah.png"
                          className="text-xs"
                        />
                        <p className="text-[10px] text-slate-400">
                          Tempelkan URL gambar QRIS yang dapat diakses publik.
                        </p>
                      </div>
                    )}

                    {qrisInputMode === "DYNAMIC" && (
                      <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs text-blue-800 flex items-start gap-2.5">
                        <Sparkles className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <p className="font-bold">Mode QRIS Dinamis Otomatis</p>
                          <p className="text-[11px] text-blue-700 leading-relaxed">
                            Sistem akan otomatis membuat barcode QRIS baru pada setiap transaksi dengan mencantumkan nominal pembayaran siswa secara dinamis.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Metadata Merchant */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        label="Nama Merchant / Rekening Sekolah"
                        required
                        value={qrisSetting.merchantName}
                        onChange={(e) =>
                          setQrisSetting((prev) => ({ ...prev, merchantName: e.target.value }))
                        }
                        placeholder="SD NEGERI HARAPAN BANGSA"
                        className="text-xs"
                      />
                      <Input
                        label="NMID (National Merchant ID)"
                        required
                        value={qrisSetting.nmid}
                        onChange={(e) =>
                          setQrisSetting((prev) => ({ ...prev, nmid: e.target.value }))
                        }
                        placeholder="ID1026048192847"
                        className="text-xs font-mono"
                      />
                    </div>

                    <Input
                      label="Bank Penerbit / Mitra Pembayaran"
                      value={qrisSetting.acquirer}
                      onChange={(e) =>
                        setQrisSetting((prev) => ({ ...prev, acquirer: e.target.value }))
                      }
                      placeholder="Contoh: Bank BJB, Bank Mandiri, BCA, ShopeePay"
                      className="text-xs"
                    />

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">
                        Petunjuk Transaksi Bagi Wali Murid:
                      </label>
                      <textarea
                        value={qrisSetting.instructions || ""}
                        onChange={(e) =>
                          setQrisSetting((prev) => ({ ...prev, instructions: e.target.value }))
                        }
                        rows={2}
                        placeholder="Contoh: Buka aplikasi mobile banking atau e-wallet..."
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Modal Buttons */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleResetQrisDefault}
                    disabled={qrisSaving}
                    className="w-full sm:w-auto text-xs rounded-xl text-rose-600 hover:text-rose-700 border-rose-200 hover:bg-rose-50 gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Reset ke QRIS Bawaan</span>
                  </Button>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsQrisModalOpen(false)}
                      disabled={qrisSaving}
                      className="text-xs rounded-xl cursor-pointer"
                    >
                      Tutup
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={qrisSaving}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer"
                    >
                      {qrisSaving ? "Menyimpan..." : "Simpan Perubahan QRIS"}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
