import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const AUTH_COOKIE_NAME = "sd_admin_session";
const STUDENT_COOKIE_NAME = "sd_student_session";
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key-change-in-production-min32chars";
const encodedKey = new TextEncoder().encode(JWT_SECRET);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Area & Route Administrator
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  const isAdminLoginPage = pathname === "/admin/login";
  const isAdminApiRoute = pathname.startsWith("/api/admin");

  if (isAdminRoute || isAdminApiRoute) {
    const adminToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    let isAdminAuthenticated = false;

    if (adminToken) {
      try {
        const { payload } = await jwtVerify(adminToken, encodedKey, { algorithms: ["HS256"] });
        // Verifikasi bahwa peran adalah Admin / Guru / Staf resmi, bukan Siswa
        const role = payload.role as string;
        if (role === "SUPER_ADMIN" || role === "ADMIN" || role === "STAFF") {
          isAdminAuthenticated = true;
        }
      } catch {
        isAdminAuthenticated = false;
      }
    }

    // Jika sudah login admin dan buka halaman login admin -> alihkan ke dashboard admin
    if (isAdminLoginPage) {
      if (isAdminAuthenticated) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.next();
    }

    // Jika belum login admin dan mencoba mengakses halaman admin atau API admin
    if (!isAdminAuthenticated) {
      if (isAdminApiRoute) {
        return NextResponse.json(
          {
            success: false,
            code: "UNAUTHORIZED",
            message: "Akses tidak diizinkan. Silakan login sebagai administrator sekolah.",
          },
          { status: 401 }
        );
      }
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Area & Route Portal Siswa
  const isStudentLoginPage = pathname === "/siswa/login";
  const isStudentProtectedRoute =
    pathname.startsWith("/siswa/dashboard") ||
    pathname.startsWith("/siswa/nilai") ||
    pathname.startsWith("/siswa/profil") ||
    pathname.startsWith("/siswa/data");
  const isStudentApiRoute = pathname.startsWith("/api/siswa");

  if (isStudentLoginPage || isStudentProtectedRoute || isStudentApiRoute) {
    const studentToken = request.cookies.get(STUDENT_COOKIE_NAME)?.value;
    const adminToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    let isStudentAuthenticated = false;
    let isStaffAuthenticated = false;

    if (studentToken) {
      try {
        const { payload } = await jwtVerify(studentToken, encodedKey, { algorithms: ["HS256"] });
        if (payload.role === "STUDENT" && payload.registrationNumber) {
          isStudentAuthenticated = true;
        }
      } catch {
        isStudentAuthenticated = false;
      }
    }

    if (adminToken) {
      try {
        const { payload } = await jwtVerify(adminToken, encodedKey, { algorithms: ["HS256"] });
        const role = payload.role as string;
        if (role === "SUPER_ADMIN" || role === "ADMIN" || role === "STAFF") {
          isStaffAuthenticated = true;
        }
      } catch {
        isStaffAuthenticated = false;
      }
    }

    // Jika sudah login siswa dan buka halaman login siswa -> alihkan ke dashboard siswa
    if (isStudentLoginPage) {
      if (isStudentAuthenticated) {
        return NextResponse.redirect(new URL("/siswa/dashboard", request.url));
      }
      return NextResponse.next();
    }

    // Jika mengakses area siswa yang dilindungi tapi belum login (baik sebagai siswa maupun guru/admin)
    if (!isStudentAuthenticated && !isStaffAuthenticated) {
      if (isStudentApiRoute) {
        return NextResponse.json(
          {
            success: false,
            code: "UNAUTHORIZED",
            message: "Akses ditolak. Sesi portal siswa tidak valid atau telah berakhir.",
          },
          { status: 401 }
        );
      }
      const studentLoginUrl = new URL("/siswa/login", request.url);
      studentLoginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(studentLoginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/api/admin/:path*",
    "/siswa/login",
    "/siswa/dashboard",
    "/siswa/dashboard/:path*",
    "/siswa/nilai",
    "/siswa/nilai/:path*",
    "/siswa/profil",
    "/siswa/profil/:path*",
    "/siswa/data/:path*",
    "/api/siswa/:path*",
  ],
};
