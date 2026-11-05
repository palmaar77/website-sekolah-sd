"use client";

import * as React from "react";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Navigation,
  Compass,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  parseGoogleMapsEmbedUrl,
  getGoogleMapsDirectionsUrl,
  getGoogleMapsSearchUrl,
} from "@/lib/maps";
import {
  SCHOOL_CONFIG,
  getWhatsAppUrl,
  cleanDemoMarkers,
} from "@/config/school";

interface SchoolContactProfile {
  schoolName: string;
  npsn?: string;
  address: string;
  city: string;
  province: string;
  postalCode?: string | null;
  phone: string;
  email: string;
  whatsapp?: string | null;
  mapEmbedUrl?: string | null;
}

export default function KontakPage() {
  const [profile, setProfile] = React.useState<SchoolContactProfile | null>(null);

  // Form State
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [honeypot, setHoneypot] = React.useState("");

  const [isSending, setIsSending] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");

  // Muat Profil Sekolah & Peta Lokasi dari database
  React.useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setProfile(json.data);
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsSuccess(false);

    // Bot trap check
    if (honeypot.length > 0) {
      setErrorMsg("Spam terdeteksi.");
      return;
    }

    setIsSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone: phone || null,
          message,
          honeypot,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsSuccess(true);
        setName("");
        setEmail("");
        setPhone("");
        setMessage("");
      } else {
        setErrorMsg(data.message || "Gagal mengirim pesan.");
      }
    } catch {
      setErrorMsg("Terjadi kesalahan jaringan.");
    } finally {
      setIsSending(false);
    }
  };

  // Format Tampilan Data Kontak
  const schoolName = cleanDemoMarkers(profile?.schoolName) || SCHOOL_CONFIG.name;
  const fullAddress = profile?.address
    ? `${cleanDemoMarkers(profile.address)}${profile.city ? `, ${cleanDemoMarkers(profile.city)}` : ""}${profile.province ? `, ${cleanDemoMarkers(profile.province)}` : ""}${profile.postalCode ? ` ${profile.postalCode}` : ""}`
    : `${SCHOOL_CONFIG.address}, ${SCHOOL_CONFIG.city}, ${SCHOOL_CONFIG.province} ${SCHOOL_CONFIG.postalCode}`;
  const phoneDisplay = profile?.phone || SCHOOL_CONFIG.phone;
  const emailDisplay = profile?.email || SCHOOL_CONFIG.email;

  const activeWa = profile?.whatsapp || SCHOOL_CONFIG.whatsapp;
  const waUrl = getWhatsAppUrl("Halo Admin SD Harapan Bangsa, saya ingin bertanya seputar informasi sekolah.", activeWa);

  // URL Embed Google Maps yang aktif
  const currentEmbedUrl = parseGoogleMapsEmbedUrl(
    profile?.mapEmbedUrl,
    fullAddress
  );

  return (
    <div className="space-y-16 pb-24">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-white/10 px-3.5 py-1 rounded-full border border-white/15">
            Layanan Informasi & Lokasi
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
            Hubungi & Kunjungi Sekolah Kami
          </h1>
          <p className="text-sm sm:text-base text-blue-100 max-w-2xl mx-auto">
            Kami siap melayani pertanyaan seputar PPDB, kurikulum, dan kegiatan kesiswaan. Silakan hubungi kami atau kunjungi lokasi kampus sekolah kami.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Kontak Cards & Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Info Sekolah */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                Sekretariat Sekolah
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 mt-2">
                Informasi Kontak Resmi
              </h2>
            </div>

            <div className="space-y-4">
              <Card className="p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Alamat Lembaga</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {fullAddress}
                  </p>
                </div>
              </Card>

              <Card className="p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Telepon Kantor</h4>
                  <p className="text-xs text-slate-600 mt-1 font-mono">{phoneDisplay}</p>
                </div>
              </Card>

              <Card className="p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Email Resmi</h4>
                  <p className="text-xs text-slate-600 mt-1 font-mono">{emailDisplay}</p>
                </div>
              </Card>

              <Card className="p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Jam Operasional Pelayanan</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Senin - Jumat: 07.00 - 15.00 WIB (Sabtu & Minggu Tutup)
                  </p>
                </div>
              </Card>
            </div>

            {/* Direct WhatsApp Button */}
            <div className="pt-2">
              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md transition-all active:scale-95"
              >
                <MessageSquare className="h-5 w-5" />
                <span>Konsultasi Cepat via WhatsApp</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Formulir Pesan */}
          <div className="lg:col-span-7">
            <Card className="p-6 sm:p-10 shadow-lg border-slate-100">
              <h3 className="text-xl font-extrabold text-slate-900 mb-2">
                Kirimkan Pertanyaan atau Pesan
              </h3>
              <p className="text-xs text-slate-500 mb-6">
                Tim tata usaha dan kehumasan kami akan merespons pesan Anda dalam 1x24 jam kerja.
              </p>

              {isSuccess && (
                <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  <div className="leading-relaxed font-medium">
                    Pesan Anda berhasil dikirim! Pihak sekolah akan segera menghubungi Anda kembali melalui email atau nomor WhatsApp yang dicantumkan.
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
                  <div className="leading-relaxed font-medium">{errorMsg}</div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Honeypot field (hidden from real users to catch spambots) */}
                <input
                  type="text"
                  name="honeypot"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  style={{ display: "none" }}
                  tabIndex={-1}
                  autoComplete="off"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Nama Lengkap Anda"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Bapak Hendra"
                  />
                  <Input
                    label="Alamat Email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                  />
                </div>

                <Input
                  label="Nomor WhatsApp / Telepon"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="081234567890"
                />

                <Textarea
                  label="Isi Pesan / Pertanyaan"
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tuliskan pertanyaan Anda secara lengkap di sini..."
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isSending}
                  className="w-full gap-2 mt-2"
                >
                  <Send className="h-4 w-4" />
                  <span>Kirim Pesan Sekarang</span>
                </Button>
              </form>
            </Card>
          </div>
        </div>

        {/* Peta Lokasi Interaktif */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                Peta Lokasi Interaktif
              </span>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                Lokasi {schoolName}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {fullAddress}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Tombol Arah & Navigasi Langsung */}
              <a
                href={getGoogleMapsDirectionsUrl(fullAddress)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all"
              >
                <Navigation className="h-3.5 w-3.5" />
                <span>Petunjuk Arah (GPS)</span>
              </a>

              <a
                href={getGoogleMapsSearchUrl(fullAddress)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-all"
              >
                <Compass className="h-3.5 w-3.5 text-blue-600" />
                <span>Buka di Google Maps</span>
              </a>
            </div>
          </div>

          {/* Iframe Peta Lokasi */}
          <div className="rounded-3xl overflow-hidden shadow-xl border border-slate-200 aspect-16/7 bg-slate-100 relative group">
            <iframe
              title="Peta Lokasi Sekolah"
              src={currentEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
