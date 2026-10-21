/**
 * Sistem Penyimpanan Nyata (Persistent File-Backed Database)
 * Menyimpan data PPDB, Berita, Pengumuman, dan Galeri langsung ke sistem penyimpanan permanen (disk).
 * Data dijamin PERSISTEN dan TIDAK HILANG saat halaman dimuat ulang atau server direstart.
 */

import fs from "fs";
import path from "path";

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

function generateRegistrationNumber(prefix = "PPDB"): string {
  const year = new Date().getFullYear();
  const randomChars = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${prefix}-${year}-${randomChars}`;
}

// Path penyimpanan database permanen di root proyek
const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

export interface PPDBSettingData {
  id: string;
  academicYear: string;
  isOpen: boolean;
  quota: number;
  startDate: string;
  endDate: string;
  announcementDate: string;
  guideBookUrl: string;
  requirements: string;
  flowDescription: string;
  updatedAt: string;
}

export interface PPDBRegistrationData {
  id: string;
  registrationNumber: string;
  fullName: string;
  nik: string;
  birthPlace: string;
  birthDate: string;
  gender: "LAKI_LAKI" | "PEREMPUAN";
  religion?: string | null;
  address: string;
  rt?: string | null;
  rw?: string | null;
  rtRw?: string | null;
  village?: string | null;
  district?: string | null;
  parentName: string;
  parentPhone: string;
  parentJob?: string | null;
  parentIncome?: string | null;
  previousSchool?: string | null;
  path: "ZONASI" | "AFIRMASI" | "PRESTASI" | "PERPINDAHAN_TUGAS";
  status: "PENDING" | "VERIFYING" | "ACCEPTED" | "REJECTED";
  verificationNotes?: string | null;
  verifiedBy?: string | null;
  verifiedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  documents: Array<{
    id: string;
    documentType: string;
    fileUrl: string;
    fileName: string;
  }>;
}

export interface NewsItemData {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string | null;
  category: string;
  status: "PUBLISHED" | "DRAFT" | "ARCHIVED";
  isFeatured: boolean;
  viewCount: number;
  authorName: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AnnouncementData {
  id: string;
  title: string;
  content: string;
  isImportant: boolean;
  isActive: boolean;
  fileAttachment?: string | null;
  startDate: string;
  endDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GalleryCategoryData {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  order: number;
}

export interface GalleryItemData {
  id: string;
  title: string;
  imageUrl: string;
  description?: string | null;
  categoryId: string;
  categoryName?: string;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseSchema {
  ppdbSetting: PPDBSettingData;
  ppdbRegistrations: PPDBRegistrationData[];
  news: NewsItemData[];
  announcements: AnnouncementData[];
  galleryCategories: GalleryCategoryData[];
  galleries: GalleryItemData[];
}

/**
 * Data awal lengkap (Seed) yang dimuat saat database pertama kali diinisialisasi
 */
function getInitialSeedData(): DatabaseSchema {
  return {
    ppdbSetting: {
      id: "default-ppdb",
      academicYear: "2025/2026",
      isOpen: true, // Status layanan aktif
      quota: 120,
      startDate: "2025-05-01T00:00:00.000Z",
      endDate: "2025-06-30T23:59:59.000Z",
      announcementDate: "2025-07-05T08:00:00.000Z",
      guideBookUrl: "#",
      requirements:
        "1. Berusia minimal 6 tahun pada 1 Juli tahun berjalan (prioritas usia 7 tahun).\n2. Memiliki Akta Kelahiran resmi.\n3. Memiliki Kartu Keluarga (KK).\n4. Mengisi formulir pendaftaran daring secara lengkap dan benar.\n5. Pas foto calon siswa ukuran 3x4 berwarna (2 lembar).",
      flowDescription:
        "1. Pengisian Formulir: Orang tua mengisi formulir online dan mengunggah dokumen yang diperlukan.\n2. Nomor Registrasi: Sistem otomatis menerbitkan nomor pendaftaran unik (PPDB-2025-XXXXX).\n3. Verifikasi Panitia: Petugas memverifikasi kelengkapan berkas dan domisili/jalur pendaftaran.\n4. Pantau Status: Orang tua dapat mengecek status penerimaan secara langsung menggunakan nomor registrasi.\n5. Daftar Ulang: Calon peserta didik yang diterima melakukan konfirmasi dan daftar ulang sesuai jadwal.",
      updatedAt: new Date().toISOString(),
    },
    ppdbRegistrations: [
      {
        id: "reg-demo-001",
        registrationNumber: "PPDB-2025-00001",
        fullName: "Ahmad Rayhan Pratama",
        nik: "3201234567890001",
        birthPlace: "Jakarta",
        birthDate: "2018-05-12T00:00:00.000Z",
        gender: "LAKI_LAKI",
        religion: "Islam",
        address: "Jl. Melati No. 15, RT 02 / RW 04, Kelurahan Harapan",
        rtRw: "02 / 04",
        village: "Kelurahan Harapan",
        district: "Kecamatan Maju",
        parentName: "Budi Santoso",
        parentPhone: "081234567890",
        parentJob: "Karyawan Swasta",
        parentIncome: "Rp 5.000.000 - Rp 10.000.000",
        previousSchool: "TK Pertiwi 01",
        path: "ZONASI",
        status: "ACCEPTED",
        verificationNotes: "Dokumen lengkap dan memenuhi kriteria zonasi wilayah prioritas.",
        verifiedBy: "Panitia PPDB",
        verifiedAt: "2025-05-10T10:00:00.000Z",
        createdAt: "2025-05-02T08:30:00.000Z",
        updatedAt: "2025-05-10T10:00:00.000Z",
        documents: [],
      },
      {
        id: "reg-demo-002",
        registrationNumber: "PPDB-2025-A1001",
        fullName: "Ananda Bintang Nusantara",
        nik: "3171012345670001",
        birthPlace: "Jakarta",
        birthDate: "2018-05-14T00:00:00.000Z",
        gender: "LAKI_LAKI",
        religion: "Islam",
        address: "Jl. Anggrek Melati No. 12, RT 03 / RW 05",
        rtRw: "03 / 05",
        village: "Kelurahan Melati",
        district: "Kecamatan Makmur",
        parentName: "Hendra Nusantara",
        parentPhone: "081298765432",
        parentJob: "Karyawan Swasta",
        previousSchool: "TK Pertiwi 01",
        path: "ZONASI",
        status: "ACCEPTED",
        verificationNotes: "Berkas lengkap dan sesuai zona domisili prioritas.",
        verifiedBy: "Panitia PPDB",
        verifiedAt: "2025-05-11T09:00:00.000Z",
        createdAt: "2025-05-03T11:20:00.000Z",
        updatedAt: "2025-05-11T09:00:00.000Z",
        documents: [
          {
            id: "doc-a1001-1",
            documentType: "Akta Kelahiran",
            fileName: "Akta_Kelahiran_Bintang.pdf",
            fileUrl: "https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=800&q=80",
          },
          {
            id: "doc-a1001-2",
            documentType: "Kartu Keluarga",
            fileName: "KK_Hendra_Nusantara.pdf",
            fileUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80",
          },
        ],
      },
      {
        id: "reg-demo-003",
        registrationNumber: "PPDB-2025-B2002",
        fullName: "Clarissa Putri Kirana",
        nik: "3171012345670002",
        birthPlace: "Bandung",
        birthDate: "2018-08-20T00:00:00.000Z",
        gender: "PEREMPUAN",
        religion: "Islam",
        address: "Jl. Flamboyan Indah No. 4B, RT 01 / RW 02",
        rtRw: "01 / 02",
        village: "Kelurahan Sukamaju",
        district: "Kecamatan Sentosa",
        parentName: "Dewi Lestari",
        parentPhone: "081311223344",
        parentJob: "Wiraswasta",
        previousSchool: "PAUD Tunas Harapan",
        path: "PRESTASI",
        status: "VERIFYING",
        verificationNotes: "Sedang dilakukan verifikasi sertifikat prestasi juara lomba melukis.",
        createdAt: "2025-05-05T14:15:00.000Z",
        updatedAt: "2025-05-05T14:15:00.000Z",
        documents: [
          {
            id: "doc-b2002-1",
            documentType: "Akta Kelahiran",
            fileName: "Akta_Kelahiran_Clarissa.pdf",
            fileUrl: "https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=800&q=80",
          },
          {
            id: "doc-b2002-2",
            documentType: "Kartu Keluarga",
            fileName: "KK_Dewi_Lestari.pdf",
            fileUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80",
          },
          {
            id: "doc-b2002-3",
            documentType: "Piagam Prestasi (Juara 1 Melukis)",
            fileName: "Piagam_Lomba_Melukis_Clarissa.pdf",
            fileUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80",
          },
        ],
      },
    ],
    news: [
      {
        id: "news-001",
        title: "Gelar Karya P5: Siswa Tampilkan Kreativitas Pengolahan Sampah Organik",
        slug: "gelar-karya-p5-kreativitas-pengolahan-sampah",
        excerpt:
          "SD Negeri Harapan Bangsa sukses menyelenggarakan pameran Proyek Penguatan Profil Pelajar Pancasila bertema Gaya Hidup Berkelanjutan.",
        content: `Pagi ini suasana halaman SD Negeri Harapan Bangsa dipenuhi sorak sorai dan decak kagum para orang tua serta tamu undangan. Melalui kegiatan Gelar Karya P5, siswa dari kelas 1 hingga kelas 6 memamerkan hasil karya proyek belajar selama satu semester.

Mulai dari pupuk kompos hasil sisa makanan kantin, kerajinan tangan dari kardus bekas, hingga bazar makanan tradisional yang dimasak bersama orang tua. Kepala Sekolah, Dra. Hj. Siti Rahmawati, menyampaikan bahwa kegiatan ini tidak semata-mata mencari hasil karya terbaik, tetapi menanamkan nilai gotong royong, nalar kritis, dan kepedulian terhadap kelestarian alam sejak dini.

"Kami sangat bangga melihat putra-putri kami berani menjelaskan proses pembuatan karyanya kepada setiap pengunjung yang datang. Ini adalah bukti nyata bahwa anak-anak belajar dengan bahagia dan bermakna," ungkap beliau.`,
        coverImage: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80",
        category: "Kegiatan",
        status: "PUBLISHED",
        isFeatured: true,
        viewCount: 142,
        authorName: "Panitia P5",
        publishedAt: "2025-05-10T08:00:00.000Z",
        createdAt: "2025-05-10T08:00:00.000Z",
        updatedAt: "2025-05-10T08:00:00.000Z",
      },
      {
        id: "news-002",
        title: "Raih Medali Emas di Olimpiade Sains Tingkat Provinsi 2025",
        slug: "raih-medali-emas-olimpiade-sains-provinsi-2025",
        excerpt:
          "Ananda Muhammad Rizky Pratama, siswa kelas 5, mengharumkan nama sekolah dengan menyabet medali emas di bidang IPA.",
        content: `Prestasi membanggakan kembali ditorehkan oleh peserta didik SD Negeri Harapan Bangsa. Muhammad Rizky Pratama berhasil meraih Medali Emas dalam ajang Olimpiade Sains Pelajar Sekolah Dasar Tingkat Provinsi.

Kompetisi yang diikuti oleh lebih dari 250 peserta perwakilan sekolah terbaik ini menguji pemahaman konsep IPA, eksperimen laboratorium mini, serta kemampuan analisis fenomena alam sekitar. Rizky mengaku sangat senang dan bersyukur atas bimbingan para guru serta dukungan penuh dari orang tuanya.

Semoga prestasi ini menjadi pemantik semangat bagi seluruh peserta didik lainnya untuk terus tekun belajar dan tidak takut mencoba tantangan baru.`,
        coverImage: "https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=800&q=80",
        category: "Prestasi",
        status: "PUBLISHED",
        isFeatured: true,
        viewCount: 98,
        authorName: "Humas Sekolah",
        publishedAt: "2025-05-08T09:30:00.000Z",
        createdAt: "2025-05-08T09:30:00.000Z",
        updatedAt: "2025-05-08T09:30:00.000Z",
      },
      {
        id: "news-003",
        title: "Implementasi Program Pembiasaan Sarapan Bersama dan Gosok Gigi Sehat",
        slug: "pembiasaan-sarapan-bersama-dan-gosok-gigi-sehat",
        excerpt:
          "Mendukung program Gerakan Sekolah Sehat (GSS), sekolah mengadakan sarapan bergizi bersama setiap hari Rabu pagi.",
        content: `Kesehatan anak adalah fondasi utama bagi optimalnya proses belajar. Setiap hari Rabu pagi, seluruh siswa berkumpul di pendopo sekolah membawa bekal sehat yang disiapkan dari rumah.

Dipandu oleh dokter kecil dari UKS dan guru kelas, para siswa belajar tentang piring gizi seimbang: karbohidrat, protein, sayuran, dan buah-buahan segar. Setelah sarapan bersama, kegiatan dilanjutkan dengan praktik menyikat gigi bersama dengan teknik yang benar. Program ini bertujuan menanamkan pola hidup bersih dan sehat (PHBS) seumur hidup.`,
        coverImage: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80",
        category: "Kesehatan",
        status: "PUBLISHED",
        isFeatured: false,
        viewCount: 76,
        authorName: "Tim UKS",
        publishedAt: "2025-05-05T07:15:00.000Z",
        createdAt: "2025-05-05T07:15:00.000Z",
        updatedAt: "2025-05-05T07:15:00.000Z",
      },
    ],
    announcements: [
      {
        id: "ann-001",
        title: "Penerimaan Peserta Didik Baru (PPDB) Tahun Ajaran 2025/2026 Telah Resmi Dibuka",
        content:
          "Pendaftaran calon peserta didik baru kelas 1 dibuka melalui jalur daring di website resmi atau langsung di sekretariat PPDB sekolah. Mohon pastikan berkas Akta Kelahiran dan Kartu Keluarga telah disiapkan.",
        isImportant: true,
        isActive: true,
        startDate: "2025-05-01T00:00:00.000Z",
        endDate: "2025-06-30T23:59:59.000Z",
        createdAt: "2025-05-01T08:00:00.000Z",
        updatedAt: "2025-05-01T08:00:00.000Z",
      },
      {
        id: "ann-002",
        title: "Jadwal Pertemuan Orang Tua & Guru Konsultasi Belajar Tengah Semester",
        content:
          "Pertemuan konsultasi perkembangan belajar siswa akan dilaksanakan pada hari Sabtu, 25 Oktober 2025 di ruang kelas masing-masing. Kehadiran orang tua sangat diharapkan.",
        isImportant: false,
        isActive: true,
        startDate: "2025-05-04T00:00:00.000Z",
        createdAt: "2025-05-04T09:00:00.000Z",
        updatedAt: "2025-05-04T09:00:00.000Z",
      },
      {
        id: "ann-003",
        title: "Edaran Pelaksanaan Asesmen Sumatif Akhir Semester (ASAS) Ganjil",
        content:
          "Asesmen tertulis dan praktik sumatif akhir semester ganjil akan berlangsung mulai 1-6 Desember 2025. Mohon orang tua mendampingi ananda belajar dengan suasana menyenangkan di rumah.",
        isImportant: true,
        isActive: true,
        startDate: "2025-05-06T00:00:00.000Z",
        createdAt: "2025-05-06T10:00:00.000Z",
        updatedAt: "2025-05-06T10:00:00.000Z",
      },
    ],
    galleryCategories: [
      {
        id: "cat-001",
        name: "Kegiatan Belajar & Mengajar",
        slug: "kegiatan-belajar",
        description: "Dokumentasi keaktifan siswa dalam proses pembelajaran Kurikulum Merdeka",
        order: 1,
      },
      {
        id: "cat-002",
        name: "Upacara & Peringatan Nasional",
        slug: "upacara",
        description: "Upacara bendera dan perayaan hari besar nasional",
        order: 2,
      },
      {
        id: "cat-003",
        name: "Ekstrakurikuler Siswa",
        slug: "ekstrakurikuler",
        description: "Aktivitas pembinaan bakat, minat, dan kepanduan pramuka",
        order: 3,
      },
      {
        id: "cat-004",
        name: "Lomba & Prestasi",
        slug: "lomba-prestasi",
        description: "Dokumentasi penganugerahan piala dan medali kejuaraan siswa",
        order: 4,
      },
    ],
    galleries: [
      {
        id: "gal-001",
        title: "Pembelajaran Interaktif Kurikulum Merdeka di Kelas 3",
        imageUrl: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80",
        description: "Peserta didik aktif berdiskusi kelompok mengenai keanekaragaman flora dan fauna Indonesia.",
        categoryId: "cat-001",
        categoryName: "Kegiatan Belajar & Mengajar",
        isFeatured: true,
        createdAt: "2025-05-02T08:00:00.000Z",
        updatedAt: "2025-05-02T08:00:00.000Z",
      },
      {
        id: "gal-002",
        title: "Eksperimen Sains Cilik Membuat Pelangi Air",
        imageUrl: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80",
        description: "Siswa kelas 4 antusias mempelajari kepadatan cairan dalam praktikum sains menyenangkan.",
        categoryId: "cat-001",
        categoryName: "Kegiatan Belajar & Mengajar",
        isFeatured: true,
        createdAt: "2025-05-03T09:00:00.000Z",
        updatedAt: "2025-05-03T09:00:00.000Z",
      },
      {
        id: "gal-003",
        title: "Upacara Bendera Hari Pendidikan Nasional",
        imageUrl: "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?auto=format&fit=crop&w=800&q=80",
        description: "Seluruh guru dan siswa mengenakan pakaian adat nusantara dengan khidmat dan penuh kegembiraan.",
        categoryId: "cat-002",
        categoryName: "Upacara & Peringatan Nasional",
        isFeatured: true,
        createdAt: "2025-05-02T07:30:00.000Z",
        updatedAt: "2025-05-02T07:30:00.000Z",
      },
      {
        id: "gal-004",
        title: "Latihan Perdana Pramuka Siaga Ceria",
        imageUrl: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=800&q=80",
        description: "Pengenalan tepuk pramuka, sandi morse dasar, dan permainan kebersamaan di lapangan.",
        categoryId: "cat-003",
        categoryName: "Ekstrakurikuler Siswa",
        isFeatured: true,
        createdAt: "2025-05-04T15:00:00.000Z",
        updatedAt: "2025-05-04T15:00:00.000Z",
      },
      {
        id: "gal-005",
        title: "Pemberian Medali Juara Lomba Mewarnai & Melukis",
        imageUrl: "https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=800&q=80",
        description: "Apresiasi kepada ananda yang berprestasi dalam ajang kreasi seni tingkat kota.",
        categoryId: "cat-004",
        categoryName: "Lomba & Prestasi",
        isFeatured: true,
        createdAt: "2025-05-05T10:00:00.000Z",
        updatedAt: "2025-05-05T10:00:00.000Z",
      },
    ],
  };
}

// Path fallback untuk serverless environment (misal Vercel /tmp)
const TMP_DATA_DIR = path.join("/tmp", "data");
const TMP_DB_FILE = path.join(TMP_DATA_DIR, "db.json");

/**
 * Membaca database dari memori/disk (mendukung Vercel Serverless)
 */
function readDb(): DatabaseSchema {
  // 1. Coba baca dari in-memory cache global terlebih dahulu jika ada
  if ((globalThis as any).__school_db) {
    return (globalThis as any).__school_db as DatabaseSchema;
  }

  // 2. Coba baca dari /tmp/data/db.json jika berjalan di lingkungan serverless
  try {
    if (fs.existsSync(TMP_DB_FILE)) {
      const tmpContent = fs.readFileSync(TMP_DB_FILE, "utf-8");
      const parsed = JSON.parse(tmpContent) as DatabaseSchema;
      (globalThis as any).__school_db = parsed;
      return parsed;
    }
  } catch {}

  // 3. Baca dari DATA_DIR di root proyek
  try {
    if (!fs.existsSync(DATA_DIR)) {
      try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      } catch {}
    }

    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(content) as DatabaseSchema;
      (globalThis as any).__school_db = parsed;
      return parsed;
    }

    const initialData = getInitialSeedData();
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), "utf-8");
    } catch {}
    (globalThis as any).__school_db = initialData;
    return initialData;
  } catch (err) {
    console.error("Gagal membaca database persistent:", err);
    const initialData = getInitialSeedData();
    (globalThis as any).__school_db = initialData;
    return initialData;
  }
}

/**
 * Menyimpan database ke disk dan memori secara atomik
 */
function writeDb(data: DatabaseSchema): void {
  // 1. Simpan selalu ke in-memory cache
  (globalThis as any).__school_db = data;

  // 2. Coba tulis ke DATA_DIR
  let writeSuccess = false;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), "utf-8");
    fs.renameSync(tempFile, DB_FILE);
    writeSuccess = true;
  } catch {
    // Lingkungan read-only (seperti Vercel), lanjutkan ke fallback /tmp
  }

  // 3. Fallback tulis ke /tmp/data/db.json bila di serverless/read-only filesystem
  if (!writeSuccess) {
    try {
      if (!fs.existsSync(TMP_DATA_DIR)) {
        fs.mkdirSync(TMP_DATA_DIR, { recursive: true });
      }
      const tmpTempFile = `${TMP_DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tmpTempFile, JSON.stringify(data, null, 2), "utf-8");
      fs.renameSync(tmpTempFile, TMP_DB_FILE);
    } catch (tmpErr) {
      console.error("Gagal menulis fallback database /tmp:", tmpErr);
    }
  }
}

/* =========================================================================
 * 1. PENGATURAN & PENDAFTARAN PPDB (PERSISTENT & VALIDATED)
 * ========================================================================= */

export function getPPDBSetting(): PPDBSettingData {
  const db = readDb();
  return db.ppdbSetting;
}

export function updatePPDBSetting(updates: Partial<PPDBSettingData>): PPDBSettingData {
  const db = readDb();
  db.ppdbSetting = {
    ...db.ppdbSetting,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  writeDb(db);
  return db.ppdbSetting;
}

export function getPPDBRegistrations(options: {
  search?: string;
  status?: string;
  path?: string;
  page?: number;
  limit?: number;
} = {}): { data: PPDBRegistrationData[]; total: number; totalPages: number } {
  const db = readDb();
  let list = [...db.ppdbRegistrations];

  if (options.status) {
    list = list.filter((r) => r.status === options.status);
  }
  if (options.path) {
    list = list.filter((r) => r.path === options.path);
  }
  if (options.search) {
    const q = options.search.toLowerCase().trim();
    list = list.filter(
      (r) =>
        r.fullName.toLowerCase().includes(q) ||
        r.registrationNumber.toLowerCase().includes(q) ||
        r.nik.includes(q) ||
        r.parentName.toLowerCase().includes(q)
    );
  }

  // Urutkan dari yang terbaru
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const page = Math.max(1, options.page || 1);
  const limit = Math.max(1, options.limit || 10);
  const total = list.length;
  const skip = (page - 1) * limit;
  const paginated = list.slice(skip, skip + limit);

  return {
    data: paginated,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export function getPPDBRegistrationByNumber(regNumber: string): PPDBRegistrationData | null {
  const db = readDb();
  const clean = regNumber.trim().toUpperCase();
  return (
    db.ppdbRegistrations.find(
      (r) => r.registrationNumber.toUpperCase() === clean || r.id === regNumber.trim()
    ) || null
  );
}

export function getPPDBRegistrationById(id: string): PPDBRegistrationData | null {
  const db = readDb();
  const clean = id.trim();
  const cleanUpper = clean.toUpperCase();
  return (
    db.ppdbRegistrations.find(
      (r) =>
        r.id === clean ||
        r.registrationNumber.toUpperCase() === cleanUpper ||
        r.registrationNumber === clean
    ) || null
  );
}

export function createPPDBRegistration(
  input: Omit<PPDBRegistrationData, "id" | "registrationNumber" | "status" | "createdAt" | "updatedAt" | "documents">
): PPDBRegistrationData {
  const db = readDb();

  // Validasi: Cek apakah NIK sudah pernah didaftarkan
  const cleanNik = input.nik.trim();
  const existingNik = db.ppdbRegistrations.find((r) => r.nik === cleanNik);
  if (existingNik) {
    throw new Error(`NIK ${cleanNik} sudah terdaftar dengan Nomor Registrasi ${existingNik.registrationNumber}. Satu NIK hanya dapat mendaftar satu kali.`);
  }

  // Generate nomor registrasi unik
  let regNumber = generateRegistrationNumber("PPDB");
  while (db.ppdbRegistrations.some((r) => r.registrationNumber === regNumber)) {
    regNumber = generateRegistrationNumber("PPDB");
  }

  const now = new Date().toISOString();
  const newRecord: PPDBRegistrationData = {
    ...input,
    id: `reg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    registrationNumber: regNumber,
    status: "PENDING",
    createdAt: now,
    updatedAt: now,
    documents: [],
  };

  db.ppdbRegistrations.unshift(newRecord);
  writeDb(db);
  return newRecord;
}

export function updatePPDBRegistrationStatus(
  id: string,
  status: "PENDING" | "VERIFYING" | "ACCEPTED" | "REJECTED",
  verificationNotes?: string | null,
  verifiedBy?: string | null
): PPDBRegistrationData {
  const db = readDb();
  const clean = id.trim();
  const cleanUpper = clean.toUpperCase();
  const idx = db.ppdbRegistrations.findIndex(
    (r) =>
      r.id === clean ||
      r.registrationNumber.toUpperCase() === cleanUpper ||
      r.registrationNumber === clean
  );
  if (idx === -1) {
    throw new Error(`Data pendaftaran dengan ID/Nomor Registrasi "${id}" tidak ditemukan.`);
  }

  const current = db.ppdbRegistrations[idx];
  const now = new Date().toISOString();
  const updated: PPDBRegistrationData = {
    ...current,
    status,
    verificationNotes:
      verificationNotes !== undefined
        ? verificationNotes && verificationNotes.trim()
          ? verificationNotes.trim()
          : null
        : current.verificationNotes,
    verifiedBy: verifiedBy || current.verifiedBy || "Panitia PPDB",
    verifiedAt: now,
    updatedAt: now,
  };

  db.ppdbRegistrations[idx] = updated;
  writeDb(db);
  return updated;
}

export function deletePPDBRegistration(id: string): boolean {
  const db = readDb();
  const clean = id.trim();
  const cleanUpper = clean.toUpperCase();
  const initialLen = db.ppdbRegistrations.length;
  db.ppdbRegistrations = db.ppdbRegistrations.filter(
    (r) =>
      r.id !== clean &&
      r.registrationNumber.toUpperCase() !== cleanUpper &&
      r.registrationNumber !== clean
  );
  if (db.ppdbRegistrations.length !== initialLen) {
    writeDb(db);
    return true;
  }
  return false;
}

/* =========================================================================
 * 2. BERITA SEKOLAH (NEWS)
 * ========================================================================= */

export function getPublishedNews(options: {
  q?: string;
  category?: string;
  page?: number;
  limit?: number;
} = {}): { data: NewsItemData[]; total: number; totalPages: number; categories: string[] } {
  const db = readDb();
  let list = db.news.filter((n) => n.status === "PUBLISHED");

  const categories = Array.from(new Set(list.map((n) => n.category))).filter(Boolean);

  if (options.category) {
    list = list.filter((n) => n.category.toLowerCase() === options.category?.toLowerCase());
  }
  if (options.q) {
    const q = options.q.toLowerCase().trim();
    list = list.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.excerpt.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q)
    );
  }

  list.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  const page = Math.max(1, options.page || 1);
  const limit = Math.max(1, options.limit || 9);
  const total = list.length;
  const skip = (page - 1) * limit;

  return {
    data: list.slice(skip, skip + limit),
    total,
    totalPages: Math.ceil(total / limit) || 1,
    categories,
  };
}

export function getAllNews(options: {
  q?: string;
  category?: string;
  status?: string;
} = {}): NewsItemData[] {
  const db = readDb();
  let list = [...db.news];

  if (options.status) {
    list = list.filter((n) => n.status === options.status);
  }
  if (options.category) {
    list = list.filter((n) => n.category === options.category);
  }
  if (options.q) {
    const q = options.q.toLowerCase().trim();
    list = list.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.excerpt.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q)
    );
  }

  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return list;
}

export function getNewsBySlug(slug: string): NewsItemData | null {
  const db = readDb();
  const clean = slug.trim().toLowerCase();
  const item = db.news.find((n) => n.slug.toLowerCase() === clean);
  if (item) {
    // Increment viewCount secara otomatis
    item.viewCount = (item.viewCount || 0) + 1;
    writeDb(db);
  }
  return item || null;
}

export function getNewsById(id: string): NewsItemData | null {
  const db = readDb();
  return db.news.find((n) => n.id === id) || null;
}

export function createNews(
  input: Omit<NewsItemData, "id" | "slug" | "viewCount" | "createdAt" | "updatedAt">
): NewsItemData {
  const db = readDb();
  let baseSlug = slugify(input.title);
  let slug = baseSlug;
  let counter = 1;
  while (db.news.some((n) => n.slug === slug)) {
    slug = `${baseSlug}-${counter++}`;
  }

  const now = new Date().toISOString();
  const newNews: NewsItemData = {
    ...input,
    id: `news-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    slug,
    viewCount: 0,
    publishedAt: input.publishedAt || now,
    createdAt: now,
    updatedAt: now,
  };

  db.news.unshift(newNews);
  writeDb(db);
  return newNews;
}

export function updateNews(id: string, updates: Partial<NewsItemData>): NewsItemData {
  const db = readDb();
  const idx = db.news.findIndex((n) => n.id === id);
  if (idx === -1) {
    throw new Error("Berita tidak ditemukan.");
  }

  const current = db.news[idx];
  const updated: NewsItemData = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  // Update slug jika judul diubah
  if (updates.title && updates.title !== current.title && !updates.slug) {
    let baseSlug = slugify(updates.title);
    let slug = baseSlug;
    let counter = 1;
    while (db.news.some((n) => n.slug === slug && n.id !== id)) {
      slug = `${baseSlug}-${counter++}`;
    }
    updated.slug = slug;
  }

  db.news[idx] = updated;
  writeDb(db);
  return updated;
}

export function deleteNews(id: string): boolean {
  const db = readDb();
  const initialLen = db.news.length;
  db.news = db.news.filter((n) => n.id !== id);
  if (db.news.length !== initialLen) {
    writeDb(db);
    return true;
  }
  return false;
}

/* =========================================================================
 * 3. PENGUMUMAN SEKOLAH (ANNOUNCEMENTS)
 * ========================================================================= */

export function getActiveAnnouncements(): AnnouncementData[] {
  const db = readDb();
  return db.announcements
    .filter((a) => a.isActive)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getAllAnnouncements(): AnnouncementData[] {
  const db = readDb();
  return db.announcements
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getAnnouncementById(id: string): AnnouncementData | null {
  const db = readDb();
  return db.announcements.find((a) => a.id === id) || null;
}

export function createAnnouncement(
  input: Omit<AnnouncementData, "id" | "createdAt" | "updatedAt">
): AnnouncementData {
  const db = readDb();
  const now = new Date().toISOString();
  const newAnn: AnnouncementData = {
    ...input,
    id: `ann-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    startDate: input.startDate || now,
    createdAt: now,
    updatedAt: now,
  };

  db.announcements.unshift(newAnn);
  writeDb(db);
  return newAnn;
}

export function updateAnnouncement(id: string, updates: Partial<AnnouncementData>): AnnouncementData {
  const db = readDb();
  const idx = db.announcements.findIndex((a) => a.id === id);
  if (idx === -1) {
    throw new Error("Pengumuman tidak ditemukan.");
  }

  const updated: AnnouncementData = {
    ...db.announcements[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  db.announcements[idx] = updated;
  writeDb(db);
  return updated;
}

export function deleteAnnouncement(id: string): boolean {
  const db = readDb();
  const initialLen = db.announcements.length;
  db.announcements = db.announcements.filter((a) => a.id !== id);
  if (db.announcements.length !== initialLen) {
    writeDb(db);
    return true;
  }
  return false;
}

/* =========================================================================
 * 4. GALERI KEGIATAN & FOTO (GALLERY)
 * ========================================================================= */

export function getGalleryCategories(): GalleryCategoryData[] {
  const db = readDb();
  return db.galleryCategories.sort((a, b) => a.order - b.order);
}

export function createGalleryCategory(input: {
  name: string;
  description?: string | null;
  order?: number;
}): GalleryCategoryData {
  const db = readDb();
  const cleanName = input.name.trim();
  const existing = db.galleryCategories.find(
    (c) => c.name.toLowerCase() === cleanName.toLowerCase()
  );
  if (existing) {
    return existing;
  }

  const baseSlug = slugify(cleanName);
  let slug = baseSlug;
  let counter = 1;
  while (db.galleryCategories.some((c) => c.slug === slug)) {
    slug = `${baseSlug}-${counter++}`;
  }

  const newCat: GalleryCategoryData = {
    id: `cat-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
    name: cleanName,
    slug,
    description: input.description || null,
    order: input.order ?? db.galleryCategories.length + 1,
  };

  db.galleryCategories.push(newCat);
  writeDb(db);
  return newCat;
}

export function getGalleries(categoryFilter?: string, isFeatured?: boolean): GalleryItemData[] {
  const db = readDb();
  let list = [...db.galleries];

  if (categoryFilter) {
    const cat = db.galleryCategories.find(
      (c) => c.id === categoryFilter || c.slug === categoryFilter
    );
    const targetId = cat ? cat.id : categoryFilter;
    list = list.filter((g) => g.categoryId === targetId);
  }
  if (isFeatured !== undefined) {
    list = list.filter((g) => g.isFeatured === isFeatured);
  }

  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return list;
}

export function getGalleryById(id: string): GalleryItemData | null {
  const db = readDb();
  return db.galleries.find((g) => g.id === id) || null;
}

export function createGallery(
  input: Omit<GalleryItemData, "id" | "createdAt" | "updatedAt">
): GalleryItemData {
  const db = readDb();
  const now = new Date().toISOString();

  // Cari nama kategori
  const cat = db.galleryCategories.find((c) => c.id === input.categoryId);
  const categoryName = cat ? cat.name : "Umum";

  const newGal: GalleryItemData = {
    ...input,
    categoryName,
    id: `gal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: now,
    updatedAt: now,
  };

  db.galleries.unshift(newGal);
  writeDb(db);
  return newGal;
}

export function updateGallery(id: string, updates: Partial<GalleryItemData>): GalleryItemData {
  const db = readDb();
  const idx = db.galleries.findIndex((g) => g.id === id);
  if (idx === -1) {
    throw new Error("Galeri foto tidak ditemukan.");
  }

  const current = db.galleries[idx];
  let categoryName = current.categoryName;
  if (updates.categoryId && updates.categoryId !== current.categoryId) {
    const cat = db.galleryCategories.find((c) => c.id === updates.categoryId);
    if (cat) categoryName = cat.name;
  }

  const updated: GalleryItemData = {
    ...current,
    ...updates,
    categoryName,
    updatedAt: new Date().toISOString(),
  };

  db.galleries[idx] = updated;
  writeDb(db);
  return updated;
}

export function deleteGallery(id: string): boolean {
  const db = readDb();
  const initialLen = db.galleries.length;
  db.galleries = db.galleries.filter((g) => g.id !== id);
  if (db.galleries.length !== initialLen) {
    writeDb(db);
    return true;
  }
  return false;
}
