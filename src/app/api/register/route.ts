export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase/admin";

// POST — davet token ile kayıt tamamla
export async function POST(req: NextRequest) {
  try {
    const { token, email, password, displayName, company, phone } = await req.json();

    if (!token || !email || !password || !displayName) {
      return NextResponse.json({ error: "Tüm alanları doldurunuz." }, { status: 400 });
    }

    // Token doğrula
    const inviteDoc = await adminDb.collection("invites").doc(token).get();
    if (!inviteDoc.exists) {
      return NextResponse.json({ error: "Geçersiz veya süresi dolmuş davet." }, { status: 400 });
    }

    const invite = inviteDoc.data()!;
    if (invite.status !== "pending") {
      return NextResponse.json({ error: "Bu davet daha önce kullanılmış." }, { status: 400 });
    }
    if (new Date(invite.expiresAt) < new Date()) {
      return NextResponse.json({ error: "Davet süresi dolmuş." }, { status: 400 });
    }
    if (invite.email !== email) {
      return NextResponse.json({ error: "E-posta adresi davet ile eşleşmiyor." }, { status: 400 });
    }

    // Firebase Auth kullanıcısı oluştur
    const userRecord = await adminAuth.createUser({ email, password, displayName });

    // Firestore kullanıcı dökümanı
    const now = new Date().toISOString();
    await adminDb.collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      displayName,
      company: company ?? "",
      phone: phone ?? "",
      role: "member",
      status: "active",
      groupIds: invite.groupIds ?? [],
      invitedBy: invite.createdBy,
      createdAt: now,
      updatedAt: now,
    });

    // Daveti kullanıldı olarak işaretle
    await adminDb.collection("invites").doc(token).update({
      status: "accepted",
      acceptedAt: now,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error(error);
    const msg = error instanceof Error ? error.message : "Kayıt tamamlanamadı.";
    if (msg.includes("email-already-exists")) {
      return NextResponse.json({ error: "Bu e-posta adresi zaten kayıtlı." }, { status: 409 });
    }
    return NextResponse.json({ error: "Kayıt tamamlanamadı." }, { status: 500 });
  }
}

// GET — token bilgisini döndür (kayıt formu için)
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Token gerekli." }, { status: 400 });

  const doc = await adminDb.collection("invites").doc(token).get();
  if (!doc.exists) return NextResponse.json({ error: "Geçersiz davet." }, { status: 404 });

  const data = doc.data()!;
  if (data.status !== "pending" || new Date(data.expiresAt) < new Date()) {
    return NextResponse.json({ error: "Bu davet artık geçerli değil." }, { status: 400 });
  }

  return NextResponse.json({ email: data.email, valid: true });
}
