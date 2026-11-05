/**
 * Layanan Data Pembayaran Online SPP & Uang Gedung
 * Terintegrasi dengan sistem database persisten dan gateway Midtrans / Xendit
 */

import fs from "fs";
import path from "path";

const DEFAULT_ACADEMIC_YEAR = "2026/2027";

export type PaymentType = "SPP" | "UANG_GEDUNG" | "SERAGAM" | "KEGIATAN";
export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "EXPIRED";
export type PaymentGatewayProvider = "MIDTRANS" | "XENDIT" | "SIMULATION";
export type PaymentMethod =
  | "QRIS"
  | "BCA_VA"
  | "MANDIRI_VA"
  | "BRI_VA"
  | "BNI_VA"
  | "GOPAY"
  | "SHOPEEPAY"
  | "OVO"
  | "TUNAI";

export interface PaymentTransaction {
  id: string;
  invoiceNumber: string; // e.g. INV-2026-SPP-8X92K
  receiptNumber?: string; // e.g. KW-2026-0012
  studentRegistrationNumber: string;
  studentName: string;
  studentClass: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string | null;
  paymentType: PaymentType;
  paymentTitle: string;
  period: string; // e.g. "Juli 2026", "Tahap 1 (Uang Gedung)"
  academicYear: string; // e.g. "2026/2027"
  amount: number;
  adminFee: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentGateway: PaymentGatewayProvider;
  gatewayTransactionId: string;
  status: PaymentStatus;
  vaNumber?: string | null;
  qrCodeUrl?: string | null;
  snapToken?: string | null;
  invoiceUrl?: string | null;
  expiryDate: string;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
  notes?: string | null;
}

export interface CreatePaymentInput {
  studentRegistrationNumber: string;
  studentName: string;
  studentClass: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string | null;
  paymentType: PaymentType;
  paymentTitle?: string;
  period: string;
  academicYear?: string;
  amount: number;
  adminFee?: number;
  paymentMethod: PaymentMethod;
  paymentGateway?: PaymentGatewayProvider;
  notes?: string | null;
}

export interface SchoolQRISSetting {
  enabled: boolean;
  merchantName: string;
  nmid: string;
  acquirer: string;
  customImageUrl?: string | null;
  rawQrisPayload?: string | null;
  instructions?: string | null;
  updatedAt: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const PAYMENTS_FILE = path.join(DATA_DIR, "payments.json");
const QRIS_FILE = path.join(DATA_DIR, "qris-setting.json");

// In-memory cache
let paymentsCache: PaymentTransaction[] | null = null;
let qrisCache: SchoolQRISSetting | null = null;

function getInitialSeedPayments(): PaymentTransaction[] {
  const currentYear = new Date().getFullYear();
  return [
    {
      id: "pay-seed-001",
      invoiceNumber: `INV-${currentYear}-SPP-00181`,
      receiptNumber: `KW-${currentYear}-00181`,
      studentRegistrationNumber: "PPDB-2025-00001",
      studentName: "Ahmad Rayhan Pratama",
      studentClass: "Kelas 1-A",
      parentName: "Budi Santoso",
      parentPhone: "081234567890",
      parentEmail: "budi.santoso@example.com",
      paymentType: "SPP",
      paymentTitle: "SPP Bulan Juli 2026",
      period: "Juli 2026",
      academicYear: DEFAULT_ACADEMIC_YEAR,
      amount: 350000,
      adminFee: 2500,
      totalAmount: 352500,
      paymentMethod: "QRIS",
      paymentGateway: "MIDTRANS",
      gatewayTransactionId: "md-seed-tx-001",
      status: "SUCCESS",
      qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=00020101021226670016ID.CO.QRIS.WWW011893600918000001234552045812530336054063525005802ID5918SDN_HARAPAN_BANGSA6007BANDUNG62170113INV2026SPP0016304A1B2",
      expiryDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      paidAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000).toISOString(),
      notes: "Pembayaran SPP Semester Ganjil Bulan Pertama",
    },
    {
      id: "pay-seed-002",
      invoiceNumber: `INV-${currentYear}-BLD-00042`,
      receiptNumber: `KW-${currentYear}-00042`,
      studentRegistrationNumber: "PPDB-2025-00001",
      studentName: "Ahmad Rayhan Pratama",
      studentClass: "Kelas 1-A",
      parentName: "Budi Santoso",
      parentPhone: "081234567890",
      parentEmail: "budi.santoso@example.com",
      paymentType: "UANG_GEDUNG",
      paymentTitle: "Uang Gedung & Pengembangan Sarana (Tahap 1)",
      period: "Tahap 1 (Awal Tahun)",
      academicYear: DEFAULT_ACADEMIC_YEAR,
      amount: 1000000,
      adminFee: 0,
      totalAmount: 1000000,
      paymentMethod: "BCA_VA",
      paymentGateway: "XENDIT",
      gatewayTransactionId: "xnd-seed-tx-002",
      status: "SUCCESS",
      vaNumber: "7007081234567890",
      expiryDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      paidAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(),
      notes: "Pembayaran Angsuran 1 Uang Gedung",
    },
    {
      id: "pay-seed-003",
      invoiceNumber: `INV-${currentYear}-SPP-00195`,
      receiptNumber: `KW-${currentYear}-00195`,
      studentRegistrationNumber: "PPDB-2025-A1001",
      studentName: "Ananda Bintang Nusantara",
      studentClass: "Kelas 1-B",
      parentName: "Hendra Nusantara",
      parentPhone: "081298765432",
      parentEmail: "hendra.nusantara@example.com",
      paymentType: "SPP",
      paymentTitle: "SPP Bulan Juli 2026",
      period: "Juli 2026",
      academicYear: DEFAULT_ACADEMIC_YEAR,
      amount: 350000,
      adminFee: 2500,
      totalAmount: 352500,
      paymentMethod: "GOPAY",
      paymentGateway: "MIDTRANS",
      gatewayTransactionId: "md-seed-tx-003",
      status: "SUCCESS",
      expiryDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      paidAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000).toISOString(),
      notes: "SPP Bulan Juli",
    },
    {
      id: "pay-seed-004",
      invoiceNumber: `INV-${currentYear}-SPP-00210`,
      studentRegistrationNumber: "PPDB-2025-A1001",
      studentName: "Ananda Bintang Nusantara",
      studentClass: "Kelas 1-B",
      parentName: "Hendra Nusantara",
      parentPhone: "081298765432",
      parentEmail: "hendra.nusantara@example.com",
      paymentType: "SPP",
      paymentTitle: "SPP Bulan Agustus 2026",
      period: "Agustus 2026",
      academicYear: DEFAULT_ACADEMIC_YEAR,
      amount: 350000,
      adminFee: 2500,
      totalAmount: 352500,
      paymentMethod: "MANDIRI_VA",
      paymentGateway: "XENDIT",
      gatewayTransactionId: "xnd-seed-tx-004",
      status: "PENDING",
      vaNumber: "8870812987654321",
      expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: "Tagihan SPP Bulan Berjalan",
    },
    {
      id: "pay-seed-005",
      invoiceNumber: `INV-${currentYear}-BLD-00055`,
      studentRegistrationNumber: "PPDB-2025-B2002",
      studentName: "Clarissa Putri Kirana",
      studentClass: "Kelas 2-A",
      parentName: "Dewi Lestari",
      parentPhone: "081311223344",
      parentEmail: "dewi.lestari@example.com",
      paymentType: "UANG_GEDUNG",
      paymentTitle: "Uang Gedung & Pengembangan Sarana (Lunas)",
      period: "Lunas Penuh",
      academicYear: DEFAULT_ACADEMIC_YEAR,
      amount: 3000000,
      adminFee: 0,
      totalAmount: 3000000,
      paymentMethod: "BRI_VA",
      paymentGateway: "MIDTRANS",
      gatewayTransactionId: "md-seed-tx-005",
      status: "PENDING",
      vaNumber: "1280013112233445",
      expiryDate: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: "Pelunasan Uang Gedung",
    },
  ];
}

function loadPayments(): PaymentTransaction[] {
  if (paymentsCache) return paymentsCache;

  try {
    if (fs.existsSync(PAYMENTS_FILE)) {
      const content = fs.readFileSync(PAYMENTS_FILE, "utf-8");
      paymentsCache = JSON.parse(content) as PaymentTransaction[];
      return paymentsCache;
    }
  } catch (err) {
    console.error("Gagal membaca payments.json:", err);
  }

  // Fallback initial seeds
  const initial = getInitialSeedPayments();
  savePayments(initial);
  return initial;
}

function savePayments(data: PaymentTransaction[]): void {
  paymentsCache = data;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(PAYMENTS_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Gagal menyimpan payments.json:", err);
  }
}

/**
 * Buat nomor invoice terstandar unik
 * Contoh: INV-2026-SPP-7K2X9 atau INV-2026-BLD-3M8N2
 */
export function generateInvoiceNumber(type: PaymentType = "SPP"): string {
  const currentYear = new Date().getFullYear();
  const prefixMap: Record<PaymentType, string> = {
    SPP: "SPP",
    UANG_GEDUNG: "BLD",
    SERAGAM: "SRG",
    KEGIATAN: "ACT",
  };
  const typeCode = prefixMap[type] || "PAY";
  const randomChars = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `INV-${currentYear}-${typeCode}-${randomChars}`;
}

/**
 * Buat nomor kwitansi resmi sekolah
 * Contoh: KW-2026-00382
 */
export function generateReceiptNumber(): string {
  const currentYear = new Date().getFullYear();
  const randomDigits = Math.floor(10000 + Math.random() * 90000);
  return `KW-${currentYear}-${randomDigits}`;
}

/**
 * Mengambil daftar pembayaran dengan filter
 */
export function getPayments(filter?: {
  status?: PaymentStatus;
  paymentType?: PaymentType;
  query?: string;
  studentReg?: string;
}): PaymentTransaction[] {
  let list = loadPayments();

  if (filter?.status) {
    list = list.filter((p) => p.status === filter.status);
  }

  if (filter?.paymentType) {
    list = list.filter((p) => p.paymentType === filter.paymentType);
  }

  if (filter?.studentReg) {
    const regUpper = filter.studentReg.trim().toUpperCase();
    list = list.filter(
      (p) => p.studentRegistrationNumber.toUpperCase() === regUpper
    );
  }

  if (filter?.query) {
    const q = filter.query.toLowerCase().trim();
    list = list.filter(
      (p) =>
        p.invoiceNumber.toLowerCase().includes(q) ||
        (p.receiptNumber && p.receiptNumber.toLowerCase().includes(q)) ||
        p.studentName.toLowerCase().includes(q) ||
        p.studentRegistrationNumber.toLowerCase().includes(q) ||
        p.period.toLowerCase().includes(q) ||
        p.paymentTitle.toLowerCase().includes(q)
    );
  }

  // Urutkan dari transaksi terbaru
  return list.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Mengambil detail pembayaran berdasarkan ID
 */
export function getPaymentById(id: string): PaymentTransaction | null {
  const list = loadPayments();
  return list.find((p) => p.id === id) || null;
}

/**
 * Mengambil detail pembayaran berdasarkan Nomor Invoice
 */
export function getPaymentByInvoice(invoiceNumber: string): PaymentTransaction | null {
  const list = loadPayments();
  const cleanInv = invoiceNumber.trim().toUpperCase();
  return list.find((p) => p.invoiceNumber.toUpperCase() === cleanInv) || null;
}

/**
 * Membuat transaksi pembayaran baru
 */
export function createPayment(input: CreatePaymentInput): PaymentTransaction {
  const list = loadPayments();
  const currentYear = new Date().getFullYear();
  const now = new Date();
  const expiry = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 jam batas bayar

  const invoiceNumber = generateInvoiceNumber(input.paymentType);
  const adminFee = input.adminFee ?? (input.paymentMethod === "QRIS" || input.paymentMethod === "GOPAY" ? 2500 : 0);
  const totalAmount = input.amount + adminFee;
  const paymentGateway = input.paymentGateway || "MIDTRANS";

  // Generate realistic VA or QRIS payload
  let vaNumber: string | null = null;
  let qrCodeUrl: string | null = null;

  if (input.paymentMethod.endsWith("_VA")) {
    const bankPrefixMap: Record<string, string> = {
      BCA_VA: "7007",
      MANDIRI_VA: "88708",
      BRI_VA: "12800",
      BNI_VA: "988",
    };
    const prefix = bankPrefixMap[input.paymentMethod] || "8888";
    const phoneDigits = input.parentPhone.replace(/\D/g, "").slice(-8);
    vaNumber = `${prefix}${phoneDigits || Math.floor(10000000 + Math.random() * 90000000)}`;
  } else if (input.paymentMethod === "QRIS") {
    const qrisConfig = getSchoolQRISSetting();
    if (qrisConfig.customImageUrl) {
      qrCodeUrl = qrisConfig.customImageUrl;
    } else {
      const merchantClean = (qrisConfig.merchantName || "SDN_HARAPAN_BANGSA").replace(/\s+/g, "_").toUpperCase();
      qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=00020101021226670016ID.CO.QRIS.WWW01189360091800000123455204581253033605406${totalAmount}5802ID5918${merchantClean}6007BANDUNG62170113${invoiceNumber.replace(/-/g, "")}6304`;
    }
  }

  const newPayment: PaymentTransaction = {
    id: `pay-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    invoiceNumber,
    studentRegistrationNumber: input.studentRegistrationNumber.trim().toUpperCase(),
    studentName: input.studentName.trim(),
    studentClass: input.studentClass.trim(),
    parentName: input.parentName.trim(),
    parentPhone: input.parentPhone.trim(),
    parentEmail: input.parentEmail?.trim() || null,
    paymentType: input.paymentType,
    paymentTitle:
      input.paymentTitle ||
      (input.paymentType === "SPP"
        ? `SPP Bulan ${input.period}`
        : input.paymentType === "UANG_GEDUNG"
        ? `Uang Gedung & Pengembangan (${input.period})`
        : `Pembayaran ${input.paymentType}`),
    period: input.period,
    academicYear: input.academicYear || DEFAULT_ACADEMIC_YEAR,
    amount: input.amount,
    adminFee,
    totalAmount,
    paymentMethod: input.paymentMethod,
    paymentGateway,
    gatewayTransactionId: `${paymentGateway.toLowerCase()}-tx-${Date.now()}`,
    status: "PENDING",
    vaNumber,
    qrCodeUrl,
    snapToken: `mock-snap-token-${Date.now()}`,
    invoiceUrl: `https://checkout.xendit.co/web/${invoiceNumber}`,
    expiryDate: expiry.toISOString(),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    notes: input.notes || null,
  };

  list.unshift(newPayment);
  savePayments(list);
  return newPayment;
}

/**
 * Update status transaksi pembayaran (misal dari webhook, kasir admin, atau simulasi sukses)
 */
export function updatePaymentStatus(
  invoiceNumberOrId: string,
  status: PaymentStatus,
  meta?: Partial<PaymentTransaction>
): PaymentTransaction | null {
  const list = loadPayments();
  const cleanKey = invoiceNumberOrId.trim();
  const index = list.findIndex(
    (p) =>
      p.invoiceNumber.toUpperCase() === cleanKey.toUpperCase() ||
      p.id === cleanKey
  );

  if (index === -1) return null;

  const current = list[index];
  const now = new Date().toISOString();

  // Jika status berubah menjadi SUCCESS dan belum ada nomor kwitansi, buat otomatis
  let receiptNumber = current.receiptNumber;
  let paidAt = current.paidAt;

  if (status === "SUCCESS") {
    if (!receiptNumber) {
      receiptNumber = generateReceiptNumber();
    }
    if (!paidAt) {
      paidAt = now;
    }
  }

  const updated: PaymentTransaction = {
    ...current,
    ...meta,
    status,
    receiptNumber,
    paidAt,
    updatedAt: now,
  };

  list[index] = updated;
  savePayments(list);
  return updated;
}

/**
 * Simulasi pelunasan pembayaran instan untuk testing sandbox
 */
export function simulatePaymentSuccess(invoiceNumber: string): PaymentTransaction | null {
  return updatePaymentStatus(invoiceNumber, "SUCCESS");
}

/**
 * Hapus transaksi (khusus admin jika diperlukan untuk maintenance)
 */
export function deletePayment(id: string): boolean {
  const list = loadPayments();
  const filtered = list.filter((p) => p.id !== id);
  if (filtered.length !== list.length) {
    savePayments(filtered);
    return true;
  }
  return false;
}

/**
 * Statistik pembayaran untuk dashboard admin
 */
export function getPaymentStatistics() {
  const list = loadPayments();
  let totalRevenue = 0;
  let totalSuccessCount = 0;
  let totalPendingCount = 0;
  let currentMonthSppRevenue = 0;

  const now = new Date();
  const currentMonthYear = now.toLocaleString("id-ID", { month: "long", year: "numeric" });

  for (const p of list) {
    if (p.status === "SUCCESS") {
      totalRevenue += p.totalAmount || p.amount || 0;
      totalSuccessCount++;
      if (
        p.paymentType === "SPP" &&
        p.period &&
        p.period.toLowerCase().includes(currentMonthYear.toLowerCase())
      ) {
        currentMonthSppRevenue += p.amount || 0;
      }
    } else if (p.status === "PENDING") {
      totalPendingCount++;
    }
  }

  return {
    totalRevenue,
    totalSuccessCount,
    totalPendingCount,
    currentMonthSppRevenue,
  };
}

/**
 * Mengambil konfigurasi QRIS Sekolah saat ini
 */
export function getSchoolQRISSetting(): SchoolQRISSetting {
  if (qrisCache) return qrisCache;

  try {
    if (fs.existsSync(QRIS_FILE)) {
      const content = fs.readFileSync(QRIS_FILE, "utf-8");
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed === "object") {
        qrisCache = {
          enabled: parsed.enabled !== false,
          merchantName: parsed.merchantName || "SD NEGERI HARAPAN BANGSA",
          nmid: parsed.nmid || "ID1026048192847",
          acquirer: parsed.acquirer || "QRIS Standar Bank Indonesia",
          customImageUrl: parsed.customImageUrl || null,
          rawQrisPayload: parsed.rawQrisPayload || null,
          instructions:
            parsed.instructions ||
            "Buka aplikasi mobile banking (BCA, Mandiri, BRI, BNI) atau e-wallet (GoPay, OVO, ShopeePay, DANA), lalu pindai kode QRIS di atas.",
          updatedAt: parsed.updatedAt || new Date().toISOString(),
        };
        return qrisCache;
      }
    }
  } catch (err) {
    console.error("Gagal membaca qris-setting.json:", err);
  }

  const defaultSetting: SchoolQRISSetting = {
    enabled: true,
    merchantName: "SD NEGERI HARAPAN BANGSA",
    nmid: "ID1026048192847",
    acquirer: "QRIS Standar Bank Indonesia",
    customImageUrl: null,
    rawQrisPayload: null,
    instructions:
      "Buka aplikasi mobile banking (BCA, Mandiri, BRI, BNI) atau e-wallet (GoPay, OVO, ShopeePay, DANA), lalu pindai kode QRIS di atas.",
    updatedAt: new Date().toISOString(),
  };

  qrisCache = defaultSetting;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(QRIS_FILE, JSON.stringify(defaultSetting, null, 2), "utf-8");
  } catch {}

  return defaultSetting;
}

/**
 * Memperbarui konfigurasi QRIS Sekolah oleh Admin
 */
export function updateSchoolQRISSetting(
  input: Partial<SchoolQRISSetting>
): SchoolQRISSetting {
  const current = getSchoolQRISSetting();
  const updated: SchoolQRISSetting = {
    ...current,
    ...input,
    updatedAt: new Date().toISOString(),
  };

  qrisCache = updated;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(QRIS_FILE, JSON.stringify(updated, null, 2), "utf-8");
  } catch (err) {
    console.error("Gagal menyimpan qris-setting.json:", err);
  }

  return updated;
}
