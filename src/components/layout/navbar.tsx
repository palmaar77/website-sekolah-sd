"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Menu,
  X,
  GraduationCap,
  Phone,
  Mail,
  LogIn,
  ChevronRight,
  ChevronDown,
  Clock,
  ShieldCheck,
} from "lucide-react";

const NAV_LINKS = [
  { name: "Beranda", href: "/" },
  { name: "Profil", href: "/profil" },
  { name: "Akademik", href: "/akademik" },
  { name: "Berita", href: "/berita" },
  { name: "Galeri", href: "/galeri" },
  { name: "PPDB", href: "/ppdb" },
  { name: "Kontak", href: "/kontak" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoginDropdownOpen, setIsLoginDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Tutup menu mobile & dropdown ketika navigasi berubah
  React.useEffect(() => {
    setIsOpen(false);
    setIsLoginDropdownOpen(false);
  }, [pathname]);

  // Tutup dropdown jika klik di luar area
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsLoginDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md shadow-xs transition-all">
      {/* Top Bar Informasi */}
      <div className="hidden lg:block bg-blue-900 text-blue-100 text-xs py-2 px-4 sm:px-6 lg:px-8 border-b border-blue-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <span className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-amber-400" />
              <span>(021) 555-0199</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-amber-400" />
              <span>info@sdharapanbangsa.sch.id</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-amber-400" />
              <span>Senin - Jumat: 07.00 - 15.00 WIB</span>
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-semibold border border-amber-400/30">
              NPSN: 20109999 • Akreditasi A
            </span>
            <div className="flex items-center space-x-3 border-l border-blue-800 pl-3">
              <Link
                href="/siswa/login"
                className="flex items-center gap-1 hover:text-amber-300 transition-colors text-blue-200"
              >
                <GraduationCap className="h-3.5 w-3.5 text-amber-400" />
                <span>Portal Siswa</span>
              </Link>
              <span className="text-blue-700">•</span>
              <Link
                href="/admin/login"
                className="flex items-center gap-1 hover:text-white transition-colors text-blue-200"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-blue-300" />
                <span>Portal Admin</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & School Name */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="h-7 w-7 text-amber-400" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg sm:text-xl text-slate-900 tracking-tight leading-none group-hover:text-blue-600 transition-colors">
                SDN HARAPAN BANGSA
              </span>
              <span className="text-xs font-medium text-slate-500 mt-1 tracking-wide">
                Cerdas • Berakhlak • Berkarakter Pancasila
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150",
                    isActive
                      ? "text-blue-700 bg-blue-50 font-bold"
                      : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                  )}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Action & Dropdown Login Buttons */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Dropdown Menu Login */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsLoginDropdownOpen(!isLoginDropdownOpen)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-bold text-sm border transition-all cursor-pointer",
                  isLoginDropdownOpen || pathname.startsWith("/login") || pathname.startsWith("/siswa")
                    ? "bg-blue-50 border-blue-300 text-blue-700 shadow-xs"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                )}
                aria-expanded={isLoginDropdownOpen}
                aria-haspopup="true"
              >
                <LogIn className="h-4 w-4 text-blue-600" />
                <span>Masuk</span>
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-200",
                    isLoginDropdownOpen && "rotate-180"
                  )}
                />
              </button>

              {/* Dropdown Popover */}
              {isLoginDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white border border-slate-200/90 shadow-xl p-2 z-50 animate-in fade-in-50 zoom-in-95 duration-150">
                  <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Pilih Portal Masuk
                  </div>

                  <Link
                    href="/siswa/login"
                    onClick={() => setIsLoginDropdownOpen(false)}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-blue-50/80 group transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-xs text-slate-900 group-hover:text-blue-700 transition-colors">
                        Portal Siswa & PPDB
                      </span>
                      <span className="text-[11px] text-slate-500 leading-tight">
                        Cek status hasil seleksi & berkas
                      </span>
                    </div>
                  </Link>

                  <Link
                    href="/admin/login"
                    onClick={() => setIsLoginDropdownOpen(false)}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 group transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center shrink-0 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-xs text-slate-900 group-hover:text-slate-900 transition-colors">
                        Portal Admin & Guru
                      </span>
                      <span className="text-[11px] text-slate-500 leading-tight">
                        Khusus dewan guru & staf sekolah
                      </span>
                    </div>
                  </Link>

                  <div className="my-1 border-t border-slate-100" />

                  <Link
                    href="/login"
                    onClick={() => setIsLoginDropdownOpen(false)}
                    className="flex items-center justify-between p-2 rounded-xl text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <span>Pusat Gerbang Portal Lengkap</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}
            </div>

            {/* PPDB Button */}
            <Link
              href="/ppdb"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 px-5 py-2.5 rounded-xl font-bold text-sm shadow-xs hover:shadow-md transition-all active:scale-95"
            >
              <span>Info PPDB 2025</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <Link
              href="/login"
              className="text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1.5 rounded-lg flex items-center gap-1"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Masuk</span>
            </Link>
            <Link
              href="/ppdb"
              className="text-xs font-bold bg-amber-400 text-slate-950 px-3 py-1.5 rounded-lg"
            >
              PPDB
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none cursor-pointer"
              aria-label="Buka menu navigasi"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 shadow-xl animate-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col space-y-1">
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-between",
                    isActive
                      ? "text-blue-700 bg-blue-50 font-bold"
                      : "text-slate-700 hover:bg-slate-50"
                  )}
                >
                  <span>{link.name}</span>
                  {isActive && <ChevronRight className="h-4 w-4 text-blue-600" />}
                </Link>
              );
            })}
          </div>

          {/* Mobile Login & Action Area */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2.5">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
              Portal & Layanan Masuk
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/siswa/login"
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200/80 hover:bg-blue-100 transition-colors"
              >
                <GraduationCap className="h-4 w-4 text-blue-600" />
                <span>Portal Siswa</span>
              </Link>
              <Link
                href="/admin/login"
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs border border-slate-200 hover:bg-slate-200 transition-colors"
              >
                <ShieldCheck className="h-4 w-4 text-slate-700" />
                <span>Portal Admin</span>
              </Link>
            </div>

            <Link
              href="/login"
              className="w-full text-center border border-dashed border-slate-300 text-slate-600 font-semibold py-2 rounded-xl text-xs hover:bg-slate-50 transition-colors"
            >
              Buka Halaman Pusat Portal Terpadu &rarr;
            </Link>

            <Link
              href="/ppdb/daftar"
              className="w-full text-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 rounded-xl text-sm shadow-sm mt-1"
            >
              Daftar PPDB Online
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
