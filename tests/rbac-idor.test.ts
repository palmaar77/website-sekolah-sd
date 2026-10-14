import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  assertStudentOwnership,
  assertRole,
  hasPermission,
  hasRole,
  AuthorizationError,
} from "../src/lib/auth/rbac.ts";
import {
  createSessionToken,
  verifySessionToken,
  createStudentSessionToken,
  verifyStudentSessionToken,
} from "../src/lib/auth/jwt.ts";
import type { SessionPayload, StudentPayload } from "../src/lib/auth/jwt.ts";
import { getStudentReport } from "../src/lib/services/grades.ts";
import { checkRateLimit } from "../src/lib/rate-limit.ts";

describe("Proteksi IDOR & Otorisasi Server-Side (RBAC)", () => {
  const student1Session: StudentPayload = {
    registrationNumber: "PPDB-2025-00001",
    fullName: "Ahmad Rayhan Pratama",
    status: "ACCEPTED",
    role: "STUDENT",
  };

  const adminSession: SessionPayload = {
    userId: "admin-1",
    email: "admin@sdharapanbangsa.sch.id",
    name: "Guru Wali Kelas",
    role: "ADMIN",
  };

  const superAdminSession: SessionPayload = {
    userId: "super-1",
    email: "kepsek@sdharapanbangsa.sch.id",
    name: "Kepala Sekolah",
    role: "SUPER_ADMIN",
  };

  it("harus MENGIZINKAN siswa membaca nilai dan data miliknya sendiri", () => {
    const result = assertStudentOwnership(student1Session, "PPDB-2025-00001");
    assert.equal(result.isOwner, true);
    assert.equal(result.isAdmin, false);
  });

  it("harus MENGIZINKAN siswa dengan format huruf kecil/spasi yang setara", () => {
    const result = assertStudentOwnership(student1Session, "  ppdb-2025-00001  ");
    assert.equal(result.isOwner, true);
  });

  it("harus MEMBLOKIR (403 IDOR) jika siswa mencoba mengakses ID siswa lain", () => {
    assert.throws(
      () => {
        // Siswa Ahmad (PPDB-2025-00001) mencoba membaca data siswa lain (PPDB-2025-00002)
        assertStudentOwnership(student1Session, "PPDB-2025-00002");
      },
      (err: any) => {
        assert.ok(err instanceof AuthorizationError);
        assert.equal(err.statusCode, 403);
        assert.equal(err.code, "IDOR_FORBIDDEN");
        assert.ok(err.message.includes("tidak memiliki wewenang untuk membaca nilai atau data siswa lain"));
        return true;
      }
    );
  });

  it("harus MENGIZINKAN Administrator & Guru membaca nilai siswa mana pun", () => {
    const resultAdmin = assertStudentOwnership(adminSession, "PPDB-2025-00002");
    assert.equal(resultAdmin.isAdmin, true);

    const resultSuper = assertStudentOwnership(superAdminSession, "PPDB-2025-00009");
    assert.equal(resultSuper.isAdmin, true);
  });

  it("harus MENOLAK (401) jika sesi kosong saat validasi kepemilikan", () => {
    assert.throws(
      () => {
        assertStudentOwnership(null, "PPDB-2025-00001");
      },
      (err: any) => {
        assert.ok(err instanceof AuthorizationError);
        assert.equal(err.statusCode, 401);
        return true;
      }
    );
  });
});

describe("Role-Based Access Control (RBAC) Server Validation", () => {
  it("harus memvalidasi izin role Super Admin vs Staf vs Siswa", () => {
    assert.equal(hasPermission("SUPER_ADMIN", "admin:manage_users"), true);
    assert.equal(hasPermission("ADMIN", "admin:manage_users"), false);
    assert.equal(hasPermission("STAFF", "admin:manage_users"), false);
    assert.equal(hasPermission("STUDENT", "admin:access"), false);
    assert.equal(hasPermission("STUDENT", "student:view_own_grades"), true);
  });

  it("harus melempar error ketika role tidak memenuhi kriteria assertRole", () => {
    assert.doesNotThrow(() => {
      assertRole("SUPER_ADMIN", ["SUPER_ADMIN", "ADMIN"]);
    });

    assert.throws(
      () => {
        assertRole("STAFF", ["SUPER_ADMIN"]);
      },
      (err: any) => {
        assert.ok(err instanceof AuthorizationError);
        assert.equal(err.statusCode, 403);
        return true;
      }
    );

    assert.throws(
      () => {
        assertRole("STUDENT", ["SUPER_ADMIN", "ADMIN", "STAFF"]);
      },
      (err: any) => {
        assert.ok(err instanceof AuthorizationError);
        assert.equal(err.statusCode, 403);
        return true;
      }
    );
  });
});

describe("Layanan Nilai Siswa (Kurikulum Merdeka)", () => {
  it("harus mengembalikan struktur rapor siswa lengkap dengan mata pelajaran dan KKM", async () => {
    const report = await getStudentReport("PPDB-2025-00001", "Ahmad Rayhan");
    assert.equal(report.registrationNumber, "PPDB-2025-00001");
    assert.ok(report.subjects.length >= 7);
    assert.ok(report.gpa > 75);
    assert.ok(report.attendance.sakit >= 0);
    assert.ok(typeof report.teacherNotes === "string" && report.teacherNotes.length > 10);
  });
});

describe("Pembatasan Percobaan Login (Rate Limiter)", () => {
  it("harus membatasi login setelah melewati kuota percobaan", () => {
    const testKey = "test-rate-limit-account-" + Date.now();
    for (let i = 0; i < 5; i++) {
      const res = checkRateLimit(testKey, { limit: 5, windowMs: 60000 });
      assert.equal(res.success, true);
    }

    // Percobaan ke-6 harus gagal (dibatasi)
    const blockedRes = checkRateLimit(testKey, { limit: 5, windowMs: 60000 });
    assert.equal(blockedRes.success, false);
    assert.equal(blockedRes.remaining, 0);
  });
});
