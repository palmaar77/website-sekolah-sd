import Link from "next/link";
import {
  GraduationCap,
  MapPin,
  Phone,
  Mail,
  Clock,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Kolom 1: Profil Singkat */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
                <GraduationCap className="h-6 w-6 text-amber-400" />
              </div>
              <span className="font-extrabold text-lg text-white tracking-tight">
                SDN HARAPAN BANGSA
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Mewujudkan sekolah ramah anak yang menyenangkan, berbudaya mutu, dan membekali peserta didik dengan fondasi iman, takwa, serta karakter Profil Pelajar Pancasila.
            </p>
            <div className="pt-2">
              <span className="inline-block bg-blue-950 text-blue-300 text-xs px-3 py-1.5 rounded-lg border border-blue-800 font-semibold">
                Akreditasi: A (Unggul) • Data Contoh
              </span>
            </div>
          </div>

          {/* Kolom 2: Tautan Cepat */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Jelajahi Sekolah
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/profil" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <span>Profil & Sejarah</span>
                </Link>
              </li>
              <li>
                <Link href="/profil#guru" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <span>Guru & Tenaga Kependidikan</span>
                </Link>
              </li>
              <li>
                <Link href="/akademik" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <span>Kurikulum & Program</span>
                </Link>
              </li>
              <li>
                <Link href="/akademik#kalender" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <span>Kalender Akademik</span>
                </Link>
              </li>
              <li>
                <Link href="/berita" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <span>Berita & Artikel Edukasi</span>
                </Link>
              </li>
              <li>
                <Link href="/galeri" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <span>Dokumentasi Kegiatan</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Layanan PPDB */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Penerimaan Siswa Baru
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/ppdb" className="hover:text-amber-400 transition-colors">
                  Informasi & Jadwal PPDB
                </Link>
              </li>
              <li>
                <Link href="/ppdb/daftar" className="hover:text-amber-400 transition-colors font-medium text-amber-300">
                  Formulir Pendaftaran Online
                </Link>
              </li>
              <li>
                <Link href="/siswa/login" className="hover:text-amber-400 transition-colors font-semibold text-blue-300">
                  Portal Siswa (Login & Status)
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-amber-400 transition-colors">
                  Pusat Portal Terpadu
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-amber-400 transition-colors text-slate-400">
                  Login Admin & Staf Guru
                </Link>
              </li>
            </ul>

            <div className="mt-6 p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
              <span className="text-xs text-slate-300 block font-medium">Butuh bantuan pendaftaran?</span>
              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noreferrer"
                className="mt-1 text-xs text-amber-400 hover:underline inline-flex items-center gap-1 font-semibold"
              >
                <span>Hubungi Panitia via WhatsApp</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* Kolom 4: Kontak & Alamat */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Kantor Sekolah
            </h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-amber-400 shrink-0 mt-1" />
                <span>Jl. Pendidikan Karakter No. 45, Kompleks Edukasi Bahagia</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-amber-400 shrink-0" />
                <span>(021) 555-0199</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-amber-400 shrink-0" />
                <span>info@sdharapanbangsa.sch.id</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 text-amber-400 shrink-0" />
                <span>Senin - Jumat: 07.00 - 15.00 WIB</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar & Disclaimer */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>
            &copy; {new Date().getFullYear()} SD Negeri Harapan Bangsa. Hak Cipta Dilindungi Undang-Undang.
          </p>
          <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/60">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Situs Resmi Institusi Pendidikan Dasar Indonesia</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
