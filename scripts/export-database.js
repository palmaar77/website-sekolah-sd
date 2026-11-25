const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function exportAll() {
  console.log('Fetching all tables from database...');
  const [
    adminUsers,
    schoolProfile,
    teachers,
    facilities,
    extracurriculars,
    achievements,
    academicCalendars,
    news,
    announcements,
    galleryCategories,
    galleries,
    ppdbSetting,
    ppdbRegistrations,
    registrationDocuments,
    contactMessages,
    activityLogs
  ] = await Promise.all([
    prisma.adminUser.findMany(),
    prisma.schoolProfile.findFirst(),
    prisma.teacher.findMany({ orderBy: { order: 'asc' } }),
    prisma.facility.findMany({ orderBy: { order: 'asc' } }),
    prisma.extracurricular.findMany(),
    prisma.achievement.findMany(),
    prisma.academicCalendar.findMany({ orderBy: { eventDate: 'asc' } }),
    prisma.news.findMany({ orderBy: { publishedAt: 'desc' } }),
    prisma.announcement.findMany({ orderBy: { startDate: 'desc' } }),
    prisma.galleryCategory.findMany({ orderBy: { order: 'asc' } }),
    prisma.gallery.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.pPDBSetting.findFirst(),
    prisma.pPDBRegistration.findMany({ include: { documents: true } }),
    prisma.registrationDocument.findMany(),
    prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.activityLog.findMany({ orderBy: { createdAt: 'desc' } })
  ]);

  // Format JSON backup
  const fullData = {
    exportDate: new Date().toISOString(),
    schoolProfile,
    teachers,
    facilities,
    extracurriculars,
    achievements,
    academicCalendars,
    news,
    announcements,
    galleryCategories,
    galleries,
    ppdbSetting,
    ppdbRegistrations,
    registrationDocuments,
    contactMessages,
    activityLogs,
    adminUsers: adminUsers.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role, isActive: u.isActive }))
  };

  fs.writeFileSync('data/db.json', JSON.stringify(fullData, null, 2), 'utf8');
  console.log('SUCCESS: data/db.json exported cleanly!');
  console.log({
    teachers: teachers.length,
    facilities: facilities.length,
    news: news.length,
    announcements: announcements.length,
    galleries: galleries.length,
    ppdbRegistrations: ppdbRegistrations.length,
    contactMessages: contactMessages.length
  });

  // Also generate standard SQL INSERT backup file
  let sql = `-- Backup Database SD Negeri Harapan Bangsa\n-- Tanggal Export: ${new Date().toLocaleString('id-ID')}\n\n`;
  
  if (schoolProfile) {
    sql += `-- 1. Profil Sekolah\n`;
    sql += `INSERT INTO school_profiles ("id", "schoolName", "npsn", "accreditation", "address", "city", "province", "phone", "email", "principalName", "principalNip", "vision", "mission", "goals", "history", "heroHeadline", "heroSubheadline", "studentCount", "teacherCount", "classroomCount", "extracurricularCount", "updatedAt") VALUES ('${schoolProfile.id}', '${escapeSql(schoolProfile.schoolName)}', '${escapeSql(schoolProfile.npsn)}', '${escapeSql(schoolProfile.accreditation)}', '${escapeSql(schoolProfile.address)}', '${escapeSql(schoolProfile.city)}', '${escapeSql(schoolProfile.province)}', '${escapeSql(schoolProfile.phone)}', '${escapeSql(schoolProfile.email)}', '${escapeSql(schoolProfile.principalName)}', '${escapeSql(schoolProfile.principalNip)}', '${escapeSql(schoolProfile.vision)}', '${escapeSql(schoolProfile.mission)}', '${escapeSql(schoolProfile.goals)}', '${escapeSql(schoolProfile.history)}', '${escapeSql(schoolProfile.heroHeadline)}', '${escapeSql(schoolProfile.heroSubheadline)}', ${schoolProfile.studentCount}, ${schoolProfile.teacherCount}, ${schoolProfile.classroomCount}, ${schoolProfile.extracurricularCount}, NOW()) ON CONFLICT (id) DO NOTHING;\n\n`;
  }

  if (teachers.length > 0) {
    sql += `-- 2. Guru & Tenaga Kependidikan\n`;
    teachers.forEach(t => {
      sql += `INSERT INTO teachers ("id", "name", "nip", "role", "subject", "education", "photo", "order", "isActive", "createdAt", "updatedAt") VALUES ('${t.id}', '${escapeSql(t.name)}', '${escapeSql(t.nip || '')}', '${escapeSql(t.role)}', '${escapeSql(t.subject || '')}', '${escapeSql(t.education || '')}', '${escapeSql(t.photo || '')}', ${t.order}, ${t.isActive}, NOW(), NOW()) ON CONFLICT (id) DO NOTHING;\n`;
    });
    sql += `\n`;
  }

  if (news.length > 0) {
    sql += `-- 3. Berita & Pengumuman\n`;
    news.forEach(n => {
      sql += `INSERT INTO news ("id", "title", "slug", "excerpt", "content", "coverImage", "category", "status", "isFeatured", "viewCount", "publishedAt", "createdAt", "updatedAt") VALUES ('${n.id}', '${escapeSql(n.title)}', '${escapeSql(n.slug)}', '${escapeSql(n.excerpt)}', '${escapeSql(n.content)}', '${escapeSql(n.coverImage || '')}', '${escapeSql(n.category)}', '${n.status}', ${n.isFeatured}, ${n.viewCount}, NOW(), NOW(), NOW()) ON CONFLICT (id) DO NOTHING;\n`;
    });
    sql += `\n`;
  }

  fs.writeFileSync('data/database_backup.sql', sql, 'utf8');
  console.log('SUCCESS: data/database_backup.sql created!');
}

function escapeSql(str) {
  if (!str) return '';
  return str.replace(/'/g, "''").replace(/\\/g, "\\\\");
}

exportAll()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
