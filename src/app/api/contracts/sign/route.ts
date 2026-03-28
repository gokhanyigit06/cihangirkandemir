import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

// GET — token ile sözleşmeyi getir (imzalama sayfası için, auth gerekmez)
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Token gerekli." }, { status: 400 });

  const snapshot = await adminDb
    .collection("contracts")
    .where("signatureToken", "==", token)
    .limit(1)
    .get();

  if (snapshot.empty) return NextResponse.json({ error: "Geçersiz sözleşme linki." }, { status: 404 });

  const doc = snapshot.docs[0];
  const data = doc.data();

  if (data.status === "signed") {
    return NextResponse.json({ error: "Bu sözleşme zaten imzalanmıştır.", alreadySigned: true }, { status: 409 });
  }
  if (new Date(data.expiresAt) < new Date()) {
    return NextResponse.json({ error: "Bu sözleşme linki süresi dolmuştur." }, { status: 410 });
  }

  return NextResponse.json({
    id: doc.id,
    title: data.title,
    content: data.content,
    sentAt: data.sentAt,
    expiresAt: data.expiresAt,
    status: data.status,
  });
}

// POST — sözleşmeyi imzala
export async function POST(req: NextRequest) {
  try {
    const { token, signerName, signerIp } = await req.json();
    if (!token) return NextResponse.json({ error: "Token gerekli." }, { status: 400 });

    const snapshot = await adminDb
      .collection("contracts")
      .where("signatureToken", "==", token)
      .limit(1)
      .get();

    if (snapshot.empty) return NextResponse.json({ error: "Geçersiz token." }, { status: 404 });

    const doc = snapshot.docs[0];
    const data = doc.data();

    if (data.status === "signed") {
      return NextResponse.json({ error: "Bu sözleşme zaten imzalanmıştır." }, { status: 409 });
    }
    if (new Date(data.expiresAt) < new Date()) {
      return NextResponse.json({ error: "Sözleşme süresi dolmuştur." }, { status: 410 });
    }

    const now = new Date().toISOString();
    await doc.ref.update({
      status: "signed",
      signedAt: now,
      signerName: signerName ?? "—",
      signedIp: signerIp ?? "unknown",
      signatureToken: null, // Kullanımdan kaldır
    });

    return NextResponse.json({ success: true, signedAt: now });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "İmzalama başarısız." }, { status: 500 });
  }
}
