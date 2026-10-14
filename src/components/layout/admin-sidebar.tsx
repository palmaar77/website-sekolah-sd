"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Newspaper,
  Bell,
  Users,
  Image as ImageIcon,
  Building2,
  CalendarDays,
  UserCheck,
  Mail,
  Settings,
  GraduationCap,
  ExternalLink,
  Award,
} from "lucide-react";

const ADMIN_NAV = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Manajemen Berita", href: "/admin/berita", icon: Newspaper },
  { name: "Pengumuman", href: "/admin/pengumuman", icon: Bell },
  { name: "Guru & Staf", href: "/admin/guru", icon: Users },
  { name: "Galeri Foto", href: "/admin/galeri", icon: ImageIcon },
  { name: "Profil & Fasilitas", href: "/admin/profil", icon: Building2 },
  { name: "Akademik & Kalender", href: "/admin/akademik", icon: CalendarDays },
  { name: "Nilai & Rapor Siswa", href: "/admin/nilai", icon: Award },
  { name: "Pendaftar PPDB", href: "/admin/ppdb", icon: UserCheck },
  { name: "Pesan Masuk", href: "/admin/pesan", icon: Mail },
  { name: "Pengaturan & Log", href: "/admin/pengaturan", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-screen border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
            <GraduationCap className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <span className="font-extrabold text-sm text-white tracking-wide block leading-none">
              ADMIN SEKOLAH
            </span>
            <span className="text-[10px] text-slate-400 tracking-wider uppercase mt-1 block">
              SD Harapan Bangsa
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Menu Manajemen
        </div>
        {ADMIN_NAV.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors",
                isActive
                  ? "bg-blue-600 text-white font-semibold shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/80"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Quick View Public Website Link */}
      <div className="p-4 border-t border-slate-800">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 transition-colors"
        >
          <span>Lihat Website Publik</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
    </aside>
  );
}
