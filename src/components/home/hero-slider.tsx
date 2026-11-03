"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Shield,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Layers,
} from "lucide-react";
import { formatAccreditationText } from "@/config/school";

interface SlideItem {
  id: number;
  imageUrl: string;
  tagline: string;
  title: string;
  highlightText: string;
}

const DEFAULT_SLIDES: SlideItem[] = [
  {
    id: 1,
    imageUrl:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1600&q=80",
    tagline: "Kurikulum Merdeka Interaktif",
    title: "Pembelajaran Kolaboratif Berpusat pada Anak",
    highlightText: "Ruang kelas ceria, modern, dan suportif setiap hari",
  },
  {
    id: 2,
    imageUrl:
      "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1600&q=80",
    tagline: "Literasi & Digitalisasi Pendidikan",
    title: "Perpustakaan Ramah Anak & Laboratorium Koding",
    highlightText: "Membekali literasi informasi dan kecakapan digital masa depan",
  },
  {
    id: 3,
    imageUrl:
      "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1600&q=80",
    tagline: "Bakat, Minat & Budi Pekerti",
    title: "Eksplorasi Ragam Seni, Sains, dan Olahraga",
    highlightText: "Membina akhlak mulia dan sportivitas Profil Pelajar Pancasila",
  },
];

interface HeroSliderProps {
  headline?: string;
  subheadline?: string;
  accreditation?: string | null;
  isPPDBOpen?: boolean;
  academicYear?: string;
}

export function HeroSlider({
  headline,
  subheadline,
  accreditation,
  isPPDBOpen = true,
  academicYear = "2026/2027",
}: HeroSliderProps) {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(true);
  const totalSlides = DEFAULT_SLIDES.length;

  // Auto-slide effect
  React.useEffect(() => {
    if (!isPlaying) return;

    // Hormati preferensi sistem jika pengguna mematikan animasi
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsPlaying(false);
      return;
    }

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 6000);

    return () => clearInterval(timer);
  }, [isPlaying, totalSlides]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  return (
    <section className="relative overflow-hidden bg-slate-950 text-white min-h-[580px] lg:min-h-[640px] flex items-center">
      {/* 1. SLIDER LATAR BERGERAK DENGAN OVERLAY GELAP TINGGI KONTRAS */}
      <div className="absolute inset-0 z-0">
        {DEFAULT_SLIDES.map((slide, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              <img
                src={slide.imageUrl}
                alt={slide.title}
                className={`w-full h-full object-cover transition-transform duration-[6000ms] ease-out ${
                  isPlaying && isActive ? "scale-105" : "scale-100"
                }`}
                loading={index === 0 ? "eager" : "lazy"}
              />
              {/* Lapisan Gradient Gelap untuk Memastikan Keterbacaan Teks (100% Readable) */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-950/95 via-blue-900/85 to-indigo-950/80 mix-blend-multiply" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-slate-950/70" />
            </div>
          );
        })}
      </div>

      {/* 2. KONTROL LATAR: TOMBOL JEDA / PUTAR LATAR & NAVIGASI SLIDE */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-8 z-30 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsPlaying(!isPlaying)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/70 hover:bg-slate-900/90 text-slate-200 hover:text-white border border-white/20 backdrop-blur-md text-xs font-semibold shadow-md transition-all active:scale-95"
          aria-label={isPlaying ? "Jeda animasi latar" : "Putar animasi latar"}
          title={isPlaying ? "Jeda Latar Animasi" : "Putar Latar Animasi"}
        >
          {isPlaying ? (
            <>
              <Pause className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden sm:inline">Jeda Latar</span>
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5 text-emerald-400 fill-emerald-400" />
              <span className="hidden sm:inline">Putar Latar</span>
            </>
          )}
        </button>

        {/* Tombol Panah Prev / Next */}
        <div className="flex items-center rounded-full bg-slate-900/70 border border-white/20 backdrop-blur-md p-0.5">
          <button
            type="button"
            onClick={handlePrev}
            className="p-1.5 text-slate-300 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            aria-label="Slide sebelumnya"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-[11px] font-mono px-1.5 text-slate-400">
            {currentSlide + 1}/{totalSlides}
          </span>
          <button
            type="button"
            onClick={handleNext}
            className="p-1.5 text-slate-300 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            aria-label="Slide berikutnya"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 3. KONTEN UTAMA HERO (Headline, CTA, Badge Akreditasi) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 relative z-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Sisi Kiri: Teks & Aksi */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 backdrop-blur-md border border-blue-400/30 text-amber-300 text-xs font-bold tracking-wide">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>{DEFAULT_SLIDES[currentSlide].tagline}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight sm:leading-tight lg:leading-tight text-white drop-shadow-xs">
              {headline || "Membentuk Generasi Cerdas, Berakhlak Mulia & Ceria"}
            </h1>

            <p className="text-base sm:text-lg text-blue-100 font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0 drop-shadow-xs">
              {subheadline ||
                "Sekolah Dasar ramah anak yang menumbuhkan potensi, empati, dan kreativitas putra-putri Anda melalui suasana belajar yang aman, suportif, dan membahagiakan."}
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              {isPPDBOpen ? (
                <Link
                  href="/ppdb/daftar"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-sm px-7 py-3.5 rounded-xl shadow-lg shadow-amber-500/25 transition-all hover:scale-105 active:scale-95"
                >
                  <span>Pendaftaran PPDB {academicYear}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <Link
                  href="/ppdb"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-800/90 hover:bg-slate-800 text-white font-bold text-sm px-7 py-3.5 rounded-xl border border-white/20 transition-all"
                >
                  <span>Informasi PPDB</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
              <Link
                href="/profil"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-6 py-3.5 rounded-xl border border-white/30 backdrop-blur-md transition-all"
              >
                <span>Kenali Sekolah Kami</span>
              </Link>
            </div>

            {/* Akreditasi Pills */}
            <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs text-blue-200">
              <span className="flex items-center gap-1.5 font-semibold">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>{formatAccreditationText(accreditation)}</span>
              </span>
              <span className="flex items-center gap-1.5 font-semibold">
                <Shield className="h-4 w-4 text-amber-400" />
                <span>Sekolah Ramah Anak (SRA)</span>
              </span>
            </div>
          </div>

          {/* Sisi Kanan: Cuplikan Slide & Kartu Kaca Berputar */}
          <div className="lg:col-span-5 relative hidden sm:block">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="aspect-4/3 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20 bg-blue-950 relative">
                <img
                  src={DEFAULT_SLIDES[currentSlide].imageUrl}
                  alt={DEFAULT_SLIDES[currentSlide].title}
                  className="w-full h-full object-cover transition-opacity duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white p-3.5 rounded-2xl bg-slate-950/60 backdrop-blur-md border border-white/20">
                  <div className="flex items-center gap-1.5 text-amber-300 text-[10px] font-bold uppercase tracking-wider mb-1">
                    <Layers className="h-3 w-3" />
                    <span>{DEFAULT_SLIDES[currentSlide].tagline}</span>
                  </div>
                  <p className="text-xs font-bold leading-tight">
                    {DEFAULT_SLIDES[currentSlide].title}
                  </p>
                  <p className="text-[11px] text-blue-200 mt-0.5">
                    {DEFAULT_SLIDES[currentSlide].highlightText}
                  </p>
                </div>
              </div>

              {/* Indikator Titik Slide */}
              <div className="flex items-center justify-center gap-2 mt-4">
                {DEFAULT_SLIDES.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2 rounded-full transition-all ${
                      idx === currentSlide
                        ? "w-8 bg-amber-400"
                        : "w-2 bg-white/40 hover:bg-white/60"
                    }`}
                    aria-label={`Lihat slide ke-${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

