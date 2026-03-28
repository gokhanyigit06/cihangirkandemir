import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

// GET — kullanıcının faturalarını listele
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
      query = adminDb.collection("invoices").orderBy("createdAt", "desc");
    } else {
      query = adminDb
        .collection("invoices")
        .where("userId", "==", uid)
        .orderBy("createdAt", "desc");
    }

    const snapshot = await query.get();
    const invoices = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({ invoices });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Faturalar alınamadı." }, { status: 500 });
  }
}
