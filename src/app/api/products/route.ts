export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { Product } from "@/lib/types";

// GET — tüm ürünleri listele
export async function GET() {
  try {
    const snapshot = await adminDb
      .collection("products")
      .orderBy("createdAt", "desc")
      .get();

    const products = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Product[];

    return NextResponse.json({ products });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Ürünler alınamadı." }, { status: 500 });
  }
}

// POST — yeni ürün oluştur (sadece admin)
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

    const productData: Omit<Product, "id"> = {
      name: body.name,
      description: body.description,
      price: Number(body.price),
      priceUnit: body.priceUnit ?? "once",
      category: body.category ?? "Genel",
      imageUrl: body.imageUrl ?? null,
      isActive: body.isActive ?? true,
      visibleToGroups: body.visibleToGroups ?? [],
      isCustomizable: body.isCustomizable ?? false,
      createdAt: now,
    };

    const docRef = await adminDb.collection("products").add(productData);
    return NextResponse.json({ id: docRef.id, ...productData }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Ürün oluşturulamadı." }, { status: 500 });
  }
}
