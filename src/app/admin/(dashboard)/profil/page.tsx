"use client";

import * as React from "react";
import { Save, PlusCircle, Trash2, Building2, CheckCircle2 } from "lucide-react";
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

  // Profile Form State
  const [schoolName, setSchoolName] = React.useState("");
  const [npsn, setNpsn] = React.useState("");
  const [accreditation, setAccreditation] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [city, setCity] = React.useState("");
  const [province, setProvince] = React.useState("");
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
        setHeroHeadline(p.heroHeadline || "");
        setHeroSubheadline(p.heroSubheadline || "");
        setStudentCount(p.studentCount || 480);
        setTeacherCount(p.teacherCount || 28);
        setClassroomCount(p.classroomCount || 18);
      }

      if (fData.success) {
        setFacilities(fData.data || []);
      }
    } catch (e) {
      console.error(e);
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
    try {
      const payload = {
        schoolName,
        npsn,
        accreditation,
        address,
        city,
        province,
        phone,
        email,
        whatsapp: whatsapp || null,
        principalName,
        principalNip: principalNip || null,
        principalMessage,
        principalPhoto: principalPhoto || null,
        vision,
        mission,
        goals,
        history,
        heroHeadline,
        heroSubheadline,
        studentCount: Number(studentCount),
        teacherCount: Number(teacherCount),
        classroomCount: Number(classroomCount),
        extracurricularCount: 12,
      };

      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert(data.message || "Gagal menyimpan profil.");
      }
    } catch {
      alert("Terjadi kesalahan.");
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
      }
    } catch {
      alert("Terjadi kesalahan.");
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
      alert("Terjadi kesalahan.");
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
            Perbarui visi, misi, sejarah, sambutan kepala sekolah, kontak, dan sarana fasilitas.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
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
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Perubahan profil sekolah berhasil disimpan!</span>
            </div>
          )}

          {/* Identitas Sekolah */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Identitas & Kontak Sekolah</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Nama Sekolah"
                  required
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                />
                <Input
                  label="NPSN (Nomor Pokok)"
                  required
                  value={npsn}
                  onChange={(e) => setNpsn(e.target.value)}
                />
                <Input
                  label="Akreditasi Sekolah"
                  required
                  value={accreditation}
                  onChange={(e) => setAccreditation(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Alamat Lengkap"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
                <Input
                  label="Kota / Kabupaten"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
                <Input
                  label="Provinsi"
                  required
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Telepon Resmi"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <Input
                  label="Email Resmi"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  label="No. WhatsApp Layanan"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
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
                />
                <Input
                  label="NIP Kepala Sekolah"
                  value={principalNip}
                  onChange={(e) => setPrincipalNip(e.target.value)}
                />
              </div>
              <Input
                label="URL Foto Kepala Sekolah"
                value={principalPhoto}
                onChange={(e) => setPrincipalPhoto(e.target.value)}
              />
              <Textarea
                label="Isi Sambutan Kepala Sekolah"
                required
                rows={5}
                value={principalMessage}
                onChange={(e) => setPrincipalMessage(e.target.value)}
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
              />
              <Textarea
                label="Misi Sekolah (Tiap baris angka/poin)"
                required
                rows={5}
                value={mission}
                onChange={(e) => setMission(e.target.value)}
              />
              <Textarea
                label="Tujuan Sekolah"
                required
                rows={4}
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
              />
              <Textarea
                label="Sejarah Pendirian Sekolah"
                required
                rows={4}
                value={history}
                onChange={(e) => setHistory(e.target.value)}
              />
            </CardContent>
          </Card>

          {/* Statistik Sekolah */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Statistik Sekolah</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Jumlah Siswa"
                  type="number"
                  value={studentCount}
                  onChange={(e) => setStudentCount(Number(e.target.value))}
                />
                <Input
                  label="Jumlah Guru & Pendidik"
                  type="number"
                  value={teacherCount}
                  onChange={(e) => setTeacherCount(Number(e.target.value))}
                />
                <Input
                  label="Jumlah Rombongan Belajar (Kelas)"
                  type="number"
                  value={classroomCount}
                  onChange={(e) => setClassroomCount(Number(e.target.value))}
                />
              </div>
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
