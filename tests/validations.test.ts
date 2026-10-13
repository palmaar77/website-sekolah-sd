import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ppdbRegistrationSchema, checkPPDBStatusSchema } from "../src/lib/validations/ppdb.ts";
import { loginSchema } from "../src/lib/validations/auth.ts";
import { newsSchema } from "../src/lib/validations/news.ts";
import { contactMessageSchema } from "../src/lib/validations/contact.ts";

describe("Validasi Formulir (Zod Schemas)", () => {
  it("harus meloloskan data pendaftaran PPDB yang valid", () => {
    const validData = {
      fullName: "Ahmad Rizky Pratama",
      nik: "3171012345670001",
      birthPlace: "Jakarta",
      birthDate: "2018-05-10",
      gender: "LAKI_LAKI" as const,
      address: "Jl. Pendidikan No. 12",
      parentName: "Hendra Pratama",
      parentPhone: "081298765432",
      path: "ZONASI" as const,
    };
    const result = ppdbRegistrationSchema.safeParse(validData);
    assert.equal(result.success, true);
  });

  it("harus menolak NIK yang kurang dari 16 digit atau mengandung huruf", () => {
    const invalidData = {
      fullName: "Ahmad Rizky",
      nik: "3171012345", // Hanya 10 digit
      birthPlace: "Jakarta",
      birthDate: "2018-05-10",
      gender: "LAKI_LAKI" as const,
      address: "Jl. Pendidikan No. 12",
      parentName: "Hendra",
      parentPhone: "081298765432",
      path: "ZONASI" as const,
    };
    const result = ppdbRegistrationSchema.safeParse(invalidData);
    assert.equal(result.success, false);
    if (!result.success) {
      assert.ok(result.error.flatten().fieldErrors.nik);
    }
  });

  it("harus menolak login admin dengan format email tidak valid", () => {
    const invalidLogin = {
      email: "bukan-email",
      password: "password123",
    };
    const result = loginSchema.safeParse(invalidLogin);
    assert.equal(result.success, false);
  });

  it("harus meloloskan login admin dengan email dan password valid", () => {
    const validLogin = {
      email: "admin@sdharapanbangsa.sch.id",
      password: "AdminSekolah2025!Secure",
    };
    const result = loginSchema.safeParse(validLogin);
    assert.equal(result.success, true);
  });

  it("harus menolak formulir kontak jika honeypot terisi (spam)", () => {
    const botMessage = {
      name: "Spammer Bot",
      email: "bot@spam.com",
      subject: "Buy cheap crypto",
      message: "Please click this link right now",
      honeypot: "i am a bot",
    };
    const result = contactMessageSchema.safeParse(botMessage);
    assert.equal(result.success, false);
  });

  it("harus meloloskan formulir kontak yang valid", () => {
    const humanMessage = {
      name: "Bapak Hendra",
      email: "hendra@gmail.com",
      subject: "Pertanyaan mengenai kuota PPDB Zonasi",
      message: "Selamat pagi, saya ingin menanyakan syarat pendaftaran anak saya.",
      honeypot: "",
    };
    const result = contactMessageSchema.safeParse(humanMessage);
    assert.equal(result.success, true);
  });
});
