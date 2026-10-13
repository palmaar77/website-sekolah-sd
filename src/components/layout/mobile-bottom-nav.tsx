"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Newspaper,
  Sparkles,
  GraduationCap,
  PhoneCall,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    name: "Beranda",
    href: "/",
    icon: Home,
    exact: true,
  },
  {
    name: "Berita",
    href: "/berita",
    icon: Newspaper,
    exact: false,
  },
  {
    name: "PPDB",
    href: "/ppdb",
    icon: Sparkles,
    exact: false,
    highlight: true,
  },
  {
    name: "Siswa",
    href: "/siswa/login",
    icon: GraduationCap,
    exact: false,
  },
  {
    name: "Kontak",
    href: "/kontak",
    icon: PhoneCall,
    exact: false,
  },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  // Jangan tampilkan jika pengguna sedang di area admin
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <aside
      aria-label="Navigasi Khusus Handphone"
      className="fixed bottom-0 left-0 right-0 z-50 block lg:hidden bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] pb-[calc(env(safe-area-inset-bottom,0px)+4px)] transition-transform duration-300"
    >
      <div className="grid grid-cols-5 items-center h-16 max-w-md mx-auto px-1">
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          if (item.highlight) {
            return (
              <Link
                key={item.name}
                href={item.href}
                className="relative -top-3 flex flex-col items-center justify-center group focus:outline-none"
              >
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 group-hover:scale-105 group-active:scale-95",
                    isActive
                      ? "bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 ring-4 ring-amber-100 shadow-amber-400/40"
                      : "bg-gradient-to-tr from-blue-600 to-indigo-600 text-white ring-4 ring-white shadow-blue-500/30"
                  )}
                >
                  <item.icon className="h-6 w-6" />
                </div>
                <span
                  className={cn(
                    "text-[10px] font-extrabold mt-1 tracking-tight",
                    isActive ? "text-amber-600" : "text-blue-700"
                  )}
                >
                  {item.name}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-1 transition-all duration-150 rounded-xl",
                isActive
                  ? "text-blue-600 font-bold"
                  : "text-slate-500 hover:text-slate-900 active:scale-95"
              )}
            >
              <div className="relative">
                <item.icon
                  className={cn(
                    "h-5 w-5 transition-transform",
                    isActive && "scale-110 text-blue-600"
                  )}
                />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-600" />
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] mt-1 font-medium transition-colors",
                  isActive ? "text-blue-600 font-bold" : "text-slate-500"
                )}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
