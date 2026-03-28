export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

// GET — abonelikleri listele
export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("__session")?.value;
    if (!sessionCookie) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    const uid = decoded.uid;
    const userDoc = await adminDb.collection("users").doc(uid).get();
    const role = userDoc.data()?.role;

    let query;
    if (role === "admin") {
      query = adminDb.collection("subscriptions").orderBy("startDate", "desc");
    } else {
      query = adminDb.collection("subscriptions").where("userId", "==", uid);
    }

    const snapshot = await query.get();
    const subscriptions = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ subscriptions });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Abonelikler alınamadı." }, { status: 500 });
  }
}

// POST — abonelik oluştur (admin müşteriye atayabilir)
export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("__session")?.value;
    if (!sessionCookie) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    const adminDoc = await adminDb.collection("users").doc(decoded.uid).get();
    if (adminDoc.data()?.role !== "admin") {
      return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
    }

    const { userId, productId, productName, amount, interval } = await req.json();

    const now = new Date();
    const nextBilling = new Date(now);
    if (interval === "monthly") nextBilling.setMonth(nextBilling.getMonth() + 1);
    else nextBilling.setFullYear(nextBilling.getFullYear() + 1);

    const subData = {
      userId,
      productId,
      productName,
      amount,
      interval,
      status: "active",
      startDate: now.toISOString(),
      nextBillingDate: nextBilling.toISOString(),
    };

    const docRef = await adminDb.collection("subscriptions").add(subData);
    return NextResponse.json({ id: docRef.id, ...subData }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Abonelik oluşturulamadı." }, { status: 500 });
  }
}

// PATCH — abonelik iptal et veya güncelle
export async function PATCH(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("__session")?.value;
    if (!sessionCookie) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    const { subscriptionId, ...updates } = await req.json();

    // Üye sadece kendi aboneliğini iptal edebilir
    const subDoc = await adminDb.collection("subscriptions").doc(subscriptionId).get();
    if (!subDoc.exists) return NextResponse.json({ error: "Abonelik bulunamadı." }, { status: 404 });

    const userDoc = await adminDb.collection("users").doc(decoded.uid).get();
    const isAdmin = userDoc.data()?.role === "admin";
    const isOwner = subDoc.data()?.userId === decoded.uid;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
    }

    await adminDb.collection("subscriptions").doc(subscriptionId).update({
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Güncellenemedi." }, { status: 500 });
  }
}
