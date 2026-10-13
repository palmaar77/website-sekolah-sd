import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { hashPassword, verifyPassword } from "../src/lib/auth/password.ts";
import {
  createSessionToken,
  verifySessionToken,
  createStudentSessionToken,
  verifyStudentSessionToken,
} from "../src/lib/auth/jwt.ts";

describe("Autentikasi & Keamanan (Bcrypt & JWT Jose)", () => {
  it("harus mampu melakukan hash dan verifikasi kata sandi dengan benar", async () => {
    const rawPassword = "AdminSekolah2025!Secure";
    const hashed = await hashPassword(rawPassword);

    assert.notEqual(hashed, rawPassword);
    assert.ok(hashed.startsWith("$2a$") || hashed.startsWith("$2b$"));

    const isValid = await verifyPassword(rawPassword, hashed);
    assert.equal(isValid, true);

    const isWrong = await verifyPassword("WrongPassword123", hashed);
    assert.equal(isWrong, false);
  });

  it("harus mampu membuat dan memverifikasi JWT session token admin", async () => {
    const payload = {
      userId: "test-user-id-123",
      email: "admin@sdharapanbangsa.sch.id",
      name: "Admin Sekolah",
      role: "SUPER_ADMIN",
    };

    const token = await createSessionToken(payload);
    assert.ok(typeof token === "string" && token.length > 20);

    const verified = await verifySessionToken(token);
    assert.ok(verified !== null);
    assert.equal(verified?.userId, payload.userId);
    assert.equal(verified?.email, payload.email);
    assert.equal(verified?.role, payload.role);
  });

  it("harus mampu membuat dan memverifikasi JWT session token siswa", async () => {
    const studentPayload = {
      registrationNumber: "PPDB-2025-00001",
      fullName: "Ahmad Rayhan",
      status: "ACCEPTED",
      role: "STUDENT" as const,
    };

    const token = await createStudentSessionToken(studentPayload);
    assert.ok(typeof token === "string" && token.length > 20);

    const verified = await verifyStudentSessionToken(token);
    assert.ok(verified !== null);
    assert.equal(verified?.registrationNumber, studentPayload.registrationNumber);
    assert.equal(verified?.fullName, studentPayload.fullName);
    assert.equal(verified?.role, "STUDENT");
  });

  it("harus menolak token yang rusak atau dipalsukan", async () => {
    const fakeToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature";
    const verified = await verifySessionToken(fakeToken);
    assert.equal(verified, null);

    const studentVerified = await verifyStudentSessionToken(fakeToken);
    assert.equal(studentVerified, null);
  });
});

