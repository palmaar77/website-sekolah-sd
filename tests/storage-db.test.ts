import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import {
  getPPDBSetting,
  updatePPDBSetting,
  getPPDBRegistrations,
  getPPDBRegistrationByNumber,
  createPPDBRegistration,
  getPublishedNews,
  getNewsBySlug,
  getActiveAnnouncements,
  getGalleries,
  getGalleryCategories,
  createGallery,
  deleteGallery,
} from "../src/lib/storage/db.ts";

describe("Sistem Penyimpanan Nyata (Persistent DB)", () => {
  test("harus dapat membaca dan memperbarui konfigurasi PPDB (isOpen, kuota)", () => {
    const setting = getPPDBSetting();
    assert.ok(setting, "Setting PPDB harus tersedia");
    assert.equal(typeof setting.isOpen, "boolean");
    assert.ok(setting.quota > 0);

    const updated = updatePPDBSetting({ quota: 150 });
    assert.equal(updated.quota, 150);

    // Kembalikan ke 120
    updatePPDBSetting({ quota: 120 });
  });

  test("harus mencatat pendaftaran PPDB baru dengan nomor unik dan data tidak hilang", () => {
    const testNik = `3201${Date.now().toString().slice(-12)}`;
    const reg = createPPDBRegistration({
      fullName: "Test Siswa Baru",
      nik: testNik,
      birthPlace: "Jakarta",
      birthDate: "2018-01-01",
      gender: "LAKI_LAKI",
      religion: "Islam",
      address: "Jl. Pengujian No. 1",
      parentName: "Orang Tua Test",
      parentPhone: "081234567899",
      path: "ZONASI",
    });

    assert.ok(reg.id);
    assert.match(reg.registrationNumber, /^PPDB-\d{4}-[A-Z0-9]{5}$/);
    assert.equal(reg.status, "PENDING");

    // Cari kembali berdasarkan nomor registrasi
    const found = getPPDBRegistrationByNumber(reg.registrationNumber);
    assert.ok(found);
    assert.equal(found?.fullName, "Test Siswa Baru");
    assert.equal(found?.nik, testNik);
  });

  test("harus menolak duplikasi pendaftaran jika NIK sudah terdaftar", () => {
    const testNik = `3202${Date.now().toString().slice(-12)}`;
    // Pendaftaran pertama
    createPPDBRegistration({
      fullName: "Siswa Pertama",
      nik: testNik,
      birthPlace: "Bandung",
      birthDate: "2018-02-02",
      gender: "PEREMPUAN",
      address: "Jl. Pengujian No. 2",
      parentName: "Orang Tua 1",
      parentPhone: "081299998888",
      path: "ZONASI",
    });

    // Pendaftaran kedua dengan NIK sama harus ditolak
    assert.throws(
      () => {
        createPPDBRegistration({
          fullName: "Siswa Dobel NIK",
          nik: testNik,
          birthPlace: "Bandung",
          birthDate: "2018-02-02",
          gender: "PEREMPUAN",
          address: "Jl. Pengujian No. 2",
          parentName: "Orang Tua 2",
          parentPhone: "081299998888",
          path: "ZONASI",
        });
      },
      /sudah terdaftar/i
    );
  });

  test("harus menyajikan berita terpublikasi dan mencari berdasarkan slug", () => {
    const published = getPublishedNews({ limit: 5 });
    assert.ok(published.data.length > 0);
    assert.ok(published.total > 0);

    const first = published.data[0];
    const single = getNewsBySlug(first.slug);
    assert.ok(single);
    assert.equal(single?.title, first.title);
  });

  test("harus menyajikan pengumuman yang aktif", () => {
    const list = getActiveAnnouncements();
    assert.ok(Array.isArray(list));
    for (const a of list) {
      assert.equal(a.isActive, true);
    }
  });

  test("harus dapat menambah, membaca, dan menghapus foto galeri", () => {
    const categories = getGalleryCategories();
    assert.ok(categories.length > 0);

    const newPhoto = createGallery({
      title: "Foto Uji Otomatis",
      imageUrl: "https://example.com/test.jpg",
      description: "Deskripsi foto uji",
      categoryId: categories[0].id,
      isFeatured: false,
    });

    assert.ok(newPhoto.id);
    assert.equal(newPhoto.title, "Foto Uji Otomatis");

    const deleted = deleteGallery(newPhoto.id);
    assert.equal(deleted, true);
  });
});
