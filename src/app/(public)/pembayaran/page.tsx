"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CreditCard,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building,
  HelpCircle,
  Copy,
  Check,
  QrCode,
  Printer,
  ChevronRight,
  X,
  FileText,
  AlertCircle,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { PaymentTransaction, PaymentMethod, PaymentType } from "@/lib/services/payments";
import { formatRupiah, formatDateIndo } from "@/lib/utils";
import { SCHOOL_CONFIG } from "@/config/school";

const MONTH_OPTIONS = [
  "Juli 2026",
  "Agustus 2026",
  "September 2026",
  "Oktober 2026",
  "November 2026",
  "Desember 2026",
  "Januari 2027",
  "Februari 2027",
  "Maret 2027",
  "April 2027",
  "Mei 2027",
  "Juni 2027",
];

const PRESET_STUDENTS = [
  {
    regNo: "PPDB-2025-00001",
    name: "Ahmad Rayhan Pratama",
    class: "Kelas 1-A",
    parentName: "Budi Santoso",
    parentPhone: "081234567890",
  },
  {
    regNo: "PPDB-2025-A1001",
    name: "Ananda Bintang Nusantara",
    class: "Kelas 1-B",
    parentName: "Hendra Nusantara",
    parentPhone: "081298765432",
  },
  {
    regNo: "PPDB-2025-B2002",
    name: "Clarissa Putri Kirana",
    class: "Kelas 2-A",
    parentName: "Dewi Lestari",
    parentPhone: "081311223344",
  },
];

function PembayaranContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State Formulir
  const [paymentType, setPaymentType] = React.useState<PaymentType>("SPP");
  const [selectedStudentType, setSelectedStudentType] = React.useState<string>("PRESET_0");
  const [studentRegistrationNumber, setStudentRegistrationNumber] = React.useState(PRESET_STUDENTS[0].regNo);
  const [studentName, setStudentName] = React.useState(PRESET_STUDENTS[0].name);
  const [studentClass, setStudentClass] = React.useState(PRESET_STUDENTS[0].class);
  const [parentName, setParentName] = React.useState(PRESET_STUDENTS[0].parentName);
  const [parentPhone, setParentPhone] = React.useState(PRESET_STUDENTS[0].parentPhone);

  // Periode & Nominal
  const [sppPeriod, setSppPeriod] = React.useState("Juli 2026");
  const [buildingPlan, setBuildingPlan] = React.useState("LUNAS"); // "LUNAS" (3.000.000) or "TAHAP_1" (1.000.000)

  // Metode Pembayaran & Gateway
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>("QRIS");
  const [paymentGateway, setPaymentGateway] = React.useState<"MIDTRANS" | "XENDIT">("MIDTRANS");

  // Status Pembuatan Tagihan & Modal
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [createdTransaction, setCreatedTransaction] = React.useState<PaymentTransaction | null>(null);
  const [isSimulating, setIsSimulating] = React.useState(false);
  const [simulationSuccess, setSimulationSuccess] = React.useState(false);
  const [copiedVA, setCopiedVA] = React.useState(false);

  // Periksa apakah ada invoice query param (misal dari riwayat)
  React.useEffect(() => {
    const inv = searchParams.get("invoice");
    if (inv) {
      fetch(`/api/payment/${encodeURIComponent(inv)}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data?.transaction) {
            setCreatedTransaction(json.data.transaction);
          }
        })
        .catch(() => {});
    }
  }, [searchParams]);

  const handleStudentSelect = (val: string) => {
    setSelectedStudentType(val);
    if (val.startsWith("PRESET_")) {
      const idx = parseInt(val.replace("PRESET_", ""), 10);
      const student = PRESET_STUDENTS[idx];
      if (student) {
        setStudentRegistrationNumber(student.regNo);
        setStudentName(student.name);
        setStudentClass(student.class);
        setParentName(student.parentName);
        setParentPhone(student.parentPhone);
      }
    } else {
      // Manual input
      setStudentRegistrationNumber("");
      setStudentName("");
      setStudentClass("Kelas 1");
      setParentName("");
      setParentPhone("");
    }
  };

  const currentAmount =
    paymentType === "SPP"
      ? 350000
      : buildingPlan === "LUNAS"
      ? 3000000
      : 1000000;

  const currentAdminFee =
    paymentMethod === "QRIS" || paymentMethod === "GOPAY" || paymentMethod === "SHOPEEPAY"
      ? 2500
      : 0;

  const totalPayable = currentAmount + currentAdminFee;

  const currentPeriod =
    paymentType === "SPP"
      ? sppPeriod
      : buildingPlan === "LUNAS"
      ? "Lunas Penuh (Uang Gedung)"
      : buildingPlan === "TAHAP_1"
      ? "Tahap 1 (Awal Tahun)"
      : "Tahap 2";

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentRegistrationNumber,
          studentName,
          studentClass,
          parentName,
          parentPhone,
          paymentType,
          paymentTitle:
            paymentType === "SPP"
              ? `SPP Bulan ${currentPeriod}`
              : `Uang Gedung & Pengembangan Sarana (${currentPeriod})`,
          period: currentPeriod,
          academicYear: SCHOOL_CONFIG.academic.currentYear,
          amount: currentAmount,
          adminFee: currentAdminFee,
          paymentMethod,
          paymentGateway,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success && json.data?.transaction) {
        setCreatedTransaction(json.data.transaction);
        setSimulationSuccess(false);
      } else {
        setFormError(json.message || "Gagal membuat invoice tagihan pembayaran.");
      }
    } catch {
      setFormError("Terjadi kesalahan jaringan saat membuat pembayaran.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimulateSuccess = async () => {
    if (!createdTransaction) return;
    setIsSimulating(true);

    try {
      const res = await fetch(`/api/payment/${encodeURIComponent(createdTransaction.invoiceNumber)}/simulate`, {
        method: "POST",
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setSimulationSuccess(true);
        setCreatedTransaction(json.data);
      }
    } catch {
      alert("Gagal mensimulasikan pembayaran.");
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
    <div className="space-y-16 pb-24">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-white/10 px-3.5 py-1 rounded-full border border-white/15">
              Administrasi Keuangan Digital
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Pembayaran Online SPP & Uang Gedung
            </h1>
            <p className="text-sm sm:text-base text-blue-100 max-w-2xl leading-relaxed">
              Layanan resmi pembayaran sekolah dengan verifikasi otomatis via QRIS, Virtual Account bank nasional (BCA, Mandiri, BRI, BNI), dan E-Wallet (Midtrans / Xendit).
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/pembayaran/riwayat"
              className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white font-bold px-5 py-3 rounded-2xl text-xs sm:text-sm border border-white/20 transition-all backdrop-blur-xs"
            >
              <History className="h-4 w-4" />
              <span>Cek Riwayat & Kwitansi</span>
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Konten 2 Kolom: Formulir Bayar (Kiri) & Ringkasan/Info Biaya (Kanan) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Kolom Kiri: Formulir Pembayaran */}
          <div className="lg:col-span-8">
            <Card className="p-6 sm:p-10 rounded-3xl border border-slate-200/90 shadow-lg bg-white space-y-8">
              <div className="border-b border-slate-100 pb-5">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  Formulir Pembayaran Sekolah
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Pilih jenis tagihan dan metode transfer online yang Anda inginkan.
                </p>
              </div>

              {formError && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
                  <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleCreatePayment} className="space-y-6">
                {/* 1. PILIH JENIS PEMBAYARAN */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                    1. Jenis Pembayaran
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentType("SPP")}
                      className={`p-4 rounded-2xl border-2 text-left transition-all flex items-start gap-3.5 ${
                        paymentType === "SPP"
                          ? "border-blue-600 bg-blue-50/70 shadow-sm"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          paymentType === "SPP"
                            ? "bg-blue-600 text-white shadow-xs"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-extrabold text-sm text-slate-900">SPP Bulanan</div>
                        <div className="text-xs text-blue-700 font-bold mt-0.5">Rp 350.000 / bulan</div>
                        <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                          Iuran operasional pembelajaran bulanan Kurikulum Merdeka.
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentType("UANG_GEDUNG")}
                      className={`p-4 rounded-2xl border-2 text-left transition-all flex items-start gap-3.5 ${
                        paymentType === "UANG_GEDUNG"
                          ? "border-blue-600 bg-blue-50/70 shadow-sm"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          paymentType === "UANG_GEDUNG"
                            ? "bg-blue-600 text-white shadow-xs"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <Building className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-extrabold text-sm text-slate-900">Uang Gedung & Sarana</div>
                        <div className="text-xs text-blue-700 font-bold mt-0.5">Mulai Rp 1.000.000</div>
                        <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                          Pengembangan sarana digital, lab komputer, dan lingkungan ramah anak.
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 2. PILIHAN PERIODE / SKEMA */}
                {paymentType === "SPP" ? (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Pilih Bulan Pembayaran SPP:</label>
                    <select
                      value={sppPeriod}
                      onChange={(e) => setSppPeriod(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    >
                      {MONTH_OPTIONS.map((m) => (
                        <option key={m} value={m}>
                          Bulan {m}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Pilihan Skema Uang Gedung:</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setBuildingPlan("LUNAS")}
                        className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                          buildingPlan === "LUNAS"
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-slate-50 text-slate-700 border-slate-200"
                        }`}
                      >
                        <div>Lunas Sekaligus</div>
                        <div className="text-xs opacity-90 mt-0.5">Rp 3.000.000</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setBuildingPlan("TAHAP_1")}
                        className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                          buildingPlan === "TAHAP_1"
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-slate-50 text-slate-700 border-slate-200"
                        }`}
                      >
                        <div>Cicilan Tahap 1</div>
                        <div className="text-xs opacity-90 mt-0.5">Rp 1.000.000 (Awal Tahun)</div>
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. IDENTITAS SISWA & ORANG TUA */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      2. Data Peserta Didik
                    </label>
                    <select
                      value={selectedStudentType}
                      onChange={(e) => handleStudentSelect(e.target.value)}
                      className="text-xs py-1 px-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-semibold"
                    >
                      {PRESET_STUDENTS.map((s, idx) => (
                        <option key={s.regNo} value={`PRESET_${idx}`}>
                          Pilih Cepat: {s.name}
                        </option>
                      ))}
                      <option value="MANUAL">+ Masukkan Data Lain / Siswa Baru</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="No. Registrasi / NISN Siswa"
                      required
                      value={studentRegistrationNumber}
                      onChange={(e) => setStudentRegistrationNumber(e.target.value)}
                      placeholder="Contoh: PPDB-2025-00001"
                      className="font-mono text-xs sm:text-sm h-11"
                    />

                    <Input
                      label="Nama Lengkap Siswa"
                      required
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="Contoh: Ahmad Rayhan Pratama"
                      className="text-xs sm:text-sm h-11"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Input
                      label="Kelas / Rombel"
                      required
                      value={studentClass}
                      onChange={(e) => setStudentClass(e.target.value)}
                      placeholder="Contoh: Kelas 1-A"
                      className="text-xs sm:text-sm h-11"
                    />

                    <Input
                      label="Nama Orang Tua / Wali"
                      required
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      placeholder="Contoh: Budi Santoso"
                      className="text-xs sm:text-sm h-11"
                    />

                    <Input
                      label="No. WhatsApp / HP"
                      required
                      type="tel"
                      value={parentPhone}
                      onChange={(e) => setParentPhone(e.target.value)}
                      placeholder="081234567890"
                      className="font-mono text-xs sm:text-sm h-11"
                    />
                  </div>
                </div>

                {/* 4. PILIHAN METODE PEMBAYARAN */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      3. Kanal & Metode Pembayaran
                    </label>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <span>Gateway:</span>
                      <select
                        value={paymentGateway}
                        onChange={(e) => setPaymentGateway(e.target.value as any)}
                        className="py-0.5 px-2 rounded-md border border-slate-200 text-xs font-bold text-blue-700"
                      >
                        <option value="MIDTRANS">Midtrans Snap</option>
                        <option value="XENDIT">Xendit Invoice</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { id: "QRIS", name: "QRIS Nasional", desc: "BCA, Livin, GoPay, OVO, ShopeePay" },
                      { id: "BCA_VA", name: "BCA Virtual Account", desc: "Verifikasi Otomatis 24 Jam" },
                      { id: "MANDIRI_VA", name: "Mandiri VA", desc: "Transfer Livin / ATM" },
                      { id: "BRI_VA", name: "BRI Virtual Account", desc: "BRIVA Otomatis" },
                      { id: "BNI_VA", name: "BNI Virtual Account", desc: "BNI Mobile / ATM" },
                      { id: "GOPAY", name: "GoPay / GoPayLater", desc: "Instan via Aplikasi" },
                      { id: "SHOPEEPAY", name: "ShopeePay", desc: "E-Wallet Shopee" },
                      { id: "OVO", name: "OVO E-Wallet", desc: "Pembayaran Dompet Digital" },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                        className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                          paymentMethod === m.id
                            ? "border-blue-600 bg-blue-50/80 ring-2 ring-blue-500/20"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div className="font-bold text-xs text-slate-900">{m.name}</div>
                        <div className="text-[10px] text-slate-500 mt-1 leading-tight">{m.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5. RINCIAN BIAYA & SUBMIT */}
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Biaya Tagihan ({paymentType === "SPP" ? `SPP ${currentPeriod}` : currentPeriod})</span>
                      <span className="font-semibold text-slate-900">{formatRupiah(currentAmount)}</span>
                    </div>
                    {currentAdminFee > 0 && (
                      <div className="flex justify-between text-slate-600">
                        <span>Biaya Administrasi Gateway ({paymentGateway})</span>
                        <span className="font-semibold text-slate-900">{formatRupiah(currentAdminFee)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-slate-200 text-sm sm:text-base font-black text-slate-900">
                      <span>Total Pembayaran</span>
                      <span className="text-blue-700">{formatRupiah(totalPayable)}</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={isSubmitting}
                    className="w-full gap-2 text-sm sm:text-base py-4 rounded-2xl font-black bg-blue-600 hover:bg-blue-700 shadow-md active:scale-98 transition-all"
                  >
                    <span>Lanjutkan Pembayaran Online</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* Kolom Kanan: Panduan & Info Transparansi Biaya */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="p-6 rounded-3xl border border-blue-200/80 bg-gradient-to-br from-blue-50 to-indigo-50/30 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 text-blue-900 font-bold text-sm">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
                <span>Pembayaran Resmi & Terverifikasi</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Setiap pembayaran yang diproses akan langsung diverifikasi otomatis oleh sistem gateway {paymentGateway}.
              </p>
              <ul className="text-xs text-slate-600 space-y-2 pl-4 list-disc">
                <li>Kwitansi sah diterbitkan langsung dalam format PDF standar A4.</li>
                <li>Tidak perlu konfirmasi manual jika menggunakan VA atau QRIS.</li>
                <li>Data transaksi tercatat rapi di buku kas digital sekolah.</li>
              </ul>
            </Card>

            <Card className="p-6 rounded-3xl border border-slate-200/80 bg-white shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <HelpCircle className="h-4 w-4 text-slate-600" />
                <h3 className="font-bold text-slate-900 text-sm">Pertanyaan Sering Diajukan</h3>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <h4 className="font-bold text-slate-900 mb-0.5">Bagaimana cara mengunduh kwitansi?</h4>
                  <p className="text-slate-600 leading-relaxed">
                    Setelah pembayaran dinyatakan LUNAS, tombol &ldquo;Cetak Kwitansi PDF&rdquo; akan langsung tampil di layar atau dapat dicek kapan saja di halaman Riwayat Transaksi.
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <h4 className="font-bold text-slate-900 mb-0.5">Apakah bisa membayar tunai di sekolah?</h4>
                  <p className="text-slate-600 leading-relaxed">
                    Bisa. Orang tua tetap dapat membayar tunai di ruang Tata Usaha, dan petugas admin akan mencatatkan kwitansi digital resmi untuk Anda.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* MODAL CHECKOUT PEMBAYARAN ONLINE (MIDTRANS / XENDIT PLACEHOLDER) */}
      {createdTransaction && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            {/* Header Modal */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                    Instruksi Pembayaran Gateway
                  </h3>
                  <p className="text-xs text-slate-500">
                    No. Invoice: <span className="font-mono font-bold">{createdTransaction.invoiceNumber}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCreatedTransaction(null)}
                className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body Modal */}
            <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
              {simulationSuccess || createdTransaction.status === "SUCCESS" ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="h-10 w-10" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-900">Pembayaran Berhasil Diverifikasi!</h4>
                    <p className="text-xs text-slate-600 max-w-xs mx-auto mt-1 leading-relaxed">
                      Kwitansi resmi elektronik telah diterbitkan dengan nomor{" "}
                      <strong className="text-slate-900">{createdTransaction.receiptNumber || "KW-RESMI"}</strong>.
                    </p>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                      href={`/pembayaran/kwitansi/${createdTransaction.invoiceNumber}`}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-md transition-all active:scale-95"
                    >
                      <Printer className="h-4 w-4" />
                      <span>Cetak & Unduh Kwitansi PDF</span>
                    </Link>
                    <Link
                      href="/pembayaran/riwayat"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-3 rounded-xl transition-all"
                    >
                      <span>Lihat Riwayat</span>
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  {/* Total Bayar Box */}
                  <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-100 text-center space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                      Total Nominal yang Harus Ditransfer
                    </span>
                    <div className="text-2xl sm:text-3xl font-black text-blue-900">
                      {formatRupiah(createdTransaction.totalAmount)}
                    </div>
                    <span className="text-[10px] text-slate-500 block">
                      Tagihan: {createdTransaction.paymentTitle}
                    </span>
                  </div>

                  {/* Tampilan Sesuai Metode */}
                  {createdTransaction.paymentMethod === "QRIS" ? (
                    <div className="text-center space-y-3 p-4 rounded-2xl border border-slate-200 bg-slate-50">
                      <p className="text-xs font-bold text-slate-700">Pindai QRIS Standar Bank Indonesia</p>
                      <div className="w-48 h-48 mx-auto bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center">
                        <img
                          src={
                            createdTransaction.qrCodeUrl ||
                            `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=QRIS_DEMO_${createdTransaction.invoiceNumber}`
                          }
                          alt="QRIS Pembayaran"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <p className="text-[10px] text-slate-500">
                        Buka aplikasi BCA, Mandiri Livin, BRImo, BNI Mobile, GoPay, OVO, atau ShopeePay
                      </p>
                    </div>
                  ) : createdTransaction.vaNumber ? (
                    <div className="space-y-2 p-4 rounded-2xl border border-slate-200 bg-slate-50 text-xs">
                      <span className="text-[11px] font-bold text-slate-500 uppercase">
                        Nomor Virtual Account ({createdTransaction.paymentMethod.replace("_", " ")})
                      </span>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200">
                        <span className="font-mono text-base font-black text-slate-900 tracking-wider">
                          {createdTransaction.vaNumber}
                        </span>
                        <Button
                          onClick={() => handleCopy(createdTransaction.vaNumber || "")}
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
                      <p className="text-[11px] text-slate-500">
                        Batas waktu pembayaran berlaku 24 jam ke depan.
                      </p>
                    </div>
                  ) : null}

                  {/* Simulator Sandbox Button */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Integrasi: {createdTransaction.paymentGateway} Simulator</span>
                      <span className="text-emerald-700 font-bold">Sandbox Mode</span>
                    </div>

                    <Button
                      onClick={handleSimulateSuccess}
                      disabled={isSimulating}
                      variant="primary"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-3.5 rounded-xl gap-2 shadow-md active:scale-98 transition-all"
                    >
                      {isSimulating ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                      <span>Selesaikan Pembayaran Sekarang (Test Mode)</span>
                    </Button>

                    <p className="text-[10px] text-slate-400 text-center leading-tight">
                      Gunakan tombol simulasi di atas untuk langsung menyelesaikan pembayaran di lingkungan test/sandbox dan menerbitkan kwitansi resmi PDF.
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

export default function PembayaranPage() {
  return (
    <React.Suspense
      fallback={
        <div className="py-24 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span>Memuat sistem pembayaran online...</span>
        </div>
      }
    >
      <PembayaranContent />
    </React.Suspense>
  );
}

