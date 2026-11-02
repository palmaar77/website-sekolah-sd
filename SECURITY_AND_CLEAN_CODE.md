# Dokumentasi Clean Code, Clean Structure & Implementasi OWASP Top 10
## SD Negeri Harapan Bangsa

Dokumen ini menjelaskan implementasi menyeluruh prinsip **Clean Code**, **Clean Architecture (Struktur Bersih)**, serta standar keamanan siber **OWASP Top 10 (Open Web Application Security Project)** pada aplikasi web SD Negeri Harapan Bangsa.

---

## 🏛️ 1. Clean Structure & Arsitektur Sistem

Aplikasi dibangun dengan pemisahan tanggung jawab (*Separation of Concerns*) berlapis untuk memastikan kemudahan pemeliharaan, keterbacaan, skalabilitas, dan pengujian independen.

```
src/
├── app/                              # Presentation & Routing Layer (Next.js App Router)
│   ├── (public)/                     # Halaman publik (Beranda, Profil, Akademik, Berita, PPDB, Kontak)
│   ├── admin/                        # Portal Administrator & CMS Management
│   ├── siswa/                        # Portal Siswa & Rapor Mandiri
│   ├── api/                          # Application Route Handlers
│   │   ├── admin/                    # Endpoint CMS & Manajemen Sekolah
│   │   ├── auth/                     # Autentikasi Admin & Siswa (Login, Logout, Me)
│   │   ├── contact/                  # Formulir Kontak Publik
│   │   ├── ppdb/                     # Pendaftaran & Pengecekan Status PPDB
│   │   ├── siswa/                    # Endpoint Data & Nilai Rapor Siswa
│   │   └── upload/                   # Manajemen Unggah Berkas Terlindungi
│   ├── globals.css                   # Desain & Utilitas Styling
│   ├── layout.tsx & error.tsx        # Shell Layout & Boundary Penanganan Error
│   └── middleware.ts                 # HTTP Middleware: Keamanan, Origin CSRF, & Otorisasi
│
├── components/                       # UI Component Layer (Realisasi Antarmuka)
│   ├── home/                         # Komponen Khusus Beranda
│   ├── layout/                       # Navbar, Footer, Sidebar, AdminNav
│   └── ui/                           # Komponen Primitif (Button, Modal, Input, Badge, Card)
│
├── lib/                              # Core Domain & Infrastructure Layer
│   ├── api-response.ts               # Clean Code Standardized API Response & Safe Error Handler
│   ├── audit.ts                      # Security Activity Logging & Audit Trail
│   ├── prisma.ts                     # Database Client (PostgreSQL ORM)
│   ├── rate-limit.ts                 # In-Memory Adaptive Rate Limiter
│   ├── utils.ts                      # Utilitas Umum (CSPRNG Registration Number, Formatting, Slug)
│   │
│   ├── auth/                         # Modul Autentikasi & Otorisasi
│   │   ├── jwt.ts                    # Jose JWT Signature & Verification (HS256)
│   │   ├── password.ts               # Bcrypt Password Hashing & Constant-time Verify
│   │   ├── rbac.ts                   # Role-Based Access Control Matrix & IDOR Guard
│   │   └── session.ts                # Pengelolaan Sesi Cookie Server-Side
│   │
│   ├── security/                     # Modul Pengamanan Siber OWASP
│   │   ├── headers.ts                # Standar Header Keamanan HTTP (CSP, HSTS, X-Frame-Options, dll.)
│   │   ├── sanitize.ts               # Sanitasi HTML/XSS, Anti-CSV Injection, Masking PII
│   │   └── csrf.ts                   # Validasi Same-Origin & Anti-CSRF Mutasi
│   │
│   ├── services/                     # Business Logic Layer
│   │   └── grades.ts                 # Perhitungan Nilai Rapor Kurikulum Merdeka
│   │
│   ├── storage/                      # Persistence Layer
│   │   └── db.ts                     # File-backed Storage Fallback & Operasi Sinkronisasi
│   │
│   └── validations/                  # Input Validation Layer (Zod Schemas)
│       ├── academic.ts               # Skema Kalender & Ekstrakurikuler
│       ├── auth.ts                   # Skema Login & Verifikasi
│       ├── contact.ts                # Skema Kontak & Honeypot
│       ├── gallery.ts                # Skema Galeri Foto
│       ├── news.ts                   # Skema Berita & Pengumuman
│       ├── ppdb.ts                   # Skema Registrasi & Cek Status PPDB
│       ├── profile.ts                # Skema Profil & Fasilitas Sekolah
│       └── teacher.ts                # Skema Guru & Tenaga Kependidikan
│
└── tests/                            # Automated Verification Test Suite (51 Unit Tests)
    ├── auth.test.ts                  # Uji Bcrypt Hashing & JWT Jose Sign/Verify
    ├── rbac-idor.test.ts             # Uji Matriks Izin RBAC & Proteksi IDOR
    ├── security-owasp.test.ts        # Uji OWASP Headers, Sanitasi XSS, Anti-CSV Injection, & Masking
    ├── storage-db.test.ts            # Uji Persistensi CRUD Penyimpanan
    ├── utils.test.ts                 # Uji CSPRNG, Format Tanggal Indo, & Rate Limiting
    └── validations.test.ts           # Uji Validasi Input Zod Schemas
```

---

## 🧼 2. Penerapan Prinsip Clean Code (SOLID & DRY)

### A. Single Responsibility Principle (SRP)
- **Route Handlers** (`src/app/api/...`): Hanya bertugas membaca request, mendelegasikan validasi ke Zod, memanggil business logic, dan mengembalikan response standar.
- **Validasi** (`src/lib/validations/...`): Terisolasi dalam skema Zod deklaratif dengan pesan error berbahasa Indonesia yang jelas.
- **Keamanan** (`src/lib/security/...`): Logika sanitasi, validasi origin CSRF, dan header keamanan terpisah dari kode bisnis.

### B. Don't Repeat Yourself (DRY) & Format Response Terpadu
Sebelumnya setiap endpoint menduplikasi penanganan try-catch dan struktur respon JSON. Seluruh API kini menggunakan helper terpadu dari `src/lib/api-response.ts`:

```typescript
// Respon Sukses (200 OK)
return apiSuccess(data, meta);

// Respon Sumber Daya Dibuat (201 Created)
return apiCreated(newItem, "Berita berhasil dibuat.");

// Respon Validasi Gagal (400 Bad Request)
return apiBadRequest("Data tidak lengkap", fieldErrors);

// Respon Belum Login (401 Unauthorized)
return apiUnauthorized();

// Respon Akses Ditolak (403 Forbidden)
return apiForbidden("Akses ditolak: Hanya admin yang berwenang.");

// Respon Tidak Ditemukan (404 Not Found)
return apiNotFound("Data tidak ditemukan.");

// Respon Pembatasan Frekuensi (429 Too Many Requests)
return apiTooManyRequests();

// Safe Error Handling Otomatis (ZodError, AuthorizationError, InternalError)
} catch (error) {
  return handleApiError(error, "Gagal memproses permintaan.");
}
```

Format JSON keluaran konsisten:
```json
{
  "success": true,
  "data": { ... },
  "meta": { ... }
}
```
Atau saat terjadi error:
```json
{
  "success": false,
  "code": "VALIDATION_ERROR",
  "message": "Data formulir tidak lengkap atau format salah.",
  "errors": {
    "nik": ["NIK harus terdiri dari tepat 16 digit angka"]
  }
}
```

---

## 🛡️ 3. Penerapan Standar Keamanan OWASP Top 10

Aplikasi telah mengintegrasikan mitigasi menyeluruh terhadap risiko keamanan web teratas:

### 🔴 A01: Broken Access Control (Kontrol Akses Rusak)
1. **Role-Based Access Control (RBAC) di Sisi Server**:
   - Hak akses divalidasi ketat di tingkat backend via fungsi `requireAuth(["SUPER_ADMIN", "ADMIN", "STAFF"])` dan `assertRole()`.
   - Siswa tidak dapat mengakses menu manajemen administrator sekolah.
2. **Proteksi IDOR (Insecure Direct Object Reference)**:
   - Pada endpoint `/api/siswa/nilai/[studentId]` dan `/api/siswa/data/[studentId]`, server memvalidasi kepemilikan data (`assertStudentOwnership`).
   - Jika akun siswa A mencoba mengakses data siswa B dengan memanipulasi nomor registrasi di URL, request langsung ditolak dengan status **403 Forbidden** (`IDOR_FORBIDDEN`).
3. **Proteksi Directory Traversal**:
   - Berkas yang diunggah tidak menggunakan nama file asli pengguna, melainkan diganti dengan `crypto.randomUUID()` dan ekstensi yang divalidasi ketat (`.jpg`, `.png`, `.webp`, `.pdf`).

### 🔴 A02: Cryptographic Failures (Kegagalan Kriptografi)
1. **Hashing Kata Sandi Kuat**: Menggunakan algoritma **Bcrypt** (`bcryptjs`) dengan salt rounds standar industri untuk mengamankan kata sandi administrator.
2. **Session Token JWT**: Menggunakan standar **Jose HS256** dengan kunci rahasia (*secret key*) 256-bit dan masa berlaku terbatas (24 jam untuk admin, 7 hari untuk portal siswa).
3. **CSPRNG (Cryptographically Secure Pseudo-Random Number Generator)**:
   - Pembuatan Nomor Registrasi Siswa (`generateRegistrationNumber`) tidak lagi menggunakan `Math.random()`, melainkan menggunakan `crypto.getRandomValues()` / `crypto.randomBytes()`.
4. **Penyensoran Data Sensitif Pribadi (PII Masking)**:
   - `maskNIK("3201234567890001")` menghasilkan `3201********0001`.
   - `maskPhone("081234567890")` menghasilkan `0812****7890`.
   - `maskEmail("admin@sdharapanbangsa.sch.id")` menghasilkan `a***n@sdharapanbangsa.sch.id`.

### 🔴 A03: Injection (Injeksi)
1. **SQL Injection Prevention**:
   - Seluruh interaksi basis data menggunakan **Prisma ORM** yang secara otomatis memanfaatkan *parameterized queries* / *prepared statements*, memblokir seluruh manipulasi kueri SQL mentah.
2. **Cross-Site Scripting (XSS) Sanitization**:
   - Utilitas `sanitizeInput()` dan `escapeHtml()` di `src/lib/security/sanitize.ts` membersihkan tag `<script>`, pseudo-protokol `javascript:`, serta meng-escape karakter berbahaya (`<`, `>`, `"`, `'`, `/`, `` ` ``).
   - Seluruh formulir input publik (Kontak, Pendaftaran PPDB, Berita, Pengumuman, Galeri, Fasilitas) dibersihkan sebelum disimpan ke basis data.
3. **Anti-CSV / Spreadsheet Formula Injection (CWE-1236)**:
   - Pada fitur ekspor data pendaftar PPDB ke Excel/CSV (`/api/admin/ppdb?format=csv`), setiap sel data calon siswa diproses melalui `sanitizeCsvCell()`.
   - Jika isian diawali karakter formula (`=`, `+`, `-`, `@`, `\t`, `\r`), sel otomatis diawali tanda kutip tunggal (`'`) agar spreadsheet merendernya sebagai teks murni dan tidak mengeksekusi perintah shell berbahaya.

### 🔴 A04: Insecure Design (Desain Tidak Aman)
1. **Multi-Tier Rate Limiting**:
   - Pembatasan frekuensi request adaptif di `src/lib/rate-limit.ts` untuk mencegah *resource exhaustion* dan serangan *Brute-Force*:
     - **Login Admin**: Maksimal 10 request per 15 menit per IP, dan 5 request gagal per alamat email.
     - **Login Siswa**: Maksimal 10 request per 15 menit per IP, dan 5 request per nomor registrasi.
     - **Pendaftaran PPDB**: Maksimal 5 pendaftaran per jam per IP.
     - **Formulir Kontak**: Maksimal 5 pesan per 10 menit per IP.
     - **Unggah Berkas**: Maksimal 20 unggahan per 10 menit per akun/IP.
2. **Proteksi Anti-Bot Honeypot**:
   - Formulir publik dilengkapi *honeypot trap field* tak terlihat. Jika bot spam mengisi field tersebut, formulir langsung digugurkan tanpa membebani database.

### 🔴 A05: Security Misconfiguration (Salah Konfigurasi Keamanan)
1. **OWASP HTTP Security Headers**:
   Diterapkan pada seluruh respon melalui `src/lib/security/headers.ts`, `src/middleware.ts`, dan `next.config.ts`:
   - `Content-Security-Policy`: Membatasi sumber skrip, iframe, font Google, dan gambar eksternal yang diizinkan.
   - `X-Frame-Options: DENY`: Memblokir serangan Clickjacking dengan melarang web di-embed dalam iframe luar.
   - `X-Content-Type-Options: nosniff`: Mencegah browser menebak (*sniffing*) tipe konten berkas.
   - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`: Memaksa peramban selalu menggunakan koneksi HTTPS terenkripsi.
   - `Referrer-Policy: strict-origin-when-cross-origin`: Menjaga privasi URL internal saat mengklik tautan luar.
   - `Permissions-Policy: camera=(), microphone=(), geolocation=()`: Membatasi izin akses sensor perangkat.
   - `X-XSS-Protection: 1; mode=block`: Mengaktifkan filter XSS browser.
2. **Information Disclosure Prevention**:
   - Opsi `poweredByHeader: false` diaktifkan di `next.config.ts` untuk menghapus header `X-Powered-By: Next.js`.
   - Seluruh detail stack trace database disembunyikan dari respon publik, digantikan pesan ramah pengguna.

### 🔴 A06: Vulnerable and Outdated Components (Komponen Rentan)
- Dependencies dikunci pada versi stabil (`package-lock.json`).
- Pemeriksaan berkala audit keamanan paket NPM (`npm audit`).
- Pengecekan statis TypeScript ketat (`npx tsc --noEmit`) tanpa celah tipe data.

### 🔴 A07: Identification and Authentication Failures (Kegagalan Autentikasi)
1. **Cookie Session Flags Aman**:
   - `httpOnly: true` (skrip JavaScript client tidak dapat membaca token, kebal terhadap pencurian cookie via XSS).
   - `secure: true` pada environment produksi (cookie hanya dikirim melalui koneksi HTTPS).
   - `sameSite: "lax"` (mencegah cookie terkirim pada request lintas situs yang tidak sah).
2. **Kebijakan Kompleksitas Kata Sandi**:
   - Pergantian kata sandi (`/api/admin/change-password`) mewajibkan minimal 8 karakter dengan kombinasi huruf dan angka atau simbol khusus.
3. **Session Invalidation**:
   - Endpoint logout menghapus session cookie dengan menyetel `maxAge: 0`.

### 🔴 A08: Software and Data Integrity Failures (Kegagalan Integritas Berkas & Data)
1. **Sandbox & Whitelist Unggah Berkas**:
   - Endpoint `/api/upload` hanya mengizinkan MIME type aman: `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `application/pdf`.
   - Format skrip berbahaya seperti `.php`, `.exe`, `.html`, `.svg` (vektor XSS), `.js` ditolak secara mutlak.
   - Ekstensi berkas dipetakan secara statis dari tipe MIME resmi yang divalidasi, bukan dari nama berkas kiriman pengguna.
   - Batas ukuran berkas dipatok maksimal 5MB.

### 🔴 A09: Security Logging and Monitoring Failures (Kegagalan Pencatatan Log)
1. **Audit Trail Komprehensif** (`src/lib/audit.ts`):
   - Mencatat setiap tindakan penting administrator:
     - `LOGIN`: Riwayat waktu masuk dan alamat IP admin.
     - `CHANGE_PASSWORD`: Pembaruan kata sandi akun.
     - `CREATE_NEWS` / `UPDATE_NEWS` / `DELETE_NEWS`: Jejak publikasi berita.
     - `UPDATE_PPDB_STATUS`: Riwayat verifikator berkas calon siswa.
     - `FILE_UPLOAD`: Nama berkas acak, ukuran, dan tipe berkas yang diunggah.
   - Data sensitif seperti kata sandi dan token tidak pernah dicatat dalam log.

### 🔴 A10: Server-Side Request Forgery (SSRF) & CSRF Mitigation
1. **Proteksi Anti-CSRF (Cross-Site Request Forgery)**:
   - `validateSameOrigin()` di `src/lib/security/csrf.ts` memvalidasi header `Origin` dan `Referer` pada setiap request mutasi HTTP (`POST`, `PUT`, `PATCH`, `DELETE`).
   - Request dari domain asing di luar domain resmi sekolah akan langsung diblokir di level middleware.
2. **SSRF Mitigation**:
   - Backend tidak mengizinkan pengguna meminta pemanggilan URL internal jaringan sekolah (privat IP / localhost).

---

## 🧪 4. Bukti Pengujian Otomatis (Test Verification)

Aplikasi memiliki pengujian unit menyeluruh menggunakan Node Test Runner bawaan (`node --test`). Seluruh pengujian lolos 100%:

```bash
$ npm test

▶ Autentikasi & Keamanan (Bcrypt & JWT Jose)
  ✔ harus mampu melakukan hash dan verifikasi kata sandi dengan benar
  ✔ harus mampu membuat dan memverifikasi JWT session token admin
  ✔ harus mampu membuat dan memverifikasi JWT session token siswa
  ✔ harus menolak token yang rusak atau dipalsukan
✔ Autentikasi & Keamanan (Bcrypt & JWT Jose)

▶ Proteksi IDOR & Otorisasi Server-Side (RBAC)
  ✔ harus MENGIZINKAN siswa membaca nilai dan data miliknya sendiri
  ✔ harus MENGIZINKAN siswa dengan format huruf kecil/spasi yang setara
  ✔ harus MEMBLOKIR (403 IDOR) jika siswa mencoba mengakses ID siswa lain
  ✔ harus MENGIZINKAN Administrator & Guru membaca nilai siswa mana pun
  ✔ harus MENOLAK (401) jika sesi kosong saat validasi kepemilikan
✔ Proteksi IDOR & Otorisasi Server-Side (RBAC)

▶ Role-Based Access Control (RBAC) Server Validation
  ✔ harus memvalidasi izin role Super Admin vs Staf vs Siswa
  ✔ harus melempar error ketika role tidak memenuhi kriteria assertRole
✔ Role-Based Access Control (RBAC) Server Validation

▶ Layanan Nilai Siswa (Kurikulum Merdeka)
  ✔ harus mengembalikan struktur rapor siswa lengkap dengan mata pelajaran dan KKM
✔ Layanan Nilai Siswa (Kurikulum Merdeka)

▶ Pembatasan Percobaan Login (Rate Limiter)
  ✔ harus membatasi login setelah melewati kuota percobaan
✔ Pembatasan Percobaan Login (Rate Limiter)

▶ OWASP Security Headers (A05: Security Misconfiguration)
  ✔ harus menyertakan seluruh header keamanan esensial OWASP
  ✔ harus menerapkan security headers ke Headers instance
✔ OWASP Security Headers (A05: Security Misconfiguration)

▶ OWASP Sanitization & XSS Mitigation (A03: Injection)
  ✔ harus melakukan escape terhadap karakter berbahaya HTML
  ✔ harus membersihkan script dan pseudo-protocol javascript:
  ✔ harus mampu melakukan sanitasi rekursif pada objek input
✔ OWASP Sanitization & XSS Mitigation (A03: Injection)

▶ Anti-CSV Formula Injection (CWE-1236)
  ✔ harus menyematkan tanda kutip tunggal untuk karakter pemicu formula spreadsheet
✔ Anti-CSV Formula Injection (CWE-1236)

▶ Perlindungan Data Sensitif & PII Masking
  ✔ harus menyensor NIK dengan pola 4 digit awal dan 4 digit akhir
  ✔ harus menyensor nomor telepon dengan aman
  ✔ harus menyensor email pengguna
✔ Perlindungan Data Sensitif & PII Masking

▶ OWASP CSRF & Same-Origin Validation
  ✔ harus mengizinkan request GET tanpa pengecekan origin
  ✔ harus meloloskan mutasi jika Origin cocok dengan Host
  ✔ harus MEMBLOKIR mutasi jika Origin berasal dari domain luar
✔ OWASP CSRF & Same-Origin Validation

▶ Clean Code Standardized API Responses
  ✔ harus menghasilkan response apiSuccess dengan status 200
  ✔ harus menghasilkan response apiCreated dengan status 201
  ✔ harus menghasilkan response status 400, 401, 403, 404, 429
  ✔ harus menangani AuthorizationError melalui handleApiError
✔ Clean Code Standardized API Responses

▶ Sistem Penyimpanan Nyata (Persistent DB)
  ✔ harus dapat membaca dan memperbarui konfigurasi PPDB (isOpen, kuota)
  ✔ harus mencatat pendaftaran PPDB baru dengan nomor unik dan data tidak hilang
  ✔ harus menolak duplikasi pendaftaran jika NIK sudah terdaftar
  ✔ harus menyajikan berita terpublikasi dan mencari berdasarkan slug
  ✔ harus menyajikan pengumuman yang aktif
  ✔ harus dapat menambah, membaca, dan menghapus foto galeri
✔ Sistem Penyimpanan Nyata (Persistent DB)

▶ Fungsi Utilitas & Rate Limiter
  ✔ harus menghasilkan slug yang ramah SEO dan bersih
  ✔ harus menghasilkan nomor registrasi unik dengan format yang benar (CSPRNG)
  ✔ harus memformat tanggal ke dalam bahasa Indonesia
  ✔ harus membatasi laju request ketika melewati batas rate limit
✔ Fungsi Utilitas & Rate Limiter

▶ Validasi Formulir (Zod Schemas)
  ✔ harus meloloskan data pendaftaran PPDB yang valid
  ✔ harus meloloskan pendaftaran PPDB dengan kolom RT dan RW terpisah
  ✔ harus menolak NIK yang kurang dari 16 digit atau mengandung huruf
  ✔ harus menolak login admin dengan format email tidak valid
  ✔ harus meloloskan login admin dengan email dan password valid
  ✔ harus menolak formulir kontak jika honeypot terisi (spam)
  ✔ harus meloloskan formulir kontak yang valid
  ✔ harus meloloskan formulir kontak tanpa subjek
  ✔ harus meloloskan pembaruan profil sekolah yang valid dan mengisi default hero
  ✔ harus menolak pembaruan profil sekolah jika email tidak valid
  ✔ harus meloloskan agenda kalender akademik yang valid
  ✔ harus menolak agenda kalender akademik jika eventName kosong
✔ Validasi Formulir (Zod Schemas)

ℹ tests 51
ℹ suites 14
ℹ pass 51
ℹ fail 0
```

---

## 📌 5. Checklist Pengembang untuk Penambahan Fitur Baru

Saat menambahkan fitur atau endpoint baru di masa mendatang, pastikan selalu mematuhi checklist ini:

1. [ ] **Validasi Skema Zod**: Definisikan skema input di `src/lib/validations/` dengan tipe data yang ketat dan pesan ramah.
2. [ ] **Sanitasi String Input**: Gunakan `sanitizeInput()` dari `@/lib/security/sanitize` sebelum menyimpan data ke database.
3. [ ] **Otorisasi Server-Side**: Gunakan `requireAuth(["SUPER_ADMIN", ...])` atau `assertStudentOwnership()` jika mengakses data spesifik siswa.
4. [ ] **Respon Seragam**: Kembalikan respon menggunakan `apiSuccess()`, `apiCreated()`, atau `apiBadRequest()` dari `@/lib/api-response`.
5. [ ] **Try-Catch Block**: Selalu bungkus route handler dengan `try ... catch (error) { return handleApiError(error); }`.
6. [ ] **Pencatatan Audit**: Panggil `logActivity()` untuk setiap operasi mutasi data (CREATE, UPDATE, DELETE).
7. [ ] **Ekspor CSV**: Selalu gunakan `sanitizeCsvCell()` pada kolom teks untuk mencegah Spreadsheet Formula Injection.
8. [ ] **Testing**: Tambahkan unit test di folder `tests/` dan jalankan `npm test` untuk memvalidasi fungsi baru.
