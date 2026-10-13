import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const AUTH_COOKIE_NAME = "sd_admin_session";
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key-change-in-production-min32chars";
const encodedKey = new TextEncoder().encode(JWT_SECRET);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Cek apakah route adalah area admin
  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginPage = pathname === "/admin/login";
  const isAdminApiRoute = pathname.startsWith("/api/admin");

  if (isAdminRoute || isAdminApiRoute) {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    let isAuthenticated = false;

    if (token) {
      try {
        await jwtVerify(token, encodedKey, { algorithms: ["HS256"] });
        isAuthenticated = true;
      } catch {
        isAuthenticated = false;
      }
    }

    // Jika mencoba akses /admin/login tapi sudah terautentikasi -> redirect ke dashboard
    if (isLoginPage) {
      if (isAuthenticated) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.next();
    }

    // Jika mencoba akses route admin lain atau API admin tapi belum login
    if (!isAuthenticated) {
      if (isAdminApiRoute) {
        return NextResponse.json(
          { success: false, message: "Akses tidak diizinkan. Silakan login." },
          { status: 401 }
        );
      }
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
