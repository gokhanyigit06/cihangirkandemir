export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
      return NextResponse.json({ error: "Token gerekli." }, { status: 400 });
    }

    // Firebase Admin ile token doğrula
    const decoded = await adminAuth.verifyIdToken(idToken);
    const uid = decoded.uid;

    // Firestore'dan kullanıcı bilgisini çek
    const userDoc = await adminDb.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı. Platforma erişim için davet gereklidir." },
        { status: 403 }
      );
    }

    const userData = userDoc.data()!;

    if (userData.status !== "active") {
      return NextResponse.json(
        { error: "Hesabınız henüz onaylanmamış. Lütfen destek ekibiyle iletişime geçin." },
        { status: 403 }
      );
    }

    // Session cookie oluştur (14 gün)
    const expiresIn = 60 * 60 * 24 * 14 * 1000;
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    const response = NextResponse.json({
      success: true,
      role: userData.role,
    });

    response.cookies.set("__session", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: expiresIn / 1000,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Session oluşturma hatası:", error);
    return NextResponse.json(
      { error: "Oturum açılamadı." },
      { status: 401 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set("__session", "", { maxAge: 0, path: "/" });
  return response;
}
