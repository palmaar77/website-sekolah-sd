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
  Lock,
  Save,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";

const DRAFT_STORAGE_KEY = "sd_ppdb_form_draft_v1";

export default function PPDBDaftarPage() {
  const router = useRouter();

  // Status Layanan Backend
  const [isCheckingService, setIsCheckingService] = React.useState(true);
  const [isServiceOpen, setIsServiceOpen] = React.useState(true);
  const [serviceMessage, setServiceMessage] = React.useState("");

  // Status Pengiriman Formulir
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>({});
  const [hasDraft, setHasDraft] = React.useState(false);

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
  const [rt, setRt] = React.useState("");
  const [rw, setRw] = React.useState("");
  const [village, setVillage] = React.useState("");
  const [district, setDistrict] = React.useState("");

  // 1. Periksa status keaktifan layanan backend PPDB saat halaman dimuat
  React.useEffect(() => {
    async function checkServiceStatus() {
      setIsCheckingService(true);
      try {
        const res = await fetch("/api/ppdb/setting");
        const json = await res.json();
        if (json.success && json.data) {
          setIsServiceOpen(Boolean(json.data.isOpen));
          if (!json.data.isOpen) {
            setServiceMessage(
              "Layanan pendaftaran daring PPDB saat ini belum dibuka / sedang ditutup oleh panitia sekolah. Anda dapat melihat informasi persyaratan dan jadwal resmi pada halaman informasi."
            );
          }
        }
      } catch {
        // Fallback tetap izinkan jika server offline
      } finally {
        setIsCheckingService(false);
      }
    }
    checkServiceStatus();
  }, []);

  // 2. Pulihkan draft otomatis dari localStorage agar data tidak hilang saat reload
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.fullName) setFullName(parsed.fullName);
        if (parsed.nik) setNik(parsed.nik);
        if (parsed.birthPlace) setBirthPlace(parsed.birthPlace);
        if (parsed.birthDate) setBirthDate(parsed.birthDate);
        if (parsed.gender) setGender(parsed.gender);
        if (parsed.religion) setReligion(parsed.religion);
        if (parsed.previousSchool) setPreviousSchool(parsed.previousSchool);
        if (parsed.path) setPath(parsed.path);
        if (parsed.parentName) setParentName(parsed.parentName);
        if (parsed.parentPhone) setParentPhone(parsed.parentPhone);
        if (parsed.parentJob) setParentJob(parsed.parentJob);
        if (parsed.address) setAddress(parsed.address);
        if (parsed.rt) setRt(parsed.rt);
        if (parsed.rw) setRw(parsed.rw);
        // Fallback kompatibilitas draf lama yang masih menggabungkan format RT/RW
        if (!parsed.rt && !parsed.rw && parsed.rtRw) {
          const parts = String(parsed.rtRw).split("/");
          if (parts[0]) setRt(parts[0].trim());
          if (parts[1]) setRw(parts[1].trim());
        }
        if (parsed.village) setVillage(parsed.village);
        if (parsed.district) setDistrict(parsed.district);
        setHasDraft(true);
      }
    } catch { }
  }, []);

  // 3. Simpan perubahan ke draft localStorage secara real-time
  const saveDraft = (fields: Record<string, any>) => {
    try {
      const currentDraft = {
        fullName,
        nik,
        birthPlace,
        birthDate,
        gender,
        religion,
        previousSchool,
        path,
        parentName,
        parentPhone,
        parentJob,
        address,
        rt,
        rw,
        rtRw: rt && rw ? `${rt} / ${rw}` : rt || rw || "",
        village,
        district,
        ...fields,
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(currentDraft));
      setHasDraft(true);
    } catch { }
  };

  const handleClearDraft = () => {
    if (confirm("Hapus seluruh draf isian formulir?")) {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setFullName("");
      setNik("");
      setBirthPlace("");
      setBirthDate("");
      setGender("LAKI_LAKI");
      setReligion("Islam");
      setPreviousSchool("");
      setPath("ZONASI");
      setParentName("");
      setParentPhone("");
      setParentJob("");
      setAddress("");
      setRt("");
      setRw("");
      setVillage("");
      setDistrict("");
      setHasDraft(false);
      setErrorMsg("");
      setFieldErrors({});
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setFieldErrors({});

    if (!isServiceOpen) {
      setErrorMsg("Layanan pendaftaran sedang tidak aktif.");
      return;
    }

    // Validasi dasar client
    if (nik.length !== 16 || !/^\d+$/.test(nik)) {
      setErrorMsg("NIK harus tepat 16 digit angka.");
      return;
    }
    if (parentPhone.length < 10) {
      setErrorMsg("Nomor telepon / WhatsApp minimal 10 digit angka.");
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
        rt: rt.trim() || undefined,
        rw: rw.trim() || undefined,
        rtRw:
          rt.trim() && rw.trim()
            ? `${rt.trim()} / ${rw.trim()}`
            : rt.trim() || rw.trim() || undefined,
        village: village || undefined,
        district: district || undefined,
      };

      const res = await fetch("/api/ppdb/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success && data.data) {
        // Hapus draf karena pendaftaran telah sukses tercatat di server
        localStorage.removeItem(DRAFT_STORAGE_KEY);

        // Redirect ke halaman bukti sukses pendaftaran
        router.push(
          `/ppdb/sukses?reg=${encodeURIComponent(data.data.registrationNumber)}&name=${encodeURIComponent(data.data.fullName)}`
        );
      } else {
        setErrorMsg(
          data.message ||
          "Gagal mengirim formulir pendaftaran. Silakan periksa kembali data yang diisi."
        );
        if (data.errors) {
          setFieldErrors(data.errors);
        }
      }
    } catch {
      setErrorMsg("Terjadi gangguan koneksi jaringan saat mengirim data ke server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-12 pb-24 bg-slate-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/ppdb"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Informasi PPDB</span>
          </Link>

          {hasDraft && isServiceOpen && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                <Save className="h-3 w-3" />
                <span>Draft Tersimpan Otomatis</span>
              </span>
              <button
                type="button"
                onClick={handleClearDraft}
                className="text-[11px] text-slate-400 hover:text-rose-600 underline cursor-pointer"
              >
                Reset
              </button>
            </div>
          )}
        </div>

        {/* Card Header & Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-100 space-y-8">
          <div className="text-center space-y-2 border-b border-slate-100 pb-6">
            <div className="flex items-center justify-center gap-2">
              <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider">
                Formulir Daring Resmi
              </span>
              {isServiceOpen ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  <span>Layanan Aktif</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                  <Lock className="h-3 w-3 text-rose-600" />
                  <span>Layanan Ditutup</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Pendaftaran Siswa Baru (PPDB 2025/2026)
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
              Silakan lengkapi formulir pendaftaran di bawah ini dengan data yang sebenarnya sesuai Kartu Keluarga dan Akta Kelahiran.
            </p>
          </div>

          {/* Alert Jika Layanan Ditutup / Belum Ada Backend Aktif */}
          {!isServiceOpen && (
            <div className="p-6 rounded-3xl bg-amber-50 border-2 border-amber-300 text-amber-950 space-y-3">
              <div className="flex items-center gap-2.5 font-extrabold text-sm text-amber-900">
                <Lock className="h-5 w-5 text-amber-600 shrink-0" />
                <span>Layanan Pendaftaran PPDB Belum Aktif / Sedang Ditutup</span>
              </div>
              <p className="text-xs leading-relaxed text-amber-800">
                {serviceMessage ||
                  "Mohon maaf, sistem pendaftaran daring saat ini belum menerima formulir baru. Panitia sedang mempersiapkan pembukaan kuota jalur seleksi resmi."}
              </p>
              <div className="pt-2 flex items-center gap-3">
                <Link
                  href="/ppdb"
                  className="inline-flex items-center gap-1.5 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl transition-colors"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Lihat Jadwal & Persyaratan</span>
                </Link>
                <Link
                  href="/kontak"
                  className="text-xs font-bold text-amber-900 hover:underline"
                >
                  Hubungi Panitia &rarr;
                </Link>
              </div>
            </div>
          )}

          {/* Banner Error Pengiriman */}
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="leading-relaxed font-bold">{errorMsg}</div>
                {Object.keys(fieldErrors).length > 0 && (
                  <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-rose-700">
                    {Object.entries(fieldErrors).map(([key, errs]) => (
                      <li key={key}>
                        <strong>{key}:</strong> {errs.join(", ")}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
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
                    disabled={!isServiceOpen || isSubmitting}
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      saveDraft({ fullName: e.target.value });
                    }}
                    placeholder="Sesuai Akta Kelahiran (contoh: Muhammad Rizky Pratama)"
                  />
                </div>

                <Input
                  label="Nomor Induk Kependudukan (NIK)"
                  required
                  disabled={!isServiceOpen || isSubmitting}
                  maxLength={16}
                  value={nik}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setNik(val);
                    saveDraft({ nik: val });
                  }}
                  placeholder="16 digit angka NIK anak"
                  helperText="Tercantum pada Kartu Keluarga / KIA"
                />

                <Select
                  label="Jalur Pendaftaran"
                  required
                  disabled={!isServiceOpen || isSubmitting}
                  value={path}
                  onChange={(e) => {
                    setPath(e.target.value as any);
                    saveDraft({ path: e.target.value });
                  }}
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
                  disabled={!isServiceOpen || isSubmitting}
                  value={birthPlace}
                  onChange={(e) => {
                    setBirthPlace(e.target.value);
                    saveDraft({ birthPlace: e.target.value });
                  }}
                  placeholder="Contoh: Jakarta"
                />

                <Input
                  label="Tanggal Lahir"
                  type="date"
                  required
                  disabled={!isServiceOpen || isSubmitting}
                  value={birthDate}
                  onChange={(e) => {
                    setBirthDate(e.target.value);
                    saveDraft({ birthDate: e.target.value });
                  }}
                />

                <Select
                  label="Jenis Kelamin"
                  required
                  disabled={!isServiceOpen || isSubmitting}
                  value={gender}
                  onChange={(e) => {
                    setGender(e.target.value as any);
                    saveDraft({ gender: e.target.value });
                  }}
                  options={[
                    { value: "LAKI_LAKI", label: "Laki-laki" },
                    { value: "PEREMPUAN", label: "Perempuan" },
                  ]}
                />

                <Select
                  label="Agama"
                  disabled={!isServiceOpen || isSubmitting}
                  value={religion}
                  onChange={(e) => {
                    setReligion(e.target.value);
                    saveDraft({ religion: e.target.value });
                  }}
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
                    disabled={!isServiceOpen || isSubmitting}
                    value={previousSchool}
                    onChange={(e) => {
                      setPreviousSchool(e.target.value);
                      saveDraft({ previousSchool: e.target.value });
                    }}
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
                  disabled={!isServiceOpen || isSubmitting}
                  value={parentName}
                  onChange={(e) => {
                    setParentName(e.target.value);
                    saveDraft({ parentName: e.target.value });
                  }}
                  placeholder="Nama orang tua penanggung jawab"
                />

                <Input
                  label="Nomor WhatsApp / Telepon Aktif"
                  required
                  disabled={!isServiceOpen || isSubmitting}
                  type="tel"
                  value={parentPhone}
                  onChange={(e) => {
                    setParentPhone(e.target.value);
                    saveDraft({ parentPhone: e.target.value });
                  }}
                  placeholder="081234567890"
                  helperText="Digunakan untuk verifikasi & notifikasi"
                />

                <div className="sm:col-span-2">
                  <Input
                    label="Pekerjaan Orang Tua / Wali"
                    disabled={!isServiceOpen || isSubmitting}
                    value={parentJob}
                    onChange={(e) => {
                      setParentJob(e.target.value);
                      saveDraft({ parentJob: e.target.value });
                    }}
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
                disabled={!isServiceOpen || isSubmitting}
                rows={3}
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  saveDraft({ address: e.target.value });
                }}
                placeholder="Jl. Anggrek No. 12, Kelurahan Contoh..."
              />

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Input
                  label="RT"
                  disabled={!isServiceOpen || isSubmitting}
                  value={rt}
                  onChange={(e) => {
                    setRt(e.target.value);
                    saveDraft({ rt: e.target.value });
                  }}
                  placeholder="Contoh: 003"
                  maxLength={5}
                />
                <Input
                  label="RW"
                  disabled={!isServiceOpen || isSubmitting}
                  value={rw}
                  onChange={(e) => {
                    setRw(e.target.value);
                    saveDraft({ rw: e.target.value });
                  }}
                  placeholder="Contoh: 005"
                  maxLength={5}
                />
                <Input
                  label="Kelurahan / Desa"
                  disabled={!isServiceOpen || isSubmitting}
                  value={village}
                  onChange={(e) => {
                    setVillage(e.target.value);
                    saveDraft({ village: e.target.value });
                  }}
                  placeholder="Kelurahan"
                />
                <Input
                  label="Kecamatan"
                  disabled={!isServiceOpen || isSubmitting}
                  value={district}
                  onChange={(e) => {
                    setDistrict(e.target.value);
                    saveDraft({ district: e.target.value });
                  }}
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
                Dengan mengirimkan formulir ini, saya menyatakan bahwa data yang diisikan adalah benar dan dapat dipertanggungjawabkan sesuai dokumen resmi negara. Data akan tersimpan secara permanen di server sekolah.
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={!isServiceOpen || isSubmitting}
              isLoading={isSubmitting}
              className={`w-full text-sm font-extrabold py-4 rounded-2xl shadow-lg transition-all ${isServiceOpen
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20"
                : "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
                }`}
            >
              {isSubmitting ? (
                "Mengirim Berkas Pendaftaran..."
              ) : isServiceOpen ? (
                "Kirim Pendaftaran Siswa Baru"
              ) : (
                "Pendaftaran Sedang Ditutup"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
