/**
 * Konfigurasi Terpusat Identitas, Kontak & Tahun Akademik Sekolah
 * File ini dirancang agar mudah disesuaikan per klien / institusi sekolah lain.
 * Cukup perbarui nilai di bawah ini untuk mengubah informasi di seluruh website.
 */

export const SCHOOL_CONFIG = {
  // Identitas Lembaga Pendidikan
  name: "SD Negeri Harapan Bangsa",
  shortName: "SDN Harapan Bangsa",
  npsn: "20109999",

  // Akreditasi Resmi
  accreditationGrade: "A",
  accreditationLabel: "Akreditasi A (Unggul)",
  accreditationPredicate: "Unggul",

  // Kontak Resmi Terpusat (Mudah diganti per klien)
  phone: "085788142995",
  whatsapp: "085788142995",
  email: "komarbee87@gmail.com",

  // Alamat & Lokasi
  address: "Jl. Pendidikan Karakter No. 45, Kompleks Edukasi Bahagia",
  city: "Jakarta Pusat",
  province: "DKI Jakarta",
  postalCode: "10110",

  // Jam Operasional Kantor
  officeHours: "Senin - Jumat: 07.00 - 15.00 WIB",

  // Pimpinan Sekolah
  principal: {
    name: "Dra. Hj. Siti Rahmawati, M.Pd.",
    nip: "19750512 200003 2 001",
    photo:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
    message:
      "Selamat datang di Website Resmi SD Negeri Harapan Bangsa. Kami berkomitmen mewujudkan lingkungan belajar yang menyenangkan, aman, dan berpusat pada anak. Melalui Kurikulum Merdeka yang diperkaya dengan pembiasaan nilai-nilai Profil Pelajar Pancasila, kami mendampingi setiap siswa mengenali potensi terbaiknya demi menyongsong masa depan yang gemilang dengan berakhlak mulia.",
  },

  // Tahun Akademik & PPDB Berjalan (Variabel Dinamis)
  academic: {
    currentYear: "2026/2027",
    ppdbYear: "2026/2027",
    ppdbCodePrefix: "PPDB-2026",
    activeSemester: "Ganjil",
    startYear: 2026,
    endYear: 2027,
  },

  // Media Sosial Sekolah
  social: {
    facebook: "https://facebook.com",
    instagram: "https://instagram.com",
    youtube: "https://youtube.com",
  },
} as const;

/**
 * Format nomor WhatsApp ke format internasional (misal 6285788142995)
 */
export function getWhatsAppNumber(phone: string = SCHOOL_CONFIG.whatsapp): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) {
    return `62${digits.slice(1)}`;
  }
  if (digits.startsWith("62")) {
    return digits;
  }
  return `62${digits}`;
}

/**
 * Buat tautan langsung ke WhatsApp chat dengan pesan pembuka opsional
 */
export function getWhatsAppUrl(
  message: string = "Halo Admin SD Harapan Bangsa, saya ingin bertanya seputar informasi sekolah.",
  phone: string = SCHOOL_CONFIG.whatsapp
): string {
  const cleanNumber = getWhatsAppNumber(phone);
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

/**
 * Bersihkan teks akreditasi agar terbebas dari duplikasi kata (misal: "Akreditasi Akreditasi" atau "Unggul Unggul")
 */
export function formatAccreditationText(rawAccreditation?: string | null): string {
  if (!rawAccreditation || rawAccreditation.trim() === "") {
    return SCHOOL_CONFIG.accreditationLabel;
  }

  // Jika sudah tepat "Akreditasi A (Unggul)"
  const trimmed = rawAccreditation.trim();
  if (trimmed === "Akreditasi A (Unggul)" || trimmed === "A (Unggul)") {
    return "Akreditasi A (Unggul)";
  }

  // Hilangkan prefix 'Akreditasi' (bahkan jika berulang) atau suffix '(Unggul)' yang berulang
  const cleaned = trimmed
    .replace(/^(Akreditasi\s*)+/gi, "")
    .replace(/(\(?Unggul\)?\s*)+/gi, "")
    .trim();

  return `Akreditasi ${cleaned || "A"} (Unggul)`;
}

/**
 * Bersihkan teks yang menandakan data contoh / demo dari database
 */
export function cleanDemoMarkers(text?: string | null): string {
  if (!text) return "";
  return text
    .replace(/\s*\((Contoh|Data Contoh|Sekolah Contoh|Contoh Pendaftar)\)/gi, "")
    .replace(/\s*•\s*Data Contoh/gi, "")
    .replace(/\bKota Contoh\b/gi, SCHOOL_CONFIG.city)
    .replace(/\bProvinsi Contoh\b/gi, SCHOOL_CONFIG.province)
    .trim();
}
