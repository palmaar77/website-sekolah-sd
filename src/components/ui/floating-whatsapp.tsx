"use client";

import * as React from "react";
import { MessageCircle, X } from "lucide-react";
import { SCHOOL_CONFIG, getWhatsAppUrl } from "@/config/school";

export function FloatingWhatsApp() {
  const [showTooltip, setShowTooltip] = React.useState(true);

  const waUrl = getWhatsAppUrl(
    "Halo Admin SD Harapan Bangsa, saya ingin bertanya seputar pendaftaran dan informasi sekolah.",
    SCHOOL_CONFIG.whatsapp
  );

  return (
    <aside
      aria-label="Kontak Cepat WhatsApp"
      className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-40 flex flex-col items-end pointer-events-auto"
    >
      {/* Tooltip Mini Ramah Pengunjung */}
      {showTooltip && (
        <div className="mb-2 relative animate-fade-in hidden sm:flex items-center gap-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs px-3.5 py-2 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 max-w-xs transition-all">
          <span>
            Butuh bantuan pendaftaran? <strong>Chat kami via WhatsApp</strong>
          </span>
          <button
            type="button"
            onClick={() => setShowTooltip(false)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-full"
            aria-label="Tutup petunjuk"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white dark:bg-slate-900 border-r border-b border-slate-200/80 dark:border-slate-800 rotate-45" />
        </div>
      )}

      {/* Tombol Utama Mengambang */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Hubungi kami via WhatsApp di ${SCHOOL_CONFIG.whatsapp}`}
        className="group flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white p-3.5 sm:px-4 sm:py-3 rounded-full shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 active:scale-95 transition-all animate-pulse-glow"
      >
        <MessageCircle className="h-6 w-6 text-white shrink-0 fill-current" />
        <span className="hidden sm:inline-block font-extrabold text-xs tracking-wide">
          Chat WhatsApp
        </span>
      </a>
    </aside>
  );
}

