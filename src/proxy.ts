import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

// Korumalı rotalar
const PROTECTED_ROUTES = ["/portal", "/admin"];
const AUTH_ROUTES = ["/login"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const sessionCookie = req.cookies.get("__session")?.value;

  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));

  // --- Korumalı sayfa: cookie yoksa login'e at
  if (isProtected && !sessionCookie) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // --- Cookie varsa doğrula
  if (sessionCookie) {
    let decoded: { uid: string } | null = null;

    try {
      // revocationCheck=false ile dene (ilk deneme)
      decoded = await adminAuth.verifySessionCookie(sessionCookie, false);
    } catch {
      // Cookie geçersize
      if (isProtected) {
        const res = NextResponse.redirect(new URL("/login", req.url));
        res.cookies.set("__session", "", { maxAge: 0, path: "/" });
        return res;
      }
    }

    if (decoded) {
      // Login sayfasına erişmeye çalışıyorsa role'e göre yönlendir
      if (isAuthRoute) {
        try {
          const userDoc = await adminDb.collection("users").doc(decoded.uid).get();
          const role = userDoc.data()?.role ?? "member";
          return NextResponse.redirect(
            new URL(role === "admin" ? "/admin" : "/portal", req.url)
          );
        } catch {
          return NextResponse.redirect(new URL("/portal", req.url));
        }
      }

      // /admin sayfaları — sadece admin rolü
      if (pathname.startsWith("/admin")) {
        try {
          const userDoc = await adminDb.collection("users").doc(decoded.uid).get();
          const role = userDoc.data()?.role;
          if (role !== "admin") {
            return NextResponse.redirect(new URL("/portal", req.url));
          }
        } catch {
          return NextResponse.redirect(new URL("/login", req.url));
        }
      }
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
