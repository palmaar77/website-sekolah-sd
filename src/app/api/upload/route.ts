import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/rate-limit";
import { logActivity } from "@/lib/audit";
import {
  apiBadRequest,
  apiTooManyRequests,
  apiSuccess,
  handleApiError,
} from "@/lib/api-response";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

/**
 * Pemetaan ketat MIME type yang diizinkan ke ekstensi berkas yang aman
 * Mencegah eksekusi skrip berbahaya dan Bypass Ekstensi (OWASP A08: Software & Data Integrity Failures)
 */
const ALLOWED_MIME_MAP: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "application/pdf": ".pdf",
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  try {
    // 1. Pastikan hanya admin/staf terautentikasi yang dapat upload
    const session = await requireAuth(["SUPER_ADMIN", "ADMIN", "STAFF"]);

    // 2. Pembatasan laju upload (Rate Limiting) per akun/IP untuk mencegah kehabisan kapasitas storage (DoS)
    const ip = request.headers.get("x-forwarded-for") || "local-ip";
    const rateCheck = checkRateLimit(`upload:${session.userId || ip}`, {
      limit: 20,
      windowMs: 10 * 60 * 1000,
    });

    if (!rateCheck.success) {
      return apiTooManyRequests(
        "Batas frekuensi unggah berkas tercapai. Silakan coba kembali beberapa saat lagi."
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return apiBadRequest("Berkas tidak ditemukan dalam formulir unggahan.");
    }

    // 3. Validasi ukuran berkas
    if (file.size > MAX_FILE_SIZE) {
      return apiBadRequest("Ukuran berkas melebihi batas maksimal 5MB.");
    }

    // 4. Validasi tipe MIME terhadap whitelist ketat
    const safeExt = ALLOWED_MIME_MAP[file.type];
    if (!safeExt) {
      return apiBadRequest(
        "Tipe berkas tidak didukung. Format yang diizinkan: JPG, PNG, WebP, GIF, dan PDF."
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 5. Generate nama berkas acak (UUIDv4) dengan ekstensi yang divalidasi
    // Menghilangkan nama asli pengguna untuk mencegah Directory Traversal (OWASP A01)
    const safeFilename = `${crypto.randomUUID()}${safeExt}`;

    let publicUrl = "";
    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });

      const filePath = path.join(uploadDir, safeFilename);
      await writeFile(filePath, buffer);

      publicUrl = `/uploads/${safeFilename}`;
    } catch (writeErr) {
      // Fallback aman untuk lingkungan Serverless Read-Only (misal Vercel Serverless)
      console.warn("Disk upload unavailable, using Base64 Data URL fallback:", writeErr);
      publicUrl = `data:${file.type};base64,${buffer.toString("base64")}`;
    }

    // 6. Catat riwayat audit unggahan
    try {
      await logActivity({
        adminId: session.userId,
        adminName: session.name,
        action: "FILE_UPLOAD",
        details: `Mengunggah berkas: ${safeFilename} (${(file.size / 1024).toFixed(1)} KB, MIME: ${file.type})`,
        ipAddress: ip,
      });
    } catch {}

    return apiSuccess({
      url: publicUrl,
      fileName: safeFilename,
      fileSize: file.size,
      mimeType: file.type,
    });
  } catch (error: unknown) {
    return handleApiError(error, "Gagal mengunggah berkas ke server.");
  }
}
