# Website Profil & Informasi SD Negeri Harapan Bangsa

Sistem informasi profil sekolah dasar dan portal manajemen administrasi (PPDB Online, Berita, Pengumuman, Guru/Staf, Galeri, Fasilitas, & Pesan Kontak) yang modern, aman, responsif, dan siap produksi.

---

## 🚀 Fitur Unggulan

### 1. Portal Publik (Pengunjung & Wali Murid)
- **Beranda (`/`)**: Hero interaktif, sambutan Kepala Sekolah, quick stats sekolah, program unggulan, preview berita & agenda, testimoni, dan CTA pendaftaran.
- **Profil Sekolah (`/profil`)**: Sejarah, Visi, Misi, Tujuan strategis, Struktur organisasi, dan Fasilitas sarana prasarana sekolah.
- **Akademik & Kalender (`/akademik`)**: Kurikulum Merdeka, program ekstrakurikuler, kalender agenda akademik per semester, dan daftar prestasi siswa.
- **Berita & Artikel (`/berita`, `/berita/[slug]`)**: Pencarian berita, filter kategori, pagination, dan halaman baca artikel lengkap yang ramah SEO.
- **Pengumuman Resmi (`/pengumuman`)**: Papan pengumuman penting sekolah terintegrasi dengan filter pencarian dan tanggal rilis.
- **Galeri Foto Kegiatan (`/galeri`)**: Dokumentasi kegiatan belajar mengajar, ekstrakurikuler, dan peringatan hari besar dengan filter kategori.
- **Sistem PPDB Online (`/ppdb`)**:
  - Informasi persyaratan, jalur masuk (Zonasi, Afirmasi, Prestasi, Perpindahan), jadwal, kuota, dan FAQ interaktif.
  - Formulir pendaftaran multi-langkah online (`/ppdb/daftar`) dengan validasi NIK (16 digit) dan data lengkap orang tua/wali.
  - Penerbitan otomatis Nomor Registrasi resmi (`PPDB-YYYY-XXXXX`) dan bukti tanda terima cetak (`/ppdb/sukses`).
  - Halaman Mandiri Pengecekan Status Seleksi Calon Siswa (`/ppdb/status`).
- **Gerbang Login Terpadu (`/login` atau `/portal`)**: Pusat akses masuk bagi seluruh pengguna dengan pilihan peran: Portal Siswa/PPDB atau Portal Administrator/Guru.
- **Portal Khusus Siswa & Calon Siswa (`/siswa/login`, `/siswa/dashboard`)**:
  - Login mandiri menggunakan Nomor Registrasi PPDB & Nomor Kontak/WhatsApp wali murid.
  - Dashboard pribadi siswa: status kelulusan (Diterima, Menunggu, Ditolak), catatan panitia, biodata, dokumen terlampir, agenda MPLS/daftar ulang, dan cetak bukti registrasi.
- **Kontak & Pengaduan (`/kontak`)**: Informasi alamat, jam operasional, peta interaktif, dan formulir pesan dengan proteksi anti-spam Honeypot.

### 2. Portal Manajemen Admin CMS (`/admin`)
- **Autentikasi Aman**: Login admin (`/admin/login`) dengan verifikasi JWT berbasis HTTP-Only Secure Cookie, hashing password Bcrypt, dan brute-force rate limiter.
- **Dashboard Ringkasan (`/admin`)**: Statistik pengunjung, total pendaftar PPDB, berita aktif, dan pesan masuk.
- **Manajemen PPDB (`/admin/ppdb`)**: Verifikasi berkas, filter status (Pending, Terverifikasi, Diterima, Ditolak), update catatan verifikator, serta **Ekspor Data Pendaftar ke format CSV/Excel**.
- **Kelola Berita (`/admin/berita`)**: Form artikel lengkap dengan judul, slug otomatis, kategori, cover image, dan status publikasi.
- **Kelola Pengumuman (`/admin/pengumuman`)**: Publikasi pengumuman penting sekolah.
- **Kelola Tenaga Pendidik & Staf (`/admin/guru`)**: Manajemen data guru, NIP, mata pelajaran/jabatan, dan foto.
- **Kelola Galeri (`/admin/galeri`)**: Manajemen album dan foto dokumentasi kegiatan.
- **Kelola Profil & Fasilitas (`/admin/profil`)**: Update visi misi, profil kepala sekolah, data kontak, dan sarana prasarana.
- **Kelola Akademik (`/admin/akademik`)**: Kalender akademik dan ekstrakurikuler.
- **Kotak Masuk Pesan (`/admin/pesan`)**: Membaca dan mengelola pesan konsultasi dari masyarakat.
- **Pengaturan Akun & Audit Trail (`/admin/pengaturan`)**: Fitur ganti kata sandi admin dan riwayat log aktivitas pengguna.

---

## 🛠️ Tumpukan Teknologi (Tech Stack)

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS v4 + Lucide React Icons
- **Database**: PostgreSQL
- **ORM**: Prisma ORM 6.19
- **Autentikasi**: Jose HS256 JWT (HTTP-Only Cookie) + Bcryptjs
- **Validasi Data**: Zod
- **Testing**: Node Test Runner bawaan (`node --test`)

---

## 📦 Prasyarat Sistem

- **Node.js**: v20.0.0 atau lebih tinggi
- **Database PostgreSQL**: PostgreSQL 14+ (Lokal atau Cloud seperti [Neon.tech](https://neon.tech), [Supabase](https://supabase.com), atau [Railway](https://railway.app))

---

## ⚙️ Panduan Menjalankan di Komputer Lokal

### 1. Salin Berkas Environment
Pastikan file `.env` sudah terisi dengan kredensial database PostgreSQL Anda:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/sd_harapan_bangsa?schema=public"
JWT_SECRET="ganti-dengan-kunci-rahasia-jwt-minimal-32-karakter-acak"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
ADMIN_EMAIL="admin@sdharapanbangsa.sch.id"
ADMIN_PASSWORD="AdminSekolah2025!Secure"
```

### 2. Sinkronisasi Skema Database & Seeding Data Awal
Jalankan perintah berikut untuk menginisialisasi tabel-tabel di database dan mengisi konten demo resmi:
```bash
npx prisma db push
npm run seed
```

### 3. Jalankan Pengujian Otomatis (Opsional)
```bash
npm test
```
*Hasil: 13/13 unit test lolos verifikasi (validasi schema, enkripsi auth, utilitas formatting).*

### 4. Jalankan Development Server
```bash
npm run dev
```
Akses di peramban (browser):
- **Website Publik**: [http://localhost:3000](http://localhost:3000)
- **Portal Admin**: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

---

## 🔑 Kredensial Akun Administrator Awal

Setelah menjalankan `npm run seed`:
- **URL Login**: `http://localhost:3000/admin/login`
- **Email**: `admin@sdharapanbangsa.sch.id`
- **Password**: `AdminSekolah2025!Secure`

*(Kata sandi dapat diperbarui kapan saja melalui menu Pengaturan di Dashboard Admin).*

---

## 🚢 Panduan Deployment ke Production (Vercel + Neon/Supabase)

1. **Database Cloud**:
   - Buat database gratis di [Neon](https://neon.tech) atau [Supabase](https://supabase.com).
   - Ambil string koneksi PostgreSQL berawalan `postgresql://...`
2. **Push ke GitHub**:
   - Commit dan push repositori ke akun GitHub Anda.
3. **Import ke Vercel**:
   - Buka dashboard Vercel, pilih **Add New Project** -> Import repositori GitHub.
   - Tambahkan Environment Variables di Vercel:
     - `DATABASE_URL`
     - `JWT_SECRET`
     - `NEXT_PUBLIC_APP_URL` (contoh: `https://namasekolah.vercel.app`)
     - `ADMIN_EMAIL`
     - `ADMIN_PASSWORD`
4. **Deploy**:
   - Klik **Deploy**.
   - Setelah deploy selesai, jalankan seeding sekali melalui terminal lokal dengan mengarahkan `DATABASE_URL` ke database cloud:
     ```bash
     npx prisma db push
     npm run seed
     ```
