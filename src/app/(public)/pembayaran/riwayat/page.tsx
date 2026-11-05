"use client";

import * as React from "react";
import Link from "next/link";
import {
  CreditCard,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Printer,
  ChevronRight,
  ArrowRight,
  Sparkles,
  RefreshCw,
  QrCode,
  Copy,
  Check,
  X,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PaymentTransaction, PaymentStatus, PaymentType } from "@/lib/services/payments";
import { formatDateIndo, formatRupiah } from "@/lib/utils";
import { SCHOOL_CONFIG } from "@/config/school";

export default function RiwayatPembayaranPage() {
  const [payments, setPayments] = React.useState<PaymentTransaction[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [typeFilter, setTypeFilter] = React.useState<string>("ALL");

  // Modal Checkout / Simulasi Bayar
  const [activePayment, setActivePayment] = React.useState<PaymentTransaction | null>(null);
  const [isSimulating, setIsSimulating] = React.useState(false);
  const [copiedVA, setCopiedVA] = React.useState(false);
  const [simulationSuccess, setSimulationSuccess] = React.useState(false);

  const fetchTransactions = React.useCallback(() => {
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
    fetchTransactions();
  }, [fetchTransactions]);

  const handleSimulatePay = async (invoiceNumber: string) => {
    setIsSimulating(true);
    try {
      const res = await fetch(`/api/payment/${encodeURIComponent(invoiceNumber)}/simulate`, {
        method: "POST",
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setSimulationSuccess(true);
        fetchTransactions();
        if (activePayment) {
          setActivePayment(json.data);
        }
      }
    } catch {
      alert("Terjadi kesalahan jaringan saat simulasi pembayaran.");
    } finally {
      setIsSimulating(false);
    }
  };

  const handleCopy = (text: string) => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(text);
      setCopiedVA(true);
      setTimeout(() => setCopiedVA(false), 2000);
    }
  };

  return (
    <div className="space-y-12 pb-24">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold border border-white/10">
              <CreditCard className="h-3.5 w-3.5" />
              <span>Portal Pembayaran Online Resmi</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              Riwayat Pembayaran & Kwitansi
            </h1>
            <p className="text-xs sm:text-sm text-blue-200 max-w-xl leading-relaxed">
              Pantau status verifikasi pembayaran SPP bulanan, uang gedung, dan unduh kwitansi resmi berformat PDF kapan saja.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/pembayaran"
              className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-5 py-3 rounded-2xl text-xs sm:text-sm shadow-lg transition-all active:scale-95"
            >
              <Sparkles className="h-4 w-4 text-slate-950" />
              <span>Bayar Tagihan Baru</span>
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Filter & Search Bar */}
        <Card className="p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs bg-white space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            {/* Search Input */}
            <div className="sm:col-span-6 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari No. Invoice, Nama Siswa, No. Registrasi..."
                className="pl-10 h-10 rounded-xl text-xs sm:text-sm"
              />
            </div>

            {/* Filter Status */}
            <div className="sm:col-span-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">Semua Status</option>
                <option value="SUCCESS">Lunas (Berhasil)</option>
                <option value="PENDING">Menunggu Pembayaran</option>
                <option value="FAILED">Gagal / Dibatalkan</option>
              </select>
            </div>

            {/* Filter Jenis Tagihan */}
            <div className="sm:col-span-3">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">Semua Jenis Tagihan</option>
                <option value="SPP">SPP Bulanan</option>
                <option value="UANG_GEDUNG">Uang Gedung & Sarana</option>
                <option value="SERAGAM">Paket Seragam</option>
                <option value="KEGIATAN">Kegiatan Ekstrakurikuler</option>
              </select>
            </div>
          </div>
        </Card>

        {/* List Transaksi */}
        {isLoading ? (
          <div className="p-16 text-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-semibold text-slate-500">Memuat riwayat transaksi...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <CreditCard className="h-7 w-7" />
            </div>
            <h3 className="font-extrabold text-slate-800 text-base">Belum Ada Transaksi Ditemukan</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Tidak ada data pembayaran yang cocok dengan kriteria pencarian atau belum ada tagihan yang dibuat.
            </p>
            <div className="pt-2">
              <Link
                href="/pembayaran"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs"
              >
                <span>Buat Pembayaran Baru</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map((p) => {
              const isSuccess = p.status === "SUCCESS";
              const isPending = p.status === "PENDING";

              return (
                <Card
                  key={p.id}
                  className="p-5 rounded-2xl border border-slate-200/80 hover:border-blue-200 hover:shadow-md transition-all bg-white"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Info Utama Tagihan */}
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                          isSuccess
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            : isPending
                            ? "bg-amber-50 text-amber-600 border border-amber-100"
                            : "bg-rose-50 text-rose-600 border border-rose-100"
                        }`}
                      >
                        {isSuccess ? (
                          <CheckCircle2 className="h-6 w-6" />
                        ) : isPending ? (
                          <Clock className="h-6 w-6" />
                        ) : (
                          <AlertCircle className="h-6 w-6" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                            {p.invoiceNumber}
                          </span>
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                              isSuccess
                                ? "bg-emerald-100 text-emerald-800"
                                : isPending
                                ? "bg-amber-100 text-amber-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {isSuccess ? "Lunas" : isPending ? "Menunggu Bayar" : "Gagal"}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            &bull; {formatDateIndo(p.createdAt, true)}
                          </span>
                        </div>

                        <h4 className="text-base font-extrabold text-slate-900">
                          {p.paymentTitle}
                        </h4>

                        <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                          <span>
                            Siswa: <strong className="text-slate-900">{p.studentName}</strong> ({p.studentClass})
                          </span>
                          <span>&bull;</span>
                          <span>
                            Metode: <span className="font-medium">{p.paymentMethod.replace("_", " ")}</span>
                          </span>
                          <span>&bull;</span>
                          <span>
                            Gateway: <span className="font-medium">{p.paymentGateway}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Nominal & Tombol Aksi */}
                    <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100 gap-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block lg:text-right">
                          Total Bayar
                        </span>
                        <span className="text-base sm:text-lg font-black text-blue-700">
                          {formatRupiah(p.totalAmount)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isSuccess && (
                          <Link
                            href={`/pembayaran/kwitansi/${p.invoiceNumber}`}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition-colors"
                          >
                            <Printer className="h-3.5 w-3.5" />
                            <span>Kwitansi PDF</span>
                          </Link>
                        )}

                        {isPending && (
                          <Button
                            onClick={() => {
                              setActivePayment(p);
                              setSimulationSuccess(false);
                            }}
                            variant="primary"
                            size="sm"
                            className="rounded-xl text-xs font-bold gap-1 bg-blue-600 hover:bg-blue-700 shadow-xs"
                          >
                            <span>Bayar Sekarang</span>
                            <ChevronRight className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL CHECKOUT & SIMULASI PEMBAYARAN */}
      {activePayment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                    Selesaikan Pembayaran Online
                  </h3>
                  <p className="text-xs text-slate-500">
                    Invoice: <span className="font-mono font-bold">{activePayment.invoiceNumber}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActivePayment(null)}
                className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
              {simulationSuccess || activePayment.status === "SUCCESS" ? (
                <div className="text-center py-6 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="h-10 w-10" />
                  </div>
                  <h4 className="text-lg font-black text-slate-900">Pembayaran Berhasil!</h4>
                  <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
                    Dana pembayaran sebesar <strong>{formatRupiah(activePayment.totalAmount)}</strong> telah terkonfirmasi lunas dan dicatat di database sekolah.
                  </p>
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                      href={`/pembayaran/kwitansi/${activePayment.invoiceNumber}`}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-md transition-all"
                    >
                      <Printer className="h-4 w-4" />
                      <span>Buka & Unduh Kwitansi PDF</span>
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  {/* Ringkasan Tagihan */}
                  <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tagihan</span>
                      <span className="font-bold text-slate-900">{activePayment.paymentTitle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Nama Siswa</span>
                      <span className="font-semibold text-slate-900">{activePayment.studentName} ({activePayment.studentClass})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Metode</span>
                      <span className="font-semibold text-slate-900">{activePayment.paymentMethod.replace("_", " ")}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-blue-200/60 text-sm font-extrabold text-blue-900">
                      <span>Total Tagihan</span>
                      <span>{formatRupiah(activePayment.totalAmount)}</span>
                    </div>
                  </div>

                  {/* Instruksi Sesuai Metode */}
                  {activePayment.paymentMethod === "QRIS" ? (
                    <div className="text-center space-y-3 p-4 rounded-2xl border border-slate-200 bg-slate-50">
                      <p className="text-xs font-bold text-slate-700">Pindai QRIS Menggunakan Aplikasi Bank / E-Wallet</p>
                      <div className="w-48 h-48 mx-auto bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center">
                        <img
                          src={
                            activePayment.qrCodeUrl ||
                            `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=QRIS_DEMO_${activePayment.invoiceNumber}`
                          }
                          alt="QRIS Sekolah"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <p className="text-[11px] text-slate-500">Mendukung BCA, Mandiri, BRI, BNI, GoPay, OVO, ShopeePay, Dana</p>
                    </div>
                  ) : activePayment.vaNumber ? (
                    <div className="space-y-2 p-4 rounded-2xl border border-slate-200 bg-slate-50 text-xs">
                      <span className="text-[11px] font-bold text-slate-500 uppercase">Nomor Virtual Account</span>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200">
                        <span className="font-mono text-base font-black text-slate-900 tracking-wider">
                          {activePayment.vaNumber}
                        </span>
                        <Button
                          onClick={() => handleCopy(activePayment.vaNumber || "")}
                          size="sm"
                          variant="outline"
                          className="h-8 text-[11px] gap-1 rounded-lg"
                        >
                          {copiedVA ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-600" />
                              <span>Tersalin</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span>Salin</span>
                            </>
                          )}
                        </Button>
                      </div>
                      <p className="text-[11px] text-slate-500">Transfer ke nomor VA di atas sebelum 24 jam</p>
                    </div>
                  ) : null}

                  {/* Tombol Simulasi Pembayaran Sandbox */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Gateway Mode: {activePayment.paymentGateway} Sandbox</span>
                      <span className="text-emerald-700 font-bold">Simulator Siap</span>
                    </div>

                    <Button
                      onClick={() => handleSimulatePay(activePayment.invoiceNumber)}
                      disabled={isSimulating}
                      variant="primary"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-3 rounded-xl gap-2 shadow-md active:scale-95 transition-all"
                    >
                      {isSimulating ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                      <span>Simulasi Selesaikan Pembayaran (Test Mode)</span>
                    </Button>
                    <p className="text-[10px] text-slate-400 text-center leading-tight">
                      Klik tombol di atas untuk mensimulasikan notifikasi webhook gateway berhasil secara instan dan menerbitkan Kwitansi PDF resmi.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

