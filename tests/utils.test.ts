import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  slugify,
  generateRegistrationNumber,
  formatDateIndo,
  formatNumber,
} from "../src/lib/utils.ts";
import { checkRateLimit } from "../src/lib/rate-limit.ts";

describe("Fungsi Utilitas & Rate Limiter", () => {
  it("harus menghasilkan slug yang ramah SEO dan bersih", () => {
    const title = "Gelar Karya P5: Siswa Kelas 1 & 2 Juara!";
    const slug = slugify(title);
    assert.equal(slug, "gelar-karya-p5-siswa-kelas-1-2-juara");
  });

  it("harus menghasilkan nomor registrasi unik dengan format yang benar", () => {
    const reg1 = generateRegistrationNumber("PPDB");
    const reg2 = generateRegistrationNumber("PPDB");

    assert.ok(reg1.startsWith("PPDB-"));
    assert.ok(reg2.startsWith("PPDB-"));
    assert.notEqual(reg1, reg2); // Unik
  });

  it("harus memformat tanggal ke dalam bahasa Indonesia", () => {
    const date = new Date(2025, 6, 14); // 14 Juli 2025
    const formatted = formatDateIndo(date);
    assert.ok(formatted.includes("14") && formatted.includes("Juli") && formatted.includes("2025"));
  });

  it("harus membatasi laju request ketika melewati batas rate limit", () => {
    const testKey = `test-ip-${Date.now()}`;
    const opts = { limit: 3, windowMs: 10000 };

    // Request 1-3 harus berhasil
    const r1 = checkRateLimit(testKey, opts);
    assert.equal(r1.success, true);
    const r2 = checkRateLimit(testKey, opts);
    assert.equal(r2.success, true);
    const r3 = checkRateLimit(testKey, opts);
    assert.equal(r3.success, true);

    // Request 4 harus ditolak (melebihi batas 3)
    const r4 = checkRateLimit(testKey, opts);
    assert.equal(r4.success, false);
    assert.equal(r4.remaining, 0);
  });
});
