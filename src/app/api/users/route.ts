import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

// GET — tüm kullanıcıları listele (admin)
export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("__session")?.value;
    if (!sessionCookie) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    const userDoc = await adminDb.collection("users").doc(decoded.uid).get();
    if (userDoc.data()?.role !== "admin") {
      return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
    }

    const snapshot = await adminDb.collection("users").orderBy("createdAt", "desc").get();
    const users = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ users });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Kullanıcılar alınamadı." }, { status: 500 });
  }
}

// PATCH — kullanıcı durumu veya rolü güncelle (admin)
export async function PATCH(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("__session")?.value;
    if (!sessionCookie) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    const adminDoc = await adminDb.collection("users").doc(decoded.uid).get();
    if (adminDoc.data()?.role !== "admin") {
      return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
    }

    const { userId, status, role, groupIds } = await req.json();
    if (!userId) return NextResponse.json({ error: "userId gerekli." }, { status: 400 });

    const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    if (status) updates.status = status;
    if (role) updates.role = role;
    if (groupIds) updates.groupIds = groupIds;

    await adminDb.collection("users").doc(userId).update(updates);

    // Rol değiştiyse custom claim güncelle
    if (role) {
      await adminAuth.setCustomUserClaims(userId, { role });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Güncellenemedi." }, { status: 500 });
  }
}
