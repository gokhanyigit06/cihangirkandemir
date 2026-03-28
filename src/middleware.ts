import { NextRequest, NextResponse } from "next/server";

// Middleware Edge Runtime'da çalışır — firebase-admin Node.js SDK'sı burada kullanılamaz.
// __session: httpOnly güvenli cookie (route handler'larda Firebase Admin ile verify edilir)
// __role: middleware routing için hafif cookie
const PROTECTED = ["/portal", "/admin"];
const AUTH = ["/login"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = req.cookies.get("__session")?.value;
  const role = req.cookies.get("__role")?.value;

  // Cookie yoksa korumalı sayfalara erişim yok
  if (PROTECTED.some((p) => pathname.startsWith(p)) && !session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Cookie varken login'e gitmeye çalışıyorsa yönlendir
  if (AUTH.some((p) => pathname.startsWith(p)) && session) {
    return NextResponse.redirect(
      new URL(role === "admin" ? "/admin" : "/portal", req.url)
    );
  }

  // Admin sayfalarına member erişimi engelle
  if (pathname.startsWith("/admin") && session && role !== "admin") {
    return NextResponse.redirect(new URL("/portal", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/portal/:path*", "/admin/:path*", "/login"],
};
