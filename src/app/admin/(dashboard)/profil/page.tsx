"use client";

import * as React from "react";
import {
  Save,
  PlusCircle,
  Trash2,
  CheckCircle2,
  AlertCircle,
  School,
  Sparkles,
  Share2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";

interface FacilityItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  order: number;
}

export default function AdminProfilePage() {
  const [activeTab, setActiveTab] = React.useState<"profile" | "facilities">("profile");
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveSuccess, setSaveSuccess] = React.useState(false);
  const [errorBanner, setErrorBanner] = React.useState("");
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>({});

  // Profile Form State
  const [schoolName, setSchoolName] = React.useState("");
  const [npsn, setNpsn] = React.useState("");
  const [accreditation, setAccreditation] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [city, setCity] = React.useState("");
  const [province, setProvince] = React.useState("");
  const [postalCode, setPostalCode] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [whatsapp, setWhatsapp] = React.useState("");
  const [principalName, setPrincipalName] = React.useState("");
  const [principalNip, setPrincipalNip] = React.useState("");
  const [principalMessage, setPrincipalMessage] = React.useState("");
  const [principalPhoto, setPrincipalPhoto] = React.useState("");
  const [vision, setVision] = React.useState("");
  const [mission, setMission] = React.useState("");
  const [goals, setGoals] = React.useState("");
  const [history, setHistory] = React.useState("");
  const [heroHeadline, setHeroHeadline] = React.useState("");
  const [heroSubheadline, setHeroSubheadline] = React.useState("");
  const [studentCount, setStudentCount] = React.useState(480);
  const [teacherCount, setTeacherCount] = React.useState(28);
  const [classroomCount, setClassroomCount] = React.useState(18);
  const [extracurricularCount, setExtracurricularCount] = React.useState(12);
  const [mapEmbedUrl, setMapEmbedUrl] = React.useState("");
  const [facebookUrl, setFacebookUrl] = React.useState("");
  const [instagramUrl, setInstagramUrl] = React.useState("");
  const [youtubeUrl, setYoutubeUrl] = React.useState("");

  // Facilities State
  const [facilities, setFacilities] = React.useState<FacilityItem[]>([]);
  const [isFacilityModalOpen, setIsFacilityModalOpen] = React.useState(false);
  const [facName, setFacName] = React.useState("");
  const [facDesc, setFacDesc] = React.useState("");
  const [facImage, setFacImage] = React.useState("");

  const fetchProfileAndFacilities = async () => {
    setIsLoading(true);
    try {
      const [pRes, fRes] = await Promise.all([
        fetch("/api/admin/profile"),
        fetch("/api/admin/facilities"),
      ]);

      const pData = await pRes.json();
      const fData = await fRes.json();

      if (pData.success && pData.data) {
        const p = pData.data;
        setSchoolName(p.schoolName || "");
        setNpsn(p.npsn || "");
        setAccreditation(p.accreditation || "");
        setAddress(p.address || "");
        setCity(p.city || "");
        setProvince(p.province || "");
        setPostalCode(p.postalCode || "");
        setPhone(p.phone || "");
        setEmail(p.email || "");
        setWhatsapp(p.whatsapp || "");
        setPrincipalName(p.principalName || "");
        setPrincipalNip(p.principalNip || "");
        setPrincipalMessage(p.principalMessage || "");
        setPrincipalPhoto(p.principalPhoto || "");
        setVision(p.vision || "");
        setMission(p.mission || "");
        setGoals(p.goals || "");
        setHistory(p.history || "");
        setHeroHeadline(p.heroHeadline || "Membentuk Generasi Cerdas, Berakhlak Mulia & Ceria");
        setHeroSubheadline(
          p.heroSubheadline ||
            "Sekolah Dasar berprestasi dengan fasilitas pembelajaran ramah anak, guru berpengalaman, dan lingkungan kondusif untuk menumbuhkan karakter profil Pelajar Pancasila."
        );
        setStudentCount(p.studentCount || 480);
        setTeacherCount(p.teacherCount || 28);
        setClassroomCount(p.classroomCount || 18);
        setExtracurricularCount(p.extracurricularCount || 12);
        setMapEmbedUrl(p.mapEmbedUrl || "");
        setFacebookUrl(p.facebookUrl || "");
        setInstagramUrl(p.instagramUrl || "");
        setYoutubeUrl(p.youtubeUrl || "");
      }

      if (fData.success) {
        setFacilities(fData.data || []);
      }
    } catch (e) {
      console.error("Gagal memuat profil/fasilitas:", e);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchProfileAndFacilities();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setErrorBanner("");
    setFieldErrors({});

    try {
      const payload = {
        schoolName: schoolName.trim(),
        npsn: npsn.trim(),
        accreditation: accreditation.trim(),
        address: address.trim(),
        city: city.trim(),
        province: province.trim(),
        postalCode: postalCode.trim() || null,
        phone: phone.trim(),
        email: email.trim(),
        whatsapp: whatsapp.trim() || null,
        principalName: principalName.trim(),
        principalNip: principalNip.trim() || null,
        principalMessage: principalMessage.trim(),
        principalPhoto: principalPhoto.trim() || null,
        vision: vision.trim(),
        mission: mission.trim(),
        goals: goals.trim(),
        history: history.trim(),
        heroHeadline:
          heroHeadline.trim() || "Membentuk Generasi Cerdas, Berakhlak Mulia & Ceria",
        heroSubheadline:
          heroSubheadline.trim() ||
          "Sekolah Dasar berprestasi dengan fasilitas pembelajaran ramah anak, guru berpengalaman, dan lingkungan kondusif untuk menumbuhkan karakter profil Pelajar Pancasila.",
        studentCount: Number(studentCount) || 0,
        teacherCount: Number(teacherCount) || 0,
        classroomCount: Number(classroomCount) || 0,
        extracurricularCount: Number(extracurricularCount) || 0,
        mapEmbedUrl: mapEmbedUrl.trim() || null,
        facebookUrl: facebookUrl.trim() || null,
        instagramUrl: instagramUrl.trim() || null,
        youtubeUrl: youtubeUrl.trim() || null,
      };

      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        setFieldErrors({});
        setErrorBanner("");
        window.scrollTo({ top: 0, behavior: "smooth" });
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        setErrorBanner(data.message || "Gagal menyimpan profil.");
        if (data.errors) {
          setFieldErrors(data.errors);
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch {
      setErrorBanner("Terjadi kesalahan jaringan saat menyimpan profil.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddFacility = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/facilities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: facName,
          description: facDesc,
          imageUrl: facImage || null,
          order: facilities.length + 1,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsFacilityModalOpen(false);
        setFacName("");
        setFacDesc("");
        setFacImage("");
        fetchProfileAndFacilities();
      } else {
        alert(data.message || "Gagal menambahkan fasilitas.");
      }
    } catch {
      alert("Terjadi kesalahan jaringan.");
    }
  };

  const handleDeleteFacility = async (id: string, name: string) => {
    if (!confirm(`Hapus fasilitas "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/facilities/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchProfileAndFacilities();
      }
    } catch {
      alert("Terjadi kesalahan jaringan.");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Profil & Fasilitas Sekolah
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Perbarui visi, misi, sejarah, sambutan kepala sekolah, kontak resmi, dan fasilitas lembaga.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "profile"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Informasi Utama & Visi Misi
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("facilities")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "facilities"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Sarana & Fasilitas Sekolah ({facilities.length})
        </button>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-slate-400 text-sm">Memuat informasi sekolah...</div>
      ) : activeTab === "profile" ? (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          {saveSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <span className="font-semibold">
                Perubahan profil sekolah berhasil disimpan dan diperbarui!
              </span>
            </div>
          )}

          {errorBanner && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">{errorBanner}</p>
                {Object.keys(fieldErrors).length > 0 && (
                  <ul className="list-disc list-inside space-y-0.5 text-rose-700">
                    {Object.entries(fieldErrors).map(([field, msgs]) => (
                      <li key={field}>
                        <span className="font-semibold capitalize">{field}</span>: {msgs.join(", ")}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* Banner & Hero Beranda */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <span>Banner & Headline Halaman Utama</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Headline Banner Utama"
                value={heroHeadline}
                onChange={(e) => setHeroHeadline(e.target.value)}
                error={fieldErrors.heroHeadline?.[0]}
                placeholder="Contoh: Membentuk Generasi Cerdas, Berakhlak Mulia & Ceria"
                helperText="Ditampilkan mencolok pada bagian atas beranda website."
              />
              <Textarea
                label="Subheadline / Keterangan Banner"
                rows={3}
                value={heroSubheadline}
                onChange={(e) => setHeroSubheadline(e.target.value)}
                error={fieldErrors.heroSubheadline?.[0]}
                placeholder="Tuliskan ringkasan singkat profil sekolah untuk pengunjung beranda..."
              />
            </CardContent>
          </Card>

          {/* Identitas Sekolah */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <School className="h-4 w-4 text-blue-600" />
                <span>Identitas & Kontak Sekolah</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Nama Sekolah"
                  required
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  error={fieldErrors.schoolName?.[0]}
                />
                <Input
                  label="NPSN (Nomor Pokok)"
                  required
                  value={npsn}
                  onChange={(e) => setNpsn(e.target.value)}
                  error={fieldErrors.npsn?.[0]}
                />
                <Input
                  label="Akreditasi Sekolah"
                  required
                  value={accreditation}
                  onChange={(e) => setAccreditation(e.target.value)}
                  error={fieldErrors.accreditation?.[0]}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="sm:col-span-2">
                  <Input
                    label="Alamat Lengkap"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    error={fieldErrors.address?.[0]}
                  />
                </div>
                <Input
                  label="Kota / Kabupaten"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  error={fieldErrors.city?.[0]}
                />
                <Input
                  label="Provinsi"
                  required
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  error={fieldErrors.province?.[0]}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <Input
                  label="Kode Pos"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  error={fieldErrors.postalCode?.[0]}
                  placeholder="Contoh: 12345"
                />
                <Input
                  label="Telepon Resmi"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  error={fieldErrors.phone?.[0]}
                />
                <Input
                  label="Email Resmi"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={fieldErrors.email?.[0]}
                />
                <Input
                  label="WhatsApp Layanan"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  error={fieldErrors.whatsapp?.[0]}
                  placeholder="081234567890"
                />
              </div>
            </CardContent>
          </Card>

          {/* Sambutan Kepala Sekolah */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sambutan Kepala Sekolah</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nama Kepala Sekolah"
                  required
                  value={principalName}
                  onChange={(e) => setPrincipalName(e.target.value)}
                  error={fieldErrors.principalName?.[0]}
                />
                <Input
                  label="NIP Kepala Sekolah"
                  value={principalNip}
                  onChange={(e) => setPrincipalNip(e.target.value)}
                  error={fieldErrors.principalNip?.[0]}
                />
              </div>
              <Input
                label="URL Foto Kepala Sekolah"
                value={principalPhoto}
                onChange={(e) => setPrincipalPhoto(e.target.value)}
                error={fieldErrors.principalPhoto?.[0]}
                placeholder="https://..."
              />
              <Textarea
                label="Isi Sambutan Kepala Sekolah"
                required
                rows={5}
                value={principalMessage}
                onChange={(e) => setPrincipalMessage(e.target.value)}
                error={fieldErrors.principalMessage?.[0]}
              />
            </CardContent>
          </Card>

          {/* Visi, Misi, Tujuan & Sejarah */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Visi, Misi, Tujuan & Sejarah</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                label="Visi Sekolah"
                required
                rows={3}
                value={vision}
                onChange={(e) => setVision(e.target.value)}
                error={fieldErrors.vision?.[0]}
              />
              <Textarea
                label="Misi Sekolah (Tiap baris angka/poin)"
                required
                rows={5}
                value={mission}
                onChange={(e) => setMission(e.target.value)}
                error={fieldErrors.mission?.[0]}
              />
              <Textarea
                label="Tujuan Sekolah"
                required
                rows={4}
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                error={fieldErrors.goals?.[0]}
              />
              <Textarea
                label="Sejarah Pendirian Sekolah"
                required
                rows={4}
                value={history}
                onChange={(e) => setHistory(e.target.value)}
                error={fieldErrors.history?.[0]}
              />
            </CardContent>
          </Card>

          {/* Statistik Sekolah */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Statistik Sekolah</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <Input
                  label="Jumlah Siswa"
                  type="number"
                  value={studentCount}
                  onChange={(e) => setStudentCount(Number(e.target.value))}
                  error={fieldErrors.studentCount?.[0]}
                />
                <Input
                  label="Jumlah Guru & Pendidik"
                  type="number"
                  value={teacherCount}
                  onChange={(e) => setTeacherCount(Number(e.target.value))}
                  error={fieldErrors.teacherCount?.[0]}
                />
                <Input
                  label="Rombongan Belajar (Kelas)"
                  type="number"
                  value={classroomCount}
                  onChange={(e) => setClassroomCount(Number(e.target.value))}
                  error={fieldErrors.classroomCount?.[0]}
                />
                <Input
                  label="Kegiatan Ekstrakurikuler"
                  type="number"
                  value={extracurricularCount}
                  onChange={(e) => setExtracurricularCount(Number(e.target.value))}
                  error={fieldErrors.extracurricularCount?.[0]}
                />
              </div>
            </CardContent>
          </Card>

          {/* Media Sosial & Peta */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Share2 className="h-4 w-4 text-blue-600" />
                <span>Media Sosial & Embed Google Maps (Opsional)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Instagram URL"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  error={fieldErrors.instagramUrl?.[0]}
                  placeholder="https://instagram.com/..."
                />
                <Input
                  label="Facebook URL"
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                  error={fieldErrors.facebookUrl?.[0]}
                  placeholder="https://facebook.com/..."
                />
                <Input
                  label="YouTube URL"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  error={fieldErrors.youtubeUrl?.[0]}
                  placeholder="https://youtube.com/@..."
                />
              </div>
              <Input
                label="Embed URL Google Maps (src iframe)"
                value={mapEmbedUrl}
                onChange={(e) => setMapEmbedUrl(e.target.value)}
                error={fieldErrors.mapEmbedUrl?.[0]}
                placeholder="https://www.google.com/maps/embed?pb=..."
              />
            </CardContent>
          </Card>

          <div className="flex justify-end pt-4">
            <Button type="submit" variant="primary" size="lg" isLoading={isSaving} className="gap-2">
              <Save className="h-4 w-4" />
              <span>Simpan Perubahan Profil</span>
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setIsFacilityModalOpen(true)} variant="primary" className="gap-2">
              <PlusCircle className="h-4 w-4" />
              <span>Tambah Fasilitas</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {facilities.map((fac) => (
              <Card key={fac.id} className="p-4 flex flex-col justify-between">
                <div>
                  <img
                    src={
                      fac.imageUrl ||
                      "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=400&q=80"
                    }
                    alt={fac.name}
                    className="w-full h-36 object-cover rounded-xl bg-slate-100 mb-3"
                  />
                  <h4 className="font-bold text-slate-900 text-sm">{fac.name}</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{fac.description}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteFacility(fac.id, fac.name)}
                    className="text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <Modal
            isOpen={isFacilityModalOpen}
            onClose={() => setIsFacilityModalOpen(false)}
            title="Tambah Fasilitas Baru"
          >
            <form onSubmit={handleAddFacility} className="space-y-4">
              <Input
                label="Nama Fasilitas"
                required
                value={facName}
                onChange={(e) => setFacName(e.target.value)}
                placeholder="Contoh: Laboratorium IPA & Komputer"
              />
              <Input
                label="URL Foto Fasilitas"
                value={facImage}
                onChange={(e) => setFacImage(e.target.value)}
                placeholder="https://..."
              />
              <Textarea
                label="Deskripsi Fasilitas"
                required
                rows={3}
                value={facDesc}
                onChange={(e) => setFacDesc(e.target.value)}
                placeholder="Keterangan fasilitas sekolah..."
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsFacilityModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" variant="primary">
                  Simpan Fasilitas
                </Button>
              </div>
            </form>
          </Modal>
        </div>
      )}
    </div>
  );
}
