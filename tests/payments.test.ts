import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { formatRupiah, terbilang } from "../src/lib/utils.ts";
import { createPaymentSchema } from "../src/lib/validations/payment.ts";
import {
  getPayments,
  getPaymentByInvoice,
  createPayment,
  updatePaymentStatus,
  getPaymentStatistics,
  generateInvoiceNumber,
  generateReceiptNumber,
  generateStrukNumber,
  simulatePaymentSuccess,
  getSchoolQRISSetting,
  updateSchoolQRISSetting,
} from "../src/lib/services/payments.ts";

describe("Format Rupiah & Fungsi Terbilang Bahasa Indonesia", () => {
  it("harus memformat angka ke dalam format mata uang Rupiah standar", () => {
    assert.equal(formatRupiah(0), "Rp 0");
    assert.equal(formatRupiah(350000), "Rp 350.000");
    assert.equal(formatRupiah(2500000), "Rp 2.500.000");
    assert.equal(formatRupiah(15000000), "Rp 15.000.000");
  });

  it("harus mengonversi angka ke dalam ejaan terbilang bahasa Indonesia resmi", () => {
    assert.equal(terbilang(0), "Nol Rupiah");
    assert.equal(terbilang(1), "Satu Rupiah");
    assert.equal(terbilang(10), "Sepuluh Rupiah");
    assert.equal(terbilang(11), "Sebelas Rupiah");
    assert.equal(terbilang(15), "Lima Belas Rupiah");
    assert.equal(terbilang(100), "Seratus Rupiah");
    assert.equal(terbilang(125), "Seratus Dua Puluh Lima Rupiah");
    assert.equal(terbilang(1000), "Seribu Rupiah");
    assert.equal(terbilang(1500), "Seribu Lima Ratus Rupiah");
    assert.equal(terbilang(350000), "Tiga Ratus Lima Puluh Ribu Rupiah");
    assert.equal(terbilang(1000000), "Satu Juta Rupiah");
    assert.equal(terbilang(2500000), "Dua Juta Lima Ratus Ribu Rupiah");
  });
});

describe("Validasi Schema Pembayaran (Zod)", () => {
  it("harus meloloskan data pembayaran SPP yang lengkap dan valid", () => {
    const validSPP = {
      studentRegistrationNumber: "PPDB-2025-00001",
      studentName: "Ahmad Rayhan Pratama",
      studentClass: "Kelas 4-A",
      parentName: "Budi Pratama",
      parentPhone: "081234567890",
      parentEmail: "budi.pratama@example.com",
      paymentType: "SPP" as const,
      period: "November 2026",
      amount: 350000,
      paymentGateway: "MIDTRANS" as const,
      paymentMethod: "QRIS" as const,
      notes: "SPP Bulan November 2026",
    };

    const result = createPaymentSchema.safeParse(validSPP);
    assert.equal(result.success, true);
  });

  it("harus meloloskan data pembayaran Uang Gedung yang valid", () => {
    const validGedung = {
      studentRegistrationNumber: "PPDB-2025-00002",
      studentName: "Siti Aisyah Putri",
      studentClass: "Kelas 1-B",
      parentName: "Ahmad Dahlan",
      parentPhone: "085788142995",
      paymentType: "UANG_GEDUNG" as const,
      period: "Tahap 1 (Uang Gedung)",
      amount: 2500000,
      paymentGateway: "XENDIT" as const,
      paymentMethod: "BCA_VA" as const,
      notes: "Cicilan 1 Uang Gedung",
    };

    const result = createPaymentSchema.safeParse(validGedung);
    assert.equal(result.success, true);
  });

  it("harus menolak data pembayaran jika nominal non-positif atau nama siswa kosong", () => {
    const invalidData = {
      studentRegistrationNumber: "",
      studentName: "",
      studentClass: "",
      parentName: "",
      parentPhone: "abcd123", // invalid phone
      paymentType: "SPP",
      period: "",
      amount: -1000, // invalid amount
      paymentGateway: "MIDTRANS",
      paymentMethod: "QRIS",
    };

    const result = createPaymentSchema.safeParse(invalidData);
    assert.equal(result.success, false);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      assert.ok(fieldErrors.studentRegistrationNumber);
      assert.ok(fieldErrors.studentName);
      assert.ok(fieldErrors.parentPhone);
      assert.ok(fieldErrors.amount);
    }
  });
});

describe("Layanan Transaksi & Riwayat Pembayaran (Payment Services)", () => {
  it("harus menghasilkan format nomor invoice dan kwitansi yang rapi dan terstandar", () => {
    const invoice = generateInvoiceNumber("SPP");
    const receipt = generateReceiptNumber();

    assert.ok(invoice.startsWith("INV-2026-SPP-"));
    assert.ok(receipt.startsWith("KW-2026-"));
  });

  it("harus mampu membaca daftar transaksi pembayaran dan mencari berdasarkan invoice", () => {
    const payments = getPayments();
    assert.ok(Array.isArray(payments));
    assert.ok(payments.length >= 2, "Harus memiliki seed pembayaran minimal 2");

    const first = payments[0];
    const found = getPaymentByInvoice(first.invoiceNumber);
    assert.ok(found);
    assert.equal(found?.invoiceNumber, first.invoiceNumber);
    assert.ok(found?.studentName);
  });

  it("harus mampu membuat transaksi baru dengan status PENDING", () => {
    const newTx = createPayment({
      studentRegistrationNumber: "PPDB-TEST-0099",
      studentName: "Ananda Uji Coba",
      studentClass: "Kelas 2-C",
      parentName: "Wali Penguji",
      parentPhone: "081299998888",
      paymentType: "SPP",
      period: "Desember 2026",
      amount: 350000,
      paymentGateway: "MIDTRANS",
      paymentMethod: "BCA_VA",
      notes: "Uji Coba Transaksi Unit Test",
    });

    assert.ok(newTx.id);
    assert.ok(newTx.invoiceNumber.startsWith("INV-2026-SPP-"));
    assert.equal(newTx.status, "PENDING");
    assert.equal(newTx.amount, 350000);
    assert.ok(newTx.vaNumber, "Nomor Virtual Account harus terbuat untuk metode BCA_VA");

    // Verifikasi dapat dicari kembali
    const retrieved = getPaymentByInvoice(newTx.invoiceNumber);
    assert.ok(retrieved);
    assert.equal(retrieved?.id, newTx.id);
  });

  it("harus mampu memperbarui status pembayaran ke SUCCESS dan menerbitkan nomor kwitansi", () => {
    const created = createPayment({
      studentRegistrationNumber: "PPDB-TEST-0088",
      studentName: "Siswa Pelunasan",
      studentClass: "Kelas 3-A",
      parentName: "Orang Tua Siswa",
      parentPhone: "081211112222",
      paymentType: "UANG_GEDUNG",
      period: "Tahap 2",
      amount: 1500000,
      paymentGateway: "XENDIT",
      paymentMethod: "MANDIRI_VA",
    });

    assert.equal(created.status, "PENDING");
    assert.equal(created.receiptNumber, undefined);

    const paidTx = updatePaymentStatus(created.id, "SUCCESS");
    assert.ok(paidTx);
    assert.equal(paidTx?.status, "SUCCESS");
    assert.ok(paidTx?.receiptNumber?.startsWith("KW-2026-"));
    assert.ok(paidTx?.paidAt);
  });

  it("harus menghitung ringkasan statistik pemasukan dan transaksi dengan akurat", () => {
    const stats = getPaymentStatistics();
    assert.ok(stats.totalRevenue >= 0);
    assert.ok(stats.totalPendingCount >= 0);
    assert.ok(stats.totalSuccessCount >= 1);
  });
});

describe("Integrasi Gateway Pembayaran & Simulator Sandbox (Midtrans & Xendit)", () => {
  it("harus menghasilkan petunjuk checkout, nomor Virtual Account atau QRIS saat transaksi dibuat", () => {
    const tx = createPayment({
      studentRegistrationNumber: "PPDB-TEST-GW",
      studentName: "Siswa Gateway Test",
      studentClass: "Kelas 5-B",
      parentName: "Wali Gateway",
      parentPhone: "081233334444",
      paymentType: "SPP",
      period: "Oktober 2026",
      amount: 350000,
      paymentGateway: "MIDTRANS",
      paymentMethod: "QRIS",
    });

    assert.ok(tx.qrCodeUrl || tx.snapToken || tx.invoiceUrl);
    assert.equal(tx.paymentGateway, "MIDTRANS");
    assert.equal(tx.paymentMethod, "QRIS");
  });

  it("harus mampu melakukan simulasi pelunasan instan sandbox (simulatePaymentSuccess)", () => {
    const tx = createPayment({
      studentRegistrationNumber: "PPDB-TEST-SIM",
      studentName: "Siswa Simulasi Sukses",
      studentClass: "Kelas 6-A",
      parentName: "Wali Simulasi",
      parentPhone: "081255556666",
      paymentType: "SPP",
      period: "September 2026",
      amount: 350000,
      paymentGateway: "XENDIT",
      paymentMethod: "BCA_VA",
    });

    assert.equal(tx.status, "PENDING");

    const result = simulatePaymentSuccess(tx.invoiceNumber);
    assert.ok(result);
    assert.equal(result?.status, "SUCCESS");
    assert.ok(result?.receiptNumber);

    const verified = getPaymentByInvoice(tx.invoiceNumber);
    assert.equal(verified?.status, "SUCCESS");
  });
});

describe("Pengaturan & Kustomisasi QRIS Sekolah", () => {
  it("harus dapat membaca pengaturan default QRIS sekolah", () => {
    const qris = getSchoolQRISSetting();
    assert.ok(qris.merchantName);
    assert.ok(qris.nmid);
    assert.equal(typeof qris.enabled, "boolean");
  });

  it("harus dapat memperbarui nama merchant dan gambar QRIS kustom sekolah", () => {
    const updated = updateSchoolQRISSetting({
      merchantName: "SDN HARAPAN BANGSA REKENING UTAMA",
      nmid: "ID1029998887771",
      customImageUrl: "https://example.com/custom-qris-sekolah.png",
      acquirer: "Bank BJB",
    });

    assert.equal(updated.merchantName, "SDN HARAPAN BANGSA REKENING UTAMA");
    assert.equal(updated.nmid, "ID1029998887771");
    assert.equal(updated.customImageUrl, "https://example.com/custom-qris-sekolah.png");
    assert.equal(updated.acquirer, "Bank BJB");

    // Ketika transaksi QRIS baru dibuat, harus otomatis menggunakan customImageUrl
    const tx = createPayment({
      studentRegistrationNumber: "PPDB-TEST-QRIS",
      studentName: "Siswa Pembayar QRIS",
      studentClass: "Kelas 4-B",
      parentName: "Wali Siswa",
      parentPhone: "081277778888",
      paymentType: "SPP",
      period: "Desember 2026",
      amount: 350000,
      paymentGateway: "MIDTRANS",
      paymentMethod: "QRIS",
    });

    assert.equal(tx.qrCodeUrl, "https://example.com/custom-qris-sekolah.png");

    // Reset kembali ke bawaan
    const reset = updateSchoolQRISSetting({
      merchantName: "SD NEGERI HARAPAN BANGSA",
      customImageUrl: null,
    });
    assert.equal(reset.customImageUrl, null);
  });
});

describe("Fitur Struk Pembayaran & Generator Nomor Struk", () => {
  it("harus menghasilkan nomor struk yang terstandar dengan awalan STR-", () => {
    const strukFromInv = generateStrukNumber("INV-2026-SPP-00181");
    assert.equal(strukFromInv, "STR-2026-SPP-00181");

    const strukFromKw = generateStrukNumber(undefined, "KW-2026-99120");
    assert.equal(strukFromKw, "STR-2026-99120");

    const strukAuto = generateStrukNumber();
    assert.ok(strukAuto.startsWith("STR-"));
    const currentYear = new Date().getFullYear().toString();
    assert.ok(strukAuto.includes(currentYear));
  });

  it("harus menyajikan data pembayaran yang lengkap untuk dicetak dalam struk", () => {
    const tx = getPaymentByInvoice("INV-2026-SPP-00181");
    assert.ok(tx);
    if (tx) {
      assert.ok(tx.studentName);
      assert.ok(tx.studentRegistrationNumber);
      assert.ok(tx.totalAmount > 0);
      assert.ok(tx.paymentMethod);
      assert.equal(tx.status, "SUCCESS");
    }
  });
});

