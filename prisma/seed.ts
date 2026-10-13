import { PrismaClient, Role, ContentStatus, PPDBStatus, PPDBPath, Gender } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Memulai seeding database Sekolah Dasar...");

  // 1. Akun Admin Awal dari Environment Variables
  const adminEmail = process.env.ADMIN_EMAIL || "admin@sdharapanbangsa.sch.id";
  const adminPassword = process.env.ADMIN_PASSWORD || "AdminSekolah2025!Secure";
  const adminName = process.env.ADMIN_NAME || "Administrator Sekolah (Akun Demo)";

  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash: hashedPassword,
      name: adminName,
    },
    create: {
      email: adminEmail,
      name: adminName,
      passwordHash: hashedPassword,
      role: Role.SUPER_ADMIN,
    },
  });
  console.log(`✅ Admin terdaftar: ${admin.email}`);

  // 2. Profil Sekolah (Data Contoh / Demo)
  await prisma.schoolProfile.upsert({
    where: { id: "default-profile" },
    update: {},
    create: {
      id: "default-profile",
      schoolName: "SD Negeri Harapan Bangsa (Sekolah Contoh)",
      npsn: "20109999 (Data Contoh)",
      accreditation: "A (Unggul)",
      address: "Jl. Pendidikan Karakter No. 45, Kompleks Edukasi Bahagia",
      city: "Kota Contoh",
      province: "Provinsi Contoh",
      postalCode: "12345",
      phone: "(021) 555-0199",
      email: "info@sdharapanbangsa.sch.id",
      whatsapp: "081234567890",
      principalName: "Dra. Hj. Siti Rahmawati, M.Pd.",
      principalNip: "19750512 200003 2 001 (Contoh)",
      principalMessage:
        "Selamat datang di Website Resmi SD Negeri Harapan Bangsa. Kami berkomitmen mewujudkan lingkungan belajar yang menyenangkan, aman, dan berpusat pada anak. Melalui Kurikulum Merdeka yang diperkaya dengan pembiasaan nilai-nilai Profil Pelajar Pancasila, kami mendampingi setiap siswa mengenali potensi terbaiknya demi menyongsong masa depan yang gemilang dengan berakhlak mulia.",
      principalPhoto: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
      vision:
        "Terwujudnya peserta didik yang beriman, berakhlak mulia, cerdas, berkarakter, kreatif, dan berwawasan lingkungan global.",
      mission:
        "1. Menumbuhkembangkan keimanan dan ketakwaan melalui pembiasaan ibadah dan budi pekerti luhur.\n2. Menyelenggarakan pembelajaran Kurikulum Merdeka yang aktif, inovatif, dan berpusat pada peserta didik.\n3. Mengembangkan bakat, minat, dan potensi anak secara optimal melalui ragam ekstrakurikuler.\n4. Membangun lingkungan sekolah yang ramah anak, inklusif, bersih, sehat, dan asri.\n5. Meningkatkan kompetensi pendidik dan tenaga kependidikan secara berkelanjutan.",
      goals:
        "1. Seluruh lulusan memiliki fondasi literasi dan numerasi yang kokoh serta berkarakter Pancasila.\n2. Terciptanya suasana belajar yang membahagiakan (well-being anak terjamin).\n3. Meraih prestasi di bidang akademik maupun non-akademik di tingkat kota, provinsi, dan nasional.",
      history:
        "SD Negeri Harapan Bangsa didirikan sebagai wujud kepedulian terhadap pendidikan dasar bermutu di lingkungan masyarakat. Dari awal berdirinya dengan 6 rombongan belajar, kini sekolah telah berkembang menjadi institusi pendidikan ramah anak terkemuka dengan fasilitas pembelajaran modern dan tenaga pendidik berdedikasi tinggi.",
      heroHeadline: "Membentuk Generasi Cerdas, Berakhlak Mulia & Ceria",
      heroSubheadline:
        "Pendidikan dasar ramah anak dengan pendekatan Kurikulum Merdeka yang menumbuhkan rasa ingin tahu, empati, dan kreativitas putra-putri Anda.",
      studentCount: 480,
      teacherCount: 28,
      classroomCount: 18,
      extracurricularCount: 12,
      mapEmbedUrl:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126920.28587122116!2d106.759478!3d-6.229728!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f3e49fe3ddb3%3A0x7d6a42a19495000!2sJakarta!5e0!3m2!1sid!2sid!4v1620000000000!5m2!1sid!2sid",
      facebookUrl: "https://facebook.com",
      instagramUrl: "https://instagram.com",
      youtubeUrl: "https://youtube.com",
    },
  });
  console.log("✅ Profil Sekolah diperbarui");

  // 3. Fasilitas Sekolah
  const facilities = [
    {
      name: "Laboratorium Komputer & Koding",
      description: "Dilengkapi 30 unit komputer modern dan akses internet terproteksi untuk literasi digital anak.",
      imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80",
      iconName: "Laptop",
      order: 1,
    },
    {
      name: "Perpustakaan Ramah Anak 'Lentera Ilmu'",
      description: "Ribuan koleksi buku bacaan anak, ensiklopedia bergambar, area karpet santai, dan pojok dongeng.",
      imageUrl: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80",
      iconName: "BookOpen",
      order: 2,
    },
    {
      name: "Lapangan Olahraga & Upacara Serbaguna",
      description: "Lapangan luas berlantai aman untuk upacara bendera, senam bersama, futsal, dan basket.",
      imageUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80",
      iconName: "Activity",
      order: 3,
    },
    {
      name: "Unit Kesehatan Sekolah (UKS) Terstandar",
      description: "Ruang istirahat bersih dengan ranjang periksa, peralatan P3K lengkap, dan dokter kecil terlatih.",
      imageUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80",
      iconName: "HeartPulse",
      order: 4,
    },
    {
      name: "Taman Edukasi & Kebun Hidroponik Sains",
      description: "Sarana belajar luar ruang mengenal tanaman herbal, siklus kupu-kupu, dan pertanian hidroponik.",
      imageUrl: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80",
      iconName: "Sprout",
      order: 5,
    },
    {
      name: "Ruang Seni, Musik & Karawitan",
      description: "Peralatan gamelan mini, keyboard, pianika, dan alat lukis untuk mengekspresikan bakat seni.",
      imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
      iconName: "Music",
      order: 6,
    },
  ];

  for (const fac of facilities) {
    await prisma.facility.create({
      data: fac,
    });
  }
  console.log(`✅ ${facilities.length} Fasilitas ditambahkan`);

  // 4. Data Guru dan Tenaga Kependidikan
  const teachers = [
    {
      name: "Dra. Hj. Siti Rahmawati, M.Pd.",
      nip: "19750512 200003 2 001",
      role: "Kepala Sekolah",
      subject: "Manajemen Sekolah",
      education: "S2 Manajemen Pendidikan",
      photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
      order: 1,
    },
    {
      name: "Bambang Sudarmono, S.Pd.",
      nip: "19820315 200604 1 008",
      role: "Guru Kelas 1A",
      subject: "Tematik Fase A",
      education: "S1 PGSD Universitas Negeri",
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
      order: 2,
    },
    {
      name: "Nurul Aini, S.Pd., Gr.",
      nip: "19900822 201502 2 004",
      role: "Guru Kelas 2B",
      subject: "Tematik Fase A & Bahasa",
      education: "S1 PGSD Bersertifikat Pendidik",
      photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
      order: 3,
    },
    {
      name: "Ahmad Fauzi, S.Pd.I.",
      nip: "19881105 201403 1 005",
      role: "Guru Pendidikan Agama Islam",
      subject: "PAI & Budi Pekerti",
      education: "S1 Pendidikan Agama Islam",
      photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
      order: 4,
    },
    {
      name: "Rina Kusuma Dewi, S.Pd.",
      nip: "19930418 201902 2 010",
      role: "Guru PJOK",
      subject: "Pendidikan Jasmani & Kesehatan",
      education: "S1 Pendidikan Kepelatihan Olahraga",
      photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      order: 5,
    },
    {
      name: "Hendra Wijaya, S.Kom.",
      nip: "-",
      role: "Tenaga Kependidikan & IT",
      subject: "Pengelola Sistem & Laboratorium",
      education: "S1 Sistem Informasi",
      photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
      order: 6,
    },
  ];

  for (const t of teachers) {
    await prisma.teacher.create({ data: t });
  }
  console.log(`✅ ${teachers.length} Guru & Tenaga Kependidikan ditambahkan`);

  // 5. Kategori Galeri & Item Galeri
  const categories = [
    { name: "Kegiatan Belajar", slug: "kegiatan-belajar", order: 1 },
    { name: "Upacara & Peringatan", slug: "upacara", order: 2 },
    { name: "Lomba & Prestasi", slug: "lomba-prestasi", order: 3 },
    { name: "Ekstrakurikuler", slug: "ekstrakurikuler", order: 4 },
    { name: "Kegiatan Sosial", slug: "sosial", order: 5 },
  ];

  for (const cat of categories) {
    const createdCat = await prisma.galleryCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });

    if (cat.slug === "kegiatan-belajar") {
      await prisma.gallery.create({
        data: {
          title: "Pembelajaran Interaktif Kurikulum Merdeka di Kelas 3",
          imageUrl: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80",
          description: "Peserta didik aktif berdiskusi kelompok mengenai keanekaragaman flora dan fauna Indonesia.",
          categoryId: createdCat.id,
          isFeatured: true,
        },
      });
      await prisma.gallery.create({
        data: {
          title: "Eksperimen Sains Cilik Membuat Pelangi Air",
          imageUrl: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80",
          description: "Siswa kelas 4 antusias mempelajari kepadatan cairan dalam praktikum sains menyenangkan.",
          categoryId: createdCat.id,
          isFeatured: true,
        },
      });
    } else if (cat.slug === "upacara") {
      await prisma.gallery.create({
        data: {
          title: "Upacara Bendera Hari Pendidikan Nasional",
          imageUrl: "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?auto=format&fit=crop&w=800&q=80",
          description: "Seluruh guru dan siswa mengenakan pakaian adat nusantara dengan khidmat dan penuh kegembiraan.",
          categoryId: createdCat.id,
          isFeatured: true,
        },
      });
    } else if (cat.slug === "ekstrakurikuler") {
      await prisma.gallery.create({
        data: {
          title: "Latihan Perdana Pramuka Siaga Ceria",
          imageUrl: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=800&q=80",
          description: "Pengenalan tepuk pramuka, sandi morse dasar, dan permainan kebersamaan di lapangan.",
          categoryId: createdCat.id,
          isFeatured: true,
        },
      });
    } else if (cat.slug === "lomba-prestasi") {
      await prisma.gallery.create({
        data: {
          title: "Pemberian Medali Juara Lomba Mewarnai & Melukis",
          imageUrl: "https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=800&q=80",
          description: "Apresiasi kepada ananda yang berprestasi dalam ajang kreasi seni tingkat kota.",
          categoryId: createdCat.id,
          isFeatured: true,
        },
      });
    }
  }
  console.log("✅ Kategori & Galeri ditambahkan");

  // 6. Ekstrakurikuler
  const ekskuls = [
    {
      name: "Pramuka Siaga & Penggalang",
      description: "Membentuk kemandirian, kedisiplinan, cinta tanah air, dan keterampilan kepanduan.",
      coach: "Kak Ahmad & Kak Nurul",
      schedule: "Jumat, 14.00 - 16.00 WIB",
      image: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=600&q=80",
      category: "Kepanduan",
    },
    {
      name: "Robotika & Coding Dasar",
      description: "Belajar logika algoritma sederhana dengan Lego Education dan pemrograman blok visual ramah anak.",
      coach: "Kak Hendra Wijaya, S.Kom.",
      schedule: "Sabtu, 08.00 - 10.00 WIB",
      image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80",
      category: "Sains & Teknologi",
    },
    {
      name: "Seni Tari Tradisional Nusantara",
      description: "Melestarikan kekayaan budaya Indonesia melalui gerak tari daerah yang anggun dan riang.",
      coach: "Ibu Ratna Dewi, S.Sn.",
      schedule: "Rabu, 14.30 - 16.00 WIB",
      image: "https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=600&q=80",
      category: "Seni & Budaya",
    },
    {
      name: "Futsal Kids Champions",
      description: "Melatih motorik kasar, stamina fisik, sportivitas, dan kerja sama tim dalam olahraga futsal.",
      coach: "Coach Rina Kusuma, S.Pd.",
      schedule: "Selasa & Kamis, 15.30 - 17.00 WIB",
      image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=600&q=80",
      category: "Olahraga",
    },
  ];

  for (const e of ekskuls) {
    await prisma.extracurricular.create({ data: e });
  }
  console.log(`✅ ${ekskuls.length} Ekstrakurikuler ditambahkan`);

  // 7. Berita Sekolah
  const newsList = [
    {
      title: "Gelar Karya P5: Siswa Tampilkan Kreativitas Pengolahan Sampah Organik",
      slug: "gelar-karya-p5-kreativitas-pengolahan-sampah",
      excerpt: "SD Negeri Harapan Bangsa sukses menyelenggarakan pameran Proyek Penguatan Profil Pelajar Pancasila bertema Gaya Hidup Berkelanjutan.",
      content: `Pagi ini suasana halaman SD Negeri Harapan Bangsa dipenuhi sorak sorai dan decak kagum para orang tua serta tamu undangan. Melalui kegiatan Gelar Karya P5, siswa dari kelas 1 hingga kelas 6 memamerkan hasil karya proyek belajar selama satu semester.

Mulai dari pupuk kompos hasil sisa makanan kantin, kerajinan tangan dari kardus bekas, hingga bazar makanan tradisional yang dimasak bersama orang tua. Kepala Sekolah, Dra. Hj. Siti Rahmawati, menyampaikan bahwa kegiatan ini tidak semata-mata mencari hasil karya terbaik, tetapi menanamkan nilai gotong royong, nalar kritis, dan kepedulian terhadap kelestarian alam sejak dini.

"Kami sangat bangga melihat putra-putri kami berani menjelaskan proses pembuatan karyanya kepada setiap pengunjung yang datang. Ini adalah bukti nyata bahwa anak-anak belajar dengan bahagia dan bermakna," ungkap beliau.`,
      coverImage: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80",
      category: "Kegiatan",
      status: ContentStatus.PUBLISHED,
      isFeatured: true,
      authorId: admin.id,
    },
    {
      title: "Raih Medali Emas di Olimpiade Sains Tingkat Provinsi 2025",
      slug: "raih-medali-emas-olimpiade-sains-provinsi-2025",
      excerpt: "Ananda Muhammad Rizky Pratama, siswa kelas 5, mengharumkan nama sekolah dengan menyabet medali emas di bidang IPA.",
      content: `Prestasi membanggakan kembali ditorehkan oleh peserta didik SD Negeri Harapan Bangsa. Muhammad Rizky Pratama berhasil meraih Medali Emas dalam ajang Olimpiade Sains Pelajar Sekolah Dasar Tingkat Provinsi.

Kompetisi yang diikuti oleh lebih dari 250 peserta perwakilan sekolah terbaik ini menguji pemahaman konsep IPA, eksperimen laboratorium mini, serta kemampuan analisis fenomena alam sekitar. Rizky mengaku sangat senang dan bersyukur atas bimbingan para guru serta dukungan penuh dari orang tuanya.

Semoga prestasi ini menjadi pemantik semangat bagi seluruh peserta didik lainnya untuk terus tekun belajar dan tidak takut mencoba tantangan baru.`,
      coverImage: "https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=800&q=80",
      category: "Prestasi",
      status: ContentStatus.PUBLISHED,
      isFeatured: true,
      authorId: admin.id,
    },
    {
      title: "Implementasi Program Pembiasaan Sarapan Bersama dan Gosok Gigi Sehat",
      slug: "pembiasaan-sarapan-bersama-dan-gosok-gigi-sehat",
      excerpt: "Mendukung program Gerakan Sekolah Sehat (GSS), sekolah mengadakan sarapan bergizi bersama setiap hari Rabu pagi.",
      content: `Kesehatan anak adalah fondasi utama bagi optimalnya proses belajar. Setiap hari Rabu pagi, seluruh siswa berkumpul di pendopo sekolah membawa bekal sehat yang disiapkan dari rumah.

Dipandu oleh dokter kecil dari UKS dan guru kelas, para siswa belajar tentang piring gizi seimbang: karbohidrat, protein, sayuran, dan buah-buahan segar. Setelah sarapan bersama, kegiatan dilanjutkan dengan praktik menyikat gigi bersama dengan teknik yang benar. Program ini bertujuan menanamkan pola hidup bersih dan sehat (PHBS) seumur hidup.`,
      coverImage: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80",
      category: "Kesehatan",
      status: ContentStatus.PUBLISHED,
      isFeatured: false,
      authorId: admin.id,
    },
  ];

  for (const n of newsList) {
    await prisma.news.upsert({
      where: { slug: n.slug },
      update: {},
      create: n,
    });
  }
  console.log(`✅ ${newsList.length} Berita sekolah ditambahkan`);

  // 8. Pengumuman
  await prisma.announcement.create({
    data: {
      title: "Penerimaan Peserta Didik Baru (PPDB) Tahun Ajaran 2025/2026 Telah Dibuka",
      content:
        "Pendaftaran calon peserta didik baru kelas 1 dibuka melalui jalur daring di website resmi atau langsung di sekretariat PPDB sekolah. Pastikan berkas Akta Kelahiran dan Kartu Keluarga telah disiapkan.",
      isImportant: true,
      isActive: true,
    },
  });

  await prisma.announcement.create({
    data: {
      title: "Jadwal Pertemuan Orang Tua & Guru Evaluasi Tengah Semester",
      content:
        "Pertemuan konsultasi perkembangan belajar siswa akan dilaksanakan pada hari Sabtu, 25 Oktober 2025 di ruang kelas masing-masing. Kehadiran orang tua sangat diharapkan.",
      isImportant: false,
      isActive: true,
    },
  });
  console.log("✅ Pengumuman ditambahkan");

  // 9. Kalender Akademik
  const calendarEvents = [
    {
      semester: "Ganjil",
      academicYear: "2025/2026",
      eventDate: new Date("2025-07-14"),
      endDate: new Date("2025-07-16"),
      eventName: "Masa Pengenalan Lingkungan Sekolah (MPLS) Ramah Anak",
      description: "Pengenalan guru, kelas, fasilitas, dan tata tertib sekolah bagi siswa baru.",
      isHoliday: false,
    },
    {
      semester: "Ganjil",
      academicYear: "2025/2026",
      eventDate: new Date("2025-08-17"),
      eventName: "Upacara Peringatan HUT Kemerdekaan RI ke-80 & Lomba Tradisional",
      description: "Upacara bendera dan aneka perlombaan ketangkasan antar kelas.",
      isHoliday: true,
    },
    {
      semester: "Ganjil",
      academicYear: "2025/2026",
      eventDate: new Date("2025-09-22"),
      endDate: new Date("2025-09-26"),
      eventName: "Asesmen Sumatif Tengah Semester (ASTS) Ganjil",
      description: "Evaluasi capaian pembelajaran siswa pertengahan semester.",
      isHoliday: false,
    },
    {
      semester: "Ganjil",
      academicYear: "2025/2026",
      eventDate: new Date("2025-12-19"),
      eventName: "Pembagian Rapor Semester Ganjil & Gelar Karya",
      description: "Penerimaan laporan hasil belajar peserta didik oleh orang tua / wali.",
      isHoliday: false,
    },
  ];

  for (const c of calendarEvents) {
    await prisma.academicCalendar.create({ data: c });
  }
  console.log(`✅ ${calendarEvents.length} Agenda Kalender Akademik ditambahkan`);

  // 10. Prestasi Siswa
  const achievements = [
    {
      title: "Medali Emas Olimpiade Sains Pelajar (IPA)",
      studentName: "Muhammad Rizky Pratama (Kelas 5)",
      competition: "Olimpiade Sains Kuark Tingkat Provinsi",
      level: "Provinsi",
      rank: "Juara 1 (Medali Emas)",
      year: 2025,
      certificateImage: "https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=600&q=80",
    },
    {
      title: "Juara 2 Lomba Tari Tradisional FLS2N",
      studentName: "Tim Tari Cilik Harapan Bangsa (Kelas 4 & 5)",
      competition: "Festival Lomba Seni Siswa Nasional (FLS2N)",
      level: "Kota",
      rank: "Juara 2",
      year: 2024,
      certificateImage: "https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=600&q=80",
    },
  ];

  for (const a of achievements) {
    await prisma.achievement.create({ data: a });
  }
  console.log(`✅ ${achievements.length} Prestasi siswa ditambahkan`);

  // 11. Pengaturan PPDB
  await prisma.pPDBSetting.upsert({
    where: { id: "default-ppdb" },
    update: {},
    create: {
      id: "default-ppdb",
      academicYear: "2025/2026",
      isOpen: true,
      quota: 120,
      startDate: new Date("2025-05-01"),
      endDate: new Date("2025-06-30"),
      announcementDate: new Date("2025-07-05"),
      guideBookUrl: "#",
      requirements:
        "1. Berusia minimal 6 tahun pada 1 Juli tahun berjalan (prioritas usia 7 tahun).\n2. Memiliki Akta Kelahiran resmi.\n3. Memiliki Kartu Keluarga (KK).\n4. Mengisi formulir pendaftaran daring secara lengkap dan benar.\n5. Pas foto calon siswa ukuran 3x4 berwarna (2 lembar).",
      flowDescription:
        "1. Pengisian Formulir: Orang tua mengisi formulir online dan mengunggah dokumen yang diperlukan.\n2. Nomor Registrasi: Sistem otomatis menerbitkan nomor pendaftaran unik (PPDB-2025-XXXXX).\n3. Verifikasi Panitia: Petugas memverifikasi kelengkapan berkas dan domisili/jalur pendaftaran.\n4. Pantau Status: Orang tua dapat mengecek status penerimaan secara langsung menggunakan nomor registrasi.\n5. Daftar Ulang: Calon peserta didik yang diterima melakukan konfirmasi dan daftar ulang sesuai jadwal.",
    },
  });
  console.log("✅ Pengaturan PPDB diperbarui");

  // 12. Pendaftar PPDB Contoh (Data Dummy untuk Pengujian)
  const dummyPendaftar = [
    {
      registrationNumber: "PPDB-2025-A1001",
      fullName: "Ananda Bintang Nusantara (Contoh Pendaftar)",
      nik: "3171012345670001",
      birthPlace: "Jakarta",
      birthDate: new Date("2018-05-14"),
      gender: Gender.LAKI_LAKI,
      religion: "Islam",
      address: "Jl. Anggrek Melati No. 12, RT 03 / RW 05",
      parentName: "Hendra Nusantara",
      parentPhone: "081298765432",
      parentJob: "Karyawan Swasta",
      previousSchool: "TK Pertiwi 01",
      path: PPDBPath.ZONASI,
      status: PPDBStatus.ACCEPTED,
      verificationNotes: "Berkas lengkap dan sesuai zona domisili prioritas.",
    },
    {
      registrationNumber: "PPDB-2025-B2002",
      fullName: "Clarissa Putri Kirana (Contoh Pendaftar)",
      nik: "3171012345670002",
      birthPlace: "Bandung",
      birthDate: new Date("2018-08-20"),
      gender: Gender.PEREMPUAN,
      religion: "Islam",
      address: "Jl. Flamboyan Indah No. 4B, RT 01 / RW 02",
      parentName: "Dewi Lestari",
      parentPhone: "081311223344",
      parentJob: "Wiraswasta",
      previousSchool: "PAUD Tunas Harapan",
      path: PPDBPath.PRESTASI,
      status: PPDBStatus.VERIFYING,
      verificationNotes: "Sedang dilakukan verifikasi sertifikat prestasi juara lomba mewarnai.",
    },
    {
      registrationNumber: "PPDB-2025-C3003",
      fullName: "Dimas Aditya Saputra (Contoh Pendaftar)",
      nik: "3171012345670003",
      birthPlace: "Surabaya",
      birthDate: new Date("2018-11-02"),
      gender: Gender.LAKI_LAKI,
      religion: "Islam",
      address: "Jl. Kenanga Asri No. 88",
      parentName: "Agus Saputra",
      parentPhone: "081987654321",
      parentJob: "PNS",
      previousSchool: "TK Dharma Wanita",
      path: PPDBPath.ZONASI,
      status: PPDBStatus.PENDING,
      verificationNotes: null,
    },
  ];

  for (const p of dummyPendaftar) {
    await prisma.pPDBRegistration.upsert({
      where: { registrationNumber: p.registrationNumber },
      update: {},
      create: p,
    });
  }
  console.log(`✅ ${dummyPendaftar.length} Contoh Pendaftar PPDB ditambahkan`);

  console.log("🎉 Seeding database selesai dengan sukses!");
}

main()
  .catch((e) => {
    console.error("❌ Error saat seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
