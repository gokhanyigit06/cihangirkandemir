import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

// GET — kendi profilini getir
export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("__session")?.value;
    if (!sessionCookie) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    const userDoc = await adminDb.collection("users").doc(decoded.uid).get();

    if (!userDoc.exists) return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });

    const data = userDoc.data()!;
    return NextResponse.json({ user: data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Profil alınamadı." }, { status: 500 });
  }
}

// PATCH — kendi profilini güncelle
export async function PATCH(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("__session")?.value;
    if (!sessionCookie) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    const { displayName, company, phone, taxId, taxOffice, address } = await req.json();

    // Sadece izin verilen alanları güncelle (email/role dokunma)
    const updates: Record<string, string> = { updatedAt: new Date().toISOString() };
    if (displayName !== undefined) updates.displayName = displayName;
    if (company !== undefined) updates.company = company;
    if (phone !== undefined) updates.phone = phone;
    if (taxId !== undefined) updates.taxId = taxId;
    if (taxOffice !== undefined) updates.taxOffice = taxOffice;
    if (address !== undefined) updates.address = address;

    await adminDb.collection("users").doc(decoded.uid).update(updates);

    // Firebase Auth displayName de güncelle
    if (displayName) {
      await adminAuth.updateUser(decoded.uid, { displayName });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Güncellenemedi." }, { status: 500 });
  }
}
