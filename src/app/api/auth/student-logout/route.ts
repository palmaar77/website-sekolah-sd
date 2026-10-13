import { NextResponse } from "next/server";
import { STUDENT_COOKIE_NAME } from "@/lib/auth/jwt";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Berhasil keluar dari portal siswa.",
  });

  response.cookies.set({
    name: STUDENT_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  return response;
}
