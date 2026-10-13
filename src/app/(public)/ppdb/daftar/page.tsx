"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  UserCheck,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  User,
  Phone,
  Home,
  BookOpen,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";

export default function PPDBDaftarPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");

  // Form State
  const [fullName, setFullName] = React.useState("");
  const [nik, setNik] = React.useState("");
  const [birthPlace, setBirthPlace] = React.useState("");
  const [birthDate, setBirthDate] = React.useState("");
  const [gender, setGender] = React.useState<"LAKI_LAKI" | "PEREMPUAN">("LAKI_LAKI");
  const [religion, setReligion] = React.useState("Islam");
  const [previousSchool, setPreviousSchool] = React.useState("");
  const [path, setPath] = React.useState<"ZONASI" | "AFIRMASI" | "PRESTASI" | "PERPINDAHAN_TUGAS">("ZONASI");

  const [parentName, setParentName] = React.useState("");
  const [parentPhone, setParentPhone] = React.useState("");
  const [parentJob, setParentJob] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [rtRw, setRtRw] = React.useState("");
  const [village, setVillage] = React.useState("");
  const [district, setDistrict] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // Validasi dasar client
    if (nik.length !== 16 || !/^\d+$/.test(nik)) {
      setErrorMsg("NIK harus tepat 16 digit angka.");
      return;
    }
    if (parentPhone.length < 10) {
      setErrorMsg("Nomor telepon / WhatsApp minimal 10 digit.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        fullName,
        nik,
        birthPlace,
        birthDate,
        gender,
        religion,
        previousSchool: previousSchool || undefined,
        path,
        parentName,
        parentPhone,
        parentJob: parentJob || undefined,
        address,
        rtRw: rtRw || undefined,
        village: village || undefined,
        district: district || undefined,
      };

      const res = await fetch("/api/ppdb/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.data) {
        // Redirect ke halaman bukti sukses pendaftaran
        router.push(
          `/ppdb/sukses?reg=${encodeURIComponent(data.data.registrationNumber)}&name=${encodeURIComponent(data.data.fullName)}`
        );
      } else {
        setErrorMsg(data.message || "Gagal mengirim formulir pendaftaran.");
      }
    } catch {
      setErrorMsg("Terjadi gangguan koneksi jaringan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-12 pb-24 bg-slate-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <Link
          href="/ppdb"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-blue-600 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Informasi PPDB</span>
        </Link>

        {/* Card Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-100 space-y-8">
          <div className="text-center space-y-2 border-b border-slate-100 pb-6">
            <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider">
              Formulir Daring Resmi
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Pendaftaran Siswa Baru (PPDB 2025/2026)
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
              Silakan lengkapi formulir pendaftaran di bawah ini dengan data yang sebenarnya sesuai Kartu Keluarga dan Akta Kelahiran.
            </p>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-medium">{errorMsg}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Bagian 1: Data Calon Siswa */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-blue-900 flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600" />
                <span>1. Data Diri Calon Siswa</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Input
                    label="Nama Lengkap Calon Siswa"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Sesuai Akta Kelahiran (contoh: Muhammad Rizky Pratama)"
                  />
                </div>

                <Input
                  label="Nomor Induk Kependudukan (NIK)"
                  required
                  maxLength={16}
                  value={nik}
                  onChange={(e) => setNik(e.target.value.replace(/\D/g, ""))}
                  placeholder="16 digit angka NIK anak"
                  helperText="Tercantum pada Kartu Keluarga / KIA"
                />

                <Select
                  label="Jalur Pendaftaran"
                  required
                  value={path}
                  onChange={(e) => setPath(e.target.value as any)}
                  options={[
                    { value: "ZONASI", label: "Zonasi (Domisili Terdekat)" },
                    { value: "AFIRMASI", label: "Afirmasi (Keluarga Pra-Sejahtera)" },
                    { value: "PRESTASI", label: "Prestasi (Lomba / Piagam)" },
                    { value: "PERPINDAHAN_TUGAS", label: "Perpindahan Tugas Orang Tua" },
                  ]}
                />

                <Input
                  label="Tempat Lahir"
                  required
                  value={birthPlace}
                  onChange={(e) => setBirthPlace(e.target.value)}
                  placeholder="Contoh: Jakarta"
                />

                <Input
                  label="Tanggal Lahir"
                  type="date"
                  required
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                />

                <Select
                  label="Jenis Kelamin"
                  required
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  options={[
                    { value: "LAKI_LAKI", label: "Laki-laki" },
                    { value: "PEREMPUAN", label: "Perempuan" },
                  ]}
                />

                <Select
                  label="Agama"
                  value={religion}
                  onChange={(e) => setReligion(e.target.value)}
                  options={[
                    { value: "Islam", label: "Islam" },
                    { value: "Kristen Protestan", label: "Kristen Protestan" },
                    { value: "Katolik", label: "Katolik" },
                    { value: "Hindu", label: "Hindu" },
                    { value: "Buddha", label: "Buddha" },
                    { value: "Konghucu", label: "Konghucu" },
                  ]}
                />

                <div className="sm:col-span-2">
                  <Input
                    label="Asal TK / PAUD (Opsional)"
                    value={previousSchool}
                    onChange={(e) => setPreviousSchool(e.target.value)}
                    placeholder="Contoh: TK Pertiwi 01 (kosongkan jika tidak ada)"
                  />
                </div>
              </div>
            </div>

            {/* Bagian 2: Data Orang Tua / Wali */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold uppercase tracking-wider text-blue-900 flex items-center gap-2">
                <Phone className="h-4 w-4 text-amber-500" />
                <span>2. Data Orang Tua / Wali & Kontak</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nama Ayah / Ibu / Wali"
                  required
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="Nama orang tua penanggung jawab"
                />

                <Input
                  label="Nomor WhatsApp / Telepon Aktif"
                  required
                  type="tel"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  placeholder="081234567890"
                  helperText="Digunakan untuk verifikasi & notifikasi"
                />

                <div className="sm:col-span-2">
                  <Input
                    label="Pekerjaan Orang Tua / Wali"
                    value={parentJob}
                    onChange={(e) => setParentJob(e.target.value)}
                    placeholder="Contoh: Karyawan Swasta, Wiraswasta, PNS, dll"
                  />
                </div>
              </div>
            </div>

            {/* Bagian 3: Alamat Domisili */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold uppercase tracking-wider text-blue-900 flex items-center gap-2">
                <Home className="h-4 w-4 text-emerald-600" />
                <span>3. Alamat Domisili Sesuai KK</span>
              </h3>

              <Textarea
                label="Alamat Tempat Tinggal Lengkap"
                required
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Jl. Anggrek No. 12, Kelurahan Contoh..."
              />

              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="RT / RW"
                  value={rtRw}
                  onChange={(e) => setRtRw(e.target.value)}
                  placeholder="03 / 05"
                />
                <Input
                  label="Kelurahan / Desa"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  placeholder="Kelurahan"
                />
                <Input
                  label="Kecamatan"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="Kecamatan"
                />
              </div>
            </div>

            {/* Pernyataan Kebenaran Data */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-slate-800 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-900">
                <ShieldCheck className="h-4 w-4 text-amber-600" />
                <span>Pernyataan Orang Tua / Wali</span>
              </div>
              <p className="leading-relaxed text-slate-700">
                Dengan mengirimkan formulir ini, saya menyatakan bahwa data yang diisikan adalah benar dan dapat dipertanggungjawabkan sesuai dokumen resmi negara.
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              className="w-full text-sm font-extrabold py-4 rounded-2xl shadow-lg shadow-blue-600/20 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Kirim Pendaftaran Siswa Baru
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
