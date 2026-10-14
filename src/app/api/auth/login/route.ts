import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth";
import { verifyPassword, hashPassword } from "@/lib/auth/password";
import { createSessionToken, AUTH_COOKIE_NAME } from "@/lib/auth/jwt";
import { checkRateLimit } from "@/lib/rate-limit";
import { logActivity } from "@/lib/audit";

export async function POST(request: NextRequest) {
  try {
    // 1. Dapatkan IP klien untuk rate limiting
    const ip = request.headers.get("x-forwarded-for") || "local-ip";
    const rateCheck = checkRateLimit(`login:${ip}`, { limit: 10, windowMs: 15 * 60 * 1000 });

    if (!rateCheck.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Terlalu banyak percobaan login. Silakan tunggu beberapa menit lagi.",
        },
        { status: 429 }
      );
    }

    // 2. Parse & validasi body
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validasi gagal",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const cleanEmail = email.toLowerCase().trim();

    // 2b. Rate limiting berbasis akun email (mencegah brute-force terdistribusi)
    const emailRateCheck = checkRateLimit(`login-email:${cleanEmail}`, {
      limit: 5,
      windowMs: 15 * 60 * 1000,
    });
    if (!emailRateCheck.success) {
      return NextResponse.json(
        {
          success: false,
          code: "TOO_MANY_ATTEMPTS",
          message:
            "Terlalu banyak percobaan gagal pada akun ini. Demi keamanan, silakan tunggu 15 menit.",
        },
        { status: 429 }
      );
    }

    const defaultEmail = (process.env.ADMIN_EMAIL || "admin@sdharapanbangsa.sch.id").toLowerCase().trim();
    const defaultPassword = process.env.ADMIN_PASSWORD || "AdminSekolah2025!Secure";

    let user: { id: string; name: string; email: string; role: string; passwordHash?: string; isActive?: boolean } | null = null;
    let isDbConnected = false;

    // 3. Coba cari admin di database
    try {
      user = await prisma.adminUser.findUnique({
        where: { email: email.toLowerCase().trim() },
      });
      if (user) {
        isDbConnected = true;
      }
    } catch {
      // PostgreSQL offline / belum terkoneksi, gunakan fallback akun default
      console.warn("Database offline during login, checking default credentials...");
    }

    // 4. Verifikasi kredensial
    if (user && isDbConnected) {
      if (!user.isActive) {
        return NextResponse.json(
          { success: false, message: "Akun admin telah dinonaktifkan" },
          { status: 401 }
        );
      }

      let isPasswordValid = await verifyPassword(password, user.passwordHash || "");

      // Auto-sinkronisasi jika kredensial yang dimasukkan cocok dengan kredensial resmi .env
      if (!isPasswordValid && cleanEmail === defaultEmail && password === defaultPassword) {
        isPasswordValid = true;
        try {
          const newHash = await hashPassword(defaultPassword);
          await prisma.adminUser.update({
            where: { id: user.id },
            data: { passwordHash: newHash, lastLoginAt: new Date() },
          });
        } catch {}
      }

      if (!isPasswordValid) {
        return NextResponse.json(
          { success: false, message: "Email atau kata sandi salah." },
          { status: 401 }
        );
      }

      try {
        await prisma.adminUser.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });
      } catch {}
    } else {
      // Fallback: Jika DB belum terkoneksi atau akun belum diseed
      const isEmailMatch = email.toLowerCase().trim() === defaultEmail;
      const isPasswordMatch = password === defaultPassword;

      if (isEmailMatch && isPasswordMatch) {
        user = {
          id: "admin-default-id",
          name: "Administrator Utama (Demo)",
          email: defaultEmail,
          role: "SUPER_ADMIN",
        };
      } else {
        return NextResponse.json(
          { success: false, message: "Email atau kata sandi salah. Gunakan kredensial resmi sekolah." },
          { status: 401 }
        );
      }
    }

    // 5. Buat JWT session token
    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    // 6. Catat audit log bila DB aktif
    try {
      await logActivity({
        adminId: user.id,
        adminName: user.name,
        action: "LOGIN",
        details: isDbConnected ? "Admin berhasil masuk ke dashboard" : "Admin berhasil masuk (Mode Standalone Fallback)",
        ipAddress: ip,
      });
    } catch {}

    // 7. Buat response dengan HttpOnly Cookie yang aman
    const response = NextResponse.json({
      success: true,
      message: "Login berhasil",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60, // 1 hari
    });

    return response;
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server saat memproses login admin" },
      { status: 500 }
    );
  }
}
