import test, { describe } from "node:test";
import assert from "node:assert/strict";
import {
  SCHOOL_CONFIG,
  getWhatsAppNumber,
  getWhatsAppUrl,
  formatAccreditationText,
  cleanDemoMarkers,
} from "../src/config/school.ts";

describe("Konfigurasi Terpusat Sekolah & Fungsi Pembantu", () => {
  test("harus memiliki nomor kontak terpusat yang sesuai", () => {
    assert.equal(SCHOOL_CONFIG.phone, "085788142995");
    assert.equal(SCHOOL_CONFIG.whatsapp, "085788142995");
    assert.equal(SCHOOL_CONFIG.email, "komarbee87@gmail.com");
  });

  test("harus memiliki tahun akademik berjalan 2026/2027", () => {
    assert.equal(SCHOOL_CONFIG.academic.currentYear, "2026/2027");
    assert.equal(SCHOOL_CONFIG.academic.ppdbYear, "2026/2027");
    assert.equal(SCHOOL_CONFIG.academic.ppdbCodePrefix, "PPDB-2026");
  });

  test("harus memformat nomor WhatsApp ke format internasional", () => {
    assert.equal(getWhatsAppNumber("085788142995"), "6285788142995");
    assert.equal(getWhatsAppNumber("6285788142995"), "6285788142995");
    const url = getWhatsAppUrl("Halo", "085788142995");
    assert.ok(url.startsWith("https://wa.me/6285788142995"));
    assert.ok(url.includes(encodeURIComponent("Halo")));
  });

  test("harus menormalkan teks akreditasi agar tidak dobel", () => {
    assert.equal(formatAccreditationText("A"), "Akreditasi A (Unggul)");
    assert.equal(formatAccreditationText("A (Unggul)"), "Akreditasi A (Unggul)");
    assert.equal(formatAccreditationText("Akreditasi A"), "Akreditasi A (Unggul)");
    assert.equal(formatAccreditationText("Akreditasi A (Unggul)"), "Akreditasi A (Unggul)");
    assert.equal(formatAccreditationText("Akreditasi Akreditasi A (Unggul)"), "Akreditasi A (Unggul)");
    assert.equal(formatAccreditationText(null), "Akreditasi A (Unggul)");
  });

  test("harus membersihkan penanda data contoh dari string", () => {
    assert.equal(cleanDemoMarkers("19750512 200003 2 001 (Contoh)"), "19750512 200003 2 001");
    assert.equal(cleanDemoMarkers("20109999 (Data Contoh)"), "20109999");
    assert.equal(cleanDemoMarkers("SD Negeri Harapan Bangsa (Sekolah Contoh)"), "SD Negeri Harapan Bangsa");
    assert.equal(cleanDemoMarkers("Akreditasi: A (Unggul) • Data Contoh"), "Akreditasi: A (Unggul)");
    assert.equal(cleanDemoMarkers("Kota Contoh"), SCHOOL_CONFIG.city);
    assert.equal(cleanDemoMarkers("Provinsi Contoh"), SCHOOL_CONFIG.province);
  });
});
