export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

// GET — kampanyaları listele
export async function GET() {
  try {
    const now = new Date().toISOString();
    const snapshot = await adminDb
      .collection("campaigns")
      .orderBy("createdAt", "desc")
      .get();

    const campaigns = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Kampanyalar alınamadı." }, { status: 500 });
  }
}

// POST — yeni kampanya oluştur (admin)
export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("__session")?.value;
    if (!sessionCookie) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    const userDoc = await adminDb.collection("users").doc(decoded.uid).get();
    if (userDoc.data()?.role !== "admin") {
      return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
    }

    const body = await req.json();
    const now = new Date().toISOString();

    const campaignData = {
      title: body.title,
      description: body.description ?? "",
      bannerUrl: body.bannerUrl ?? "",
      targetGroups: body.targetGroups ?? [],
      startDate: body.startDate,
      endDate: body.endDate,
      isActive: body.isActive ?? true,
      link: body.link ?? "",
      createdAt: now,
    };

    const docRef = await adminDb.collection("campaigns").add(campaignData);
    return NextResponse.json({ id: docRef.id, ...campaignData }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Kampanya oluşturulamadı." }, { status: 500 });
  }
}

// PATCH — kampanya güncelle
export async function PATCH(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("__session")?.value;
    if (!sessionCookie) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    const userDoc = await adminDb.collection("users").doc(decoded.uid).get();
    if (userDoc.data()?.role !== "admin") {
      return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
    }

    const { id, ...updates } = await req.json();
    await adminDb.collection("campaigns").doc(id).update({
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Güncellenemedi." }, { status: 500 });
  }
}
