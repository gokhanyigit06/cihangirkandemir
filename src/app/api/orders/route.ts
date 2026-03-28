import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { Order, OrderItem } from "@/lib/types";

// POST — sipariş oluştur + fatura tetikle
export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("__session")?.value;
    if (!sessionCookie) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    const uid = decoded.uid;

    const userDoc = await adminDb.collection("users").doc(uid).get();
    if (!userDoc.exists) return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });
    const userData = userDoc.data()!;

    const body = await req.json();
    const items: OrderItem[] = body.items;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Sepet boş." }, { status: 400 });
    }

    const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
    const total = subtotal; // İndirim mantığı ilerleyen fazda

    const now = new Date().toISOString();
    const orderData: Omit<Order, "id"> = {
      userId: uid,
      userEmail: userData.email,
      items,
      subtotal,
      discountAmount: 0,
      total,
      status: "pending",
      paymentMethod: "iyzico",
      createdAt: now,
      updatedAt: now,
    };

    const orderRef = await adminDb.collection("orders").add(orderData);
    const orderId = orderRef.id;

    // Fatura numarası oluştur
    const invoiceNumber = await generateInvoiceNumber();

    // Fatura oluştur
    const invoiceData = {
      orderId,
      userId: uid,
      userEmail: userData.email,
      invoiceNumber,
      billingInfo: {
        name: userData.displayName,
        company: userData.company ?? "",
        taxId: userData.taxId ?? "",
        taxOffice: userData.taxOffice ?? "",
        address: userData.address ?? "",
        email: userData.email,
      },
      items: items.map((i) => ({
        description: i.productName,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        total: i.unitPrice * i.quantity,
      })),
      subtotal,
      taxAmount: Math.round(subtotal * 0.2), // %20 KDV
      total: Math.round(subtotal * 1.2),
      createdAt: now,
    };

    const invoiceRef = await adminDb.collection("invoices").add(invoiceData);

    // Siparişe fatura ID'sini bağla
    await orderRef.update({ invoiceId: invoiceRef.id });

    return NextResponse.json(
      { orderId, invoiceId: invoiceRef.id, invoiceNumber },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Sipariş oluşturulamadı." }, { status: 500 });
  }
}

// GET — kullanıcının siparişlerini listele
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
      // Admin tüm siparişleri görür
      query = adminDb.collection("orders").orderBy("createdAt", "desc");
    } else {
      // Üye sadece kendi siparişlerini görür
      query = adminDb
        .collection("orders")
        .where("userId", "==", uid)
        .orderBy("createdAt", "desc");
    }

    const snapshot = await query.get();
    const orders = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({ orders });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Siparişler alınamadı." }, { status: 500 });
  }
}

async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const snapshot = await adminDb
    .collection("invoices")
    .where("invoiceNumber", ">=", `INV-${year}-`)
    .orderBy("invoiceNumber", "desc")
    .limit(1)
    .get();

  if (snapshot.empty) return `INV-${year}-001`;

  const last = snapshot.docs[0].data().invoiceNumber as string;
  const num = parseInt(last.split("-")[2]) + 1;
  return `INV-${year}-${String(num).padStart(3, "0")}`;
}
