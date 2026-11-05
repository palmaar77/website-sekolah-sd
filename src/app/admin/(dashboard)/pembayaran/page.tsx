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
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PaymentTransaction, PaymentStatus, PaymentType, PaymentMethod } from "@/lib/services/payments";
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
    </div>
  );
}
