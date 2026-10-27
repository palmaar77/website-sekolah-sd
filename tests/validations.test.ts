import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ppdbRegistrationSchema, checkPPDBStatusSchema } from "../src/lib/validations/ppdb.ts";
import { loginSchema } from "../src/lib/validations/auth.ts";
import { newsSchema } from "../src/lib/validations/news.ts";
import { contactMessageSchema } from "../src/lib/validations/contact.ts";
import { schoolProfileSchema } from "../src/lib/validations/profile.ts";

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

  it("harus meloloskan pendaftaran PPDB dengan kolom RT dan RW terpisah", () => {
    const dataWithSeparateRtRw = {
      fullName: "Nurul Aulia",
      nik: "3171012345670002",
      birthPlace: "Bandung",
      birthDate: "2018-06-15",
      gender: "PEREMPUAN" as const,
      address: "Jl. Dahlia No. 45",
      rt: "003",
      rw: "007",
      village: "Sukamaju",
      district: "Cibeunying",
      parentName: "Rudi Hidayat",
      parentPhone: "081312345678",
      path: "ZONASI" as const,
    };
    const result = ppdbRegistrationSchema.safeParse(dataWithSeparateRtRw);
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.rt, "003");
      assert.equal(result.data.rw, "007");
    }
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

  it("harus meloloskan formulir kontak tanpa subjek", () => {
    const messageWithoutSubject = {
      name: "Ibu Rahma",
      email: "rahma@gmail.com",
      message: "Selamat pagi, saya ingin menanyakan jadwal pendaftaran PPDB.",
      honeypot: "",
    };
    const result = contactMessageSchema.safeParse(messageWithoutSubject);
    assert.equal(result.success, true);
  });

  it("harus meloloskan pembaruan profil sekolah yang valid dan mengisi default hero", () => {
    const profileData = {
      schoolName: "SD Negeri Harapan Bangsa",
      npsn: "20109999",
      accreditation: "A",
      address: "Jl. Pendidikan No. 45",
      city: "Kota Contoh",
      province: "Provinsi Contoh",
      phone: "0215550199",
      email: "info@sdharapanbangsa.sch.id",
      principalName: "Dra. Hj. Siti Rahmawati",
      principalMessage: "Selamat datang di website kami.",
      vision: "Terwujudnya siswa beriman dan cerdas.",
      mission: "1. Menumbuhkan iman.",
      goals: "1. Berprestasi nasional.",
      history: "Didirikan tahun 1990.",
      studentCount: 500,
      teacherCount: 30,
      classroomCount: 20,
    };
    const result = schoolProfileSchema.safeParse(profileData);
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.heroHeadline, "Membentuk Generasi Cerdas, Berakhlak Mulia & Ceria");
      assert.equal(result.data.extracurricularCount, 12);
    }
  });

  it("harus menolak pembaruan profil sekolah jika email tidak valid", () => {
    const invalidProfile = {
      schoolName: "SD Negeri Harapan Bangsa",
      npsn: "20109999",
      accreditation: "A",
      address: "Jl. Pendidikan No. 45",
      city: "Kota Contoh",
      province: "Provinsi Contoh",
      phone: "0215550199",
      email: "bukan-email",
      principalName: "Dra. Hj. Siti Rahmawati",
      principalMessage: "Selamat datang di website kami.",
      vision: "Visi sekolah",
      mission: "Misi sekolah",
      goals: "Tujuan sekolah",
      history: "Sejarah sekolah",
    };
    const result = schoolProfileSchema.safeParse(invalidProfile);
    assert.equal(result.success, false);
  });
});
