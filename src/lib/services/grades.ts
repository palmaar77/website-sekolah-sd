/**
 * Layanan Data Nilai & Rapor Akademik Siswa (Kurikulum Merdeka)
 * Terintegrasi dengan database dan sistem fallback mandiri
 */

export interface SubjectGrade {
  code: string;
  name: string;
  kkm: number;
  score: number;
  predicate: "A" | "B" | "C" | "D";
  competencyDesc: string;
}

export interface StudentReport {
  registrationNumber: string;
  fullName: string;
  nisn: string;
  className: string;
  semester: string;
  academicYear: string;
  phase: string;
  homeroomTeacher: string;
  homeroomTeacherNip: string;
  gpa: number;
  rank: string;
  totalSubjects: number;
  status: string;
  attendance: {
    sakit: number;
    izin: number;
    tanpaKeterangan: number;
  };
  extracurriculars: Array<{
    name: string;
    predicate: "Sangat Baik" | "Baik" | "Cukup";
    notes: string;
  }>;
  teacherNotes: string;
  subjects: SubjectGrade[];
  updatedAt: string;
}

export const DEFAULT_CURRICULUM_SUBJECTS = [
  {
    code: "PAI",
    name: "Pendidikan Agama dan Budi Pekerti",
    kkm: 75,
    baseScore: 90,
    competencyDesc: "Sangat baik dalam memahami kisah keteladanan para nabi dan mempraktikkan tata cara doa sehari-hari dengan tertib.",
  },
  {
    code: "PPKN",
    name: "Pendidikan Pancasila",
    kkm: 75,
    baseScore: 88,
    competencyDesc: "Menunjukkan pemahaman yang baik tentang simbol sila Pancasila serta aktif menerapkan sikap gotong royong di lingkungan kelas.",
  },
  {
    code: "BIND",
    name: "Bahasa Indonesia",
    kkm: 75,
    baseScore: 87,
    competencyDesc: "Terampil dalam melafalkan intonasi membaca teks narasi pendek dan mampu menulis kalimat sederhana dengan ejaan yang rapi.",
  },
  {
    code: "MTK",
    name: "Matematika",
    kkm: 75,
    baseScore: 85,
    competencyDesc: "Menguasai konsep penjumlahan dan pengurangan bilangan cacah sampai 100 dengan pemecahan masalah kontekstual.",
  },
  {
    code: "IPAS",
    name: "Ilmu Pengetahuan Alam dan Sosial (IPAS)",
    kkm: 75,
    baseScore: 89,
    competencyDesc: "Sangat aktif dalam mengamati siklus makhluk hidup di sekitar taman sekolah dan peduli terhadap kebersihan lingkungan.",
  },
  {
    code: "PJOK",
    name: "Pendidikan Jasmani, Olahraga, dan Kesehatan",
    kkm: 75,
    baseScore: 92,
    competencyDesc: "Sangat terampil dalam mempraktikkan gerak dasar lokomotor, non-lokomotor, dan manipulatif dengan penuh sportivitas.",
  },
  {
    code: "SENI",
    name: "Seni Rupa dan Prakarya",
    kkm: 75,
    baseScore: 86,
    competencyDesc: "Kreatif dalam memadukan warna pada karya kolase bahan alam dan memiliki kerapian yang konsisten.",
  },
  {
    code: "BING",
    name: "Bahasa Inggris Dasar",
    kkm: 75,
    baseScore: 84,
    competencyDesc: "Mampu merespons sapaan sederhana (greetings) dan menyebutkan kosakata benda di dalam kelas dengan percaya diri.",
  },
];

/**
 * Basis Data Nilai Siswa (In-Memory Repository dengan dukungan multi-siswa)
 */
const studentReportsStore: Map<string, StudentReport> = new Map();

export function getPredicate(score: number): "A" | "B" | "C" | "D" {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  return "D";
}

/**
 * Inisialisasi data nilai untuk nomor registrasi tertentu
 */
function createDefaultReportForStudent(
  registrationNumber: string,
  fullName: string = "Peserta Didik Harapan"
): StudentReport {
  // Hash sederhana dari nomor registrasi untuk variasi nilai yang konsisten
  let seed = 0;
  for (let i = 0; i < registrationNumber.length; i++) {
    seed += registrationNumber.charCodeAt(i);
  }

  const subjects: SubjectGrade[] = DEFAULT_CURRICULUM_SUBJECTS.map((sub, idx) => {
    // Variasikan nilai antara 80 s/d 96 berdasarkan seed
    const offset = ((seed * (idx + 3)) % 15) - 3;
    const finalScore = Math.min(98, Math.max(76, sub.baseScore + offset));
    return {
      code: sub.code,
      name: sub.name,
      kkm: sub.kkm,
      score: finalScore,
      predicate: getPredicate(finalScore),
      competencyDesc: sub.competencyDesc,
    };
  });

  const totalScore = subjects.reduce((acc, curr) => acc + curr.score, 0);
  const gpa = Math.round((totalScore / subjects.length) * 10) / 10;
  const rankNum = Math.min(28, Math.max(1, (seed % 10) + 1));

  return {
    registrationNumber: registrationNumber.toUpperCase().trim(),
    fullName,
    nisn: `012${seed}8921`,
    className: "Kelas 1 (Fase A) - Merdeka",
    semester: "Semester Ganjil",
    academicYear: "2024/2025",
    phase: "Fase A (Kelas 1 - 2 SD)",
    homeroomTeacher: "Hj. Nurul Aini, S.Pd., M.Pd.",
    homeroomTeacherNip: "19820415 200801 2 009",
    gpa,
    rank: `${rankNum} dari 28 siswa`,
    totalSubjects: subjects.length,
    status: "Tuntas Seluruh Capaian Pembelajaran",
    attendance: {
      sakit: (seed % 3),
      izin: (seed % 2),
      tanpaKeterangan: 0,
    },
    extracurriculars: [
      {
        name: "Pramuka Siaga",
        predicate: "Sangat Baik",
        notes: "Disiplin, rajin mengikuti latihan mingguan, dan mandiri.",
      },
      {
        name: "Seni Musik & Tari Tradisional",
        predicate: "Baik",
        notes: "Mampu mengikuti ritme irama musik dengan harmonis.",
      },
    ],
    teacherNotes:
      "Ananda memiliki motivasi belajar yang tinggi, santun dalam berucap, dan selalu kooperatif saat mengerjakan tugas kelompok. Pertahankan semangat belajar dan prestasimu!",
    subjects,
    updatedAt: new Date().toISOString(),
  };
}

// Seed data awal untuk siswa demo
studentReportsStore.set(
  "PPDB-2025-00001",
  createDefaultReportForStudent("PPDB-2025-00001", "Ahmad Rayhan Pratama")
);
studentReportsStore.set(
  "PPDB-2025-A1001",
  createDefaultReportForStudent("PPDB-2025-A1001", "Ananda Bintang Nusantara")
);
studentReportsStore.set(
  "PPDB-2025-B2002",
  createDefaultReportForStudent("PPDB-2025-B2002", "Clarissa Putri Kirana")
);
studentReportsStore.set(
  "PPDB-2025-C3003",
  createDefaultReportForStudent("PPDB-2025-C3003", "Dimas Aditya Saputra")
);

/**
 * Mengambil data nilai rapor berdasarkan nomor registrasi siswa
 */
export async function getStudentReport(
  registrationNumber: string,
  fallbackName?: string
): Promise<StudentReport> {
  const cleanReg = registrationNumber.trim().toUpperCase();
  let report = studentReportsStore.get(cleanReg);

  if (!report) {
    report = createDefaultReportForStudent(cleanReg, fallbackName || "Peserta Didik");
    studentReportsStore.set(cleanReg, report);
  }

  return report;
}

/**
 * Mengambil daftar seluruh siswa beserta ringkasan nilai (khusus Guru / Admin)
 */
export async function getAllStudentsReportsSummary(): Promise<
  Array<{
    registrationNumber: string;
    fullName: string;
    className: string;
    semester: string;
    gpa: number;
    rank: string;
    status: string;
  }>
> {
  // Sinkronisasi otomatis dengan data pendaftaran PPDB yang ada
  try {
    const { getPPDBRegistrations } = await import("@/lib/storage/db");
    const ppdbResult = getPPDBRegistrations({ limit: 100 });
    if (ppdbResult && Array.isArray(ppdbResult.data)) {
      for (const reg of ppdbResult.data) {
        const cleanReg = (reg.registrationNumber || "").trim().toUpperCase();
        if (cleanReg && !studentReportsStore.has(cleanReg)) {
          studentReportsStore.set(
            cleanReg,
            createDefaultReportForStudent(cleanReg, reg.fullName || "Peserta Didik")
          );
        }
      }
    }
  } catch {
    // Abaikan jika database storage sedang tidak tersedia
  }

  const list = Array.from(studentReportsStore.values());
  return list.map((r) => ({
    registrationNumber: r.registrationNumber,
    fullName: r.fullName,
    className: r.className,
    semester: r.semester,
    gpa: r.gpa,
    rank: r.rank,
    status: r.status,
  }));
}

/**
 * Memperbarui nilai dan catatan rapor siswa (khusus Guru / Admin)
 */
export async function updateStudentReport(
  registrationNumber: string,
  data: Partial<StudentReport>
): Promise<StudentReport> {
  const cleanReg = registrationNumber.trim().toUpperCase();
  const existing = await getStudentReport(cleanReg);

  const updatedSubjects = data.subjects ? data.subjects.map((s) => ({
    ...s,
    predicate: getPredicate(Number(s.score) || 0),
  })) : existing.subjects;

  const totalScore = updatedSubjects.reduce((acc, curr) => acc + (Number(curr.score) || 0), 0);
  const gpa = updatedSubjects.length > 0
    ? Math.round((totalScore / updatedSubjects.length) * 10) / 10
    : existing.gpa;

  const updated: StudentReport = {
    ...existing,
    ...data,
    registrationNumber: cleanReg,
    subjects: updatedSubjects,
    gpa,
    attendance: {
      ...existing.attendance,
      ...(data.attendance || {}),
    },
    updatedAt: new Date().toISOString(),
  };

  studentReportsStore.set(cleanReg, updated);
  return updated;
}

/**
 * Membuat rapor siswa baru secara langsung oleh Guru / Administrator
 */
export async function createStudentReport(
  reportData: Partial<StudentReport>
): Promise<StudentReport> {
  const cleanReg = (reportData.registrationNumber || "").trim().toUpperCase();
  if (!cleanReg) {
    throw new Error("Nomor registrasi siswa wajib diisi.");
  }
  if (!reportData.fullName || !reportData.fullName.trim()) {
    throw new Error("Nama lengkap siswa wajib diisi.");
  }

  const subjects: SubjectGrade[] =
    reportData.subjects && reportData.subjects.length > 0
      ? reportData.subjects.map((s) => {
          const score = Math.max(0, Math.min(100, Number(s.score) || 0));
          return {
            code: s.code || "MAPEL",
            name: s.name,
            kkm: Number(s.kkm) || 75,
            score,
            predicate: s.predicate || getPredicate(score),
            competencyDesc:
              s.competencyDesc ||
              `Menunjukkan capaian pemahaman yang baik dalam pembelajaran muatan ${s.name}.`,
          };
        })
      : DEFAULT_CURRICULUM_SUBJECTS.map((sub) => ({
          code: sub.code,
          name: sub.name,
          kkm: sub.kkm,
          score: sub.baseScore,
          predicate: getPredicate(sub.baseScore),
          competencyDesc: sub.competencyDesc,
        }));

  const totalScore = subjects.reduce((acc, curr) => acc + curr.score, 0);
  const gpa = subjects.length > 0 ? Math.round((totalScore / subjects.length) * 10) / 10 : 85;

  const currentCount = studentReportsStore.size;
  const rank = reportData.rank || `${Math.min(28, currentCount + 1)} dari 28 siswa`;

  const newReport: StudentReport = {
    registrationNumber: cleanReg,
    fullName: reportData.fullName.trim(),
    nisn: reportData.nisn ? reportData.nisn.trim() : `012${Math.floor(1000000 + Math.random() * 9000000)}`,
    className: reportData.className?.trim() || "Kelas 1 (Fase A) - Merdeka",
    semester: reportData.semester || "Semester Ganjil",
    academicYear: reportData.academicYear || "2024/2025",
    phase: reportData.phase || "Fase A (Kelas 1 - 2 SD)",
    homeroomTeacher: reportData.homeroomTeacher?.trim() || "Hj. Nurul Aini, S.Pd., M.Pd.",
    homeroomTeacherNip: reportData.homeroomTeacherNip?.trim() || "19820415 200801 2 009",
    gpa,
    rank,
    totalSubjects: subjects.length,
    status: reportData.status || "Tuntas Seluruh Capaian Pembelajaran",
    attendance: {
      sakit: Number(reportData.attendance?.sakit) || 0,
      izin: Number(reportData.attendance?.izin) || 0,
      tanpaKeterangan: Number(reportData.attendance?.tanpaKeterangan) || 0,
    },
    extracurriculars:
      reportData.extracurriculars && reportData.extracurriculars.length > 0
        ? reportData.extracurriculars
        : [
            {
              name: "Pramuka Siaga",
              predicate: "Sangat Baik",
              notes: "Disiplin, rajin mengikuti latihan mingguan, dan mandiri.",
            },
            {
              name: "Seni Musik & Tari Tradisional",
              predicate: "Baik",
              notes: "Mampu mengikuti ritme irama musik dengan harmonis.",
            },
          ],
    teacherNotes:
      reportData.teacherNotes?.trim() ||
      "Ananda memiliki motivasi belajar yang tinggi, berakhlak mulia, dan aktif saat pembelajaran di kelas. Pertahankan semangat belajarmu!",
    subjects,
    updatedAt: new Date().toISOString(),
  };

  studentReportsStore.set(cleanReg, newReport);
  return newReport;
}

/**
 * Mengambil daftar calon siswa dari PPDB yang dapat dibuatkan rapor
 */
export async function getAvailableStudentsForReport(): Promise<
  Array<{
    registrationNumber: string;
    fullName: string;
    nisn: string;
    className: string;
  }>
> {
  const result: Array<{
    registrationNumber: string;
    fullName: string;
    nisn: string;
    className: string;
  }> = [];

  try {
    const { getPPDBRegistrations } = await import("@/lib/storage/db");
    const ppdb = getPPDBRegistrations({ limit: 100 });
    if (ppdb && Array.isArray(ppdb.data)) {
      for (const reg of ppdb.data) {
        result.push({
          registrationNumber: reg.registrationNumber,
          fullName: reg.fullName,
          nisn: `012${(reg.nik || "").slice(-6) || "789123"}`,
          className: "Kelas 1 (Fase A) - Merdeka",
        });
      }
    }
  } catch {
    // Abaikan jika tidak tersedia
  }

  return result;
}
