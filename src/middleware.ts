import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { applySecurityHeaders } from "@/lib/security/headers";
import { validateSameOrigin } from "@/lib/security/csrf";

const AUTH_COOKIE_NAME = "sd_admin_session";
const STUDENT_COOKIE_NAME = "sd_student_session";
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key-change-in-production-min32chars";
const encodedKey = new TextEncoder().encode(JWT_SECRET);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Validasi Proteksi CSRF & Origin pada API Mutasi (POST, PUT, PATCH, DELETE)
  if (pathname.startsWith("/api/")) {
    const originCheck = validateSameOrigin(request);
    if (!originCheck.isValid) {
      const errorResponse = NextResponse.json(
        {
          success: false,
          code: "CSRF_ORIGIN_REJECTED",
          message: originCheck.reason || "Permintaan ditolak karena tidak memenuhi kebijakan Same-Origin.",
        },
        { status: 403 }
      );
      applySecurityHeaders(errorResponse.headers);
      return errorResponse;
    }
  }

  // 2. Area & Route Administrator
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
        const redirectRes = NextResponse.redirect(new URL("/admin", request.url));
        applySecurityHeaders(redirectRes.headers);
        return redirectRes;
      }
      const nextRes = NextResponse.next();
      applySecurityHeaders(nextRes.headers);
      return nextRes;
    }

    // Jika belum login admin dan mencoba mengakses halaman admin atau API admin
    if (!isAdminAuthenticated) {
      if (isAdminApiRoute) {
        const unauthRes = NextResponse.json(
          {
            success: false,
            code: "UNAUTHORIZED",
            message: "Akses tidak diizinkan. Silakan login sebagai administrator sekolah.",
          },
          { status: 401 }
        );
        applySecurityHeaders(unauthRes.headers);
        return unauthRes;
      }
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      const redirectLogin = NextResponse.redirect(loginUrl);
      applySecurityHeaders(redirectLogin.headers);
      return redirectLogin;
    }
  }

  // 3. Area & Route Portal Siswa
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
        const redirectStudent = NextResponse.redirect(new URL("/siswa/dashboard", request.url));
        applySecurityHeaders(redirectStudent.headers);
        return redirectStudent;
      }
      const nextRes = NextResponse.next();
      applySecurityHeaders(nextRes.headers);
      return nextRes;
    }

    // Jika mengakses area siswa yang dilindungi tapi belum login
    if (!isStudentAuthenticated && !isStaffAuthenticated) {
      if (isStudentApiRoute) {
        const unauthStudentRes = NextResponse.json(
          {
            success: false,
            code: "UNAUTHORIZED",
            message: "Akses ditolak. Sesi portal siswa tidak valid atau telah berakhir.",
          },
          { status: 401 }
        );
        applySecurityHeaders(unauthStudentRes.headers);
        return unauthStudentRes;
      }
      const studentLoginUrl = new URL("/siswa/login", request.url);
      studentLoginUrl.searchParams.set("from", pathname);
      const redirectStudentLogin = NextResponse.redirect(studentLoginUrl);
      applySecurityHeaders(redirectStudentLogin.headers);
      return redirectStudentLogin;
    }
  }

  // Response default dengan Security Headers OWASP terpasang
  const response = NextResponse.next();
  applySecurityHeaders(response.headers);
  return response;
}

export const config = {
  matcher: [
    /*
     * Cocokkan semua path request kecuali berkas statis, favicon, dan _next
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
