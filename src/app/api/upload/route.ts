import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  try {
    // Pastikan hanya admin terautentikasi yang dapat upload
    await requireAuth();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "Berkas tidak ditemukan" },
        { status: 400 }
      );
    }

    // Validasi ukuran berkas
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, message: "Ukuran berkas melebihi batas maksimal 5MB" },
        { status: 400 }
      );
    }

    // Validasi tipe MIME
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Tipe berkas tidak didukung. Gunakan JPG, PNG, WebP, GIF, atau PDF.",
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Buat nama berkas acak yang aman untuk menghindari penimpaan & traversal
    const ext = path.extname(file.name).toLowerCase() || (file.type === "application/pdf" ? ".pdf" : ".jpg");
    const safeFilename = `${crypto.randomUUID()}${ext}`;

    let publicUrl = "";
    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });

      const filePath = path.join(uploadDir, safeFilename);
      await writeFile(filePath, buffer);

      publicUrl = `/uploads/${safeFilename}`;
    } catch (writeErr) {
      // Fallback untuk lingkungan serverless / read-only (misal Vercel)
      console.warn("Disk upload unavailable, using Base64 Data URL fallback:", writeErr);
      publicUrl = `data:${file.type};base64,${buffer.toString("base64")}`;
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, message: "Akses ditolak" },
        { status: 401 }
      );
    }
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengunggah berkas" },
      { status: 500 }
    );
  }
}
