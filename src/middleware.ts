import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";

// Korumalı rotalar
const PROTECTED_ROUTES = ["/portal", "/admin"];
const AUTH_ROUTES = ["/login"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const sessionCookie = req.cookies.get("__session")?.value;

  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));

  // Oturum yoksa korumalı sayfalara erişimi engelle
  if (isProtected && !sessionCookie) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Oturum varsa login sayfasına gitmeyi engelle
  if (isAuthRoute && sessionCookie) {
    try {
      const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
      const role = decoded.role ?? "member";
      return NextResponse.redirect(
        new URL(role === "admin" ? "/admin" : "/portal", req.url)
      );
    } catch {
      // Cookie geçersiz, devam et
    }
  }

  // Admin sayfaları — sadece admin rolü
  if (pathname.startsWith("/admin") && sessionCookie) {
    try {
      const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
      if (decoded.role !== "admin") {
        return NextResponse.redirect(new URL("/portal", req.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/portal/:path*",
    "/admin/:path*",
    "/login",
  ],
};
