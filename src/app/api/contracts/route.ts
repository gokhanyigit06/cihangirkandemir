export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { randomBytes } from "crypto";

// POST — sözleşme oluştur ve gönder (admin)
export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("__session")?.value;
    if (!sessionCookie) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    const adminDoc = await adminDb.collection("users").doc(decoded.uid).get();
    if (adminDoc.data()?.role !== "admin") {
      return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
    }

    const { userId, title, content, subscriptionId } = await req.json();
    if (!userId || !title || !content) {
      return NextResponse.json({ error: "userId, title ve content gerekli." }, { status: 400 });
    }

    const userDoc = await adminDb.collection("users").doc(userId).get();
    if (!userDoc.exists) return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });
    const userData = userDoc.data()!;

    const signatureToken = randomBytes(32).toString("hex");
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 gün

    const contractData = {
      userId,
      title,
      content,
      status: "sent",
      sentAt: now,
      expiresAt,
      signatureToken,
      subscriptionId: subscriptionId ?? null,
    };

    const docRef = await adminDb.collection("contracts").add(contractData);
    const signUrl = `${process.env.NEXT_PUBLIC_APP_URL}/contracts/sign?token=${signatureToken}`;

    // E-posta gönder
    await sendContractEmail(userData.email, userData.displayName, title, signUrl, docRef.id);

    return NextResponse.json({ id: docRef.id, signUrl, ...contractData }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Sözleşme oluşturulamadı." }, { status: 500 });
  }
}

// GET — sözleşmeleri listele
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
      query = adminDb.collection("contracts").orderBy("sentAt", "desc");
    } else {
      query = adminDb.collection("contracts").where("userId", "==", uid);
    }

    const snapshot = await query.get();
    const contracts = snapshot.docs.map((d) => {
      const data = d.data();
      // Token'ı üyeye gösterme (güvenlik)
      if (role !== "admin") delete data.signatureToken;
      return { id: d.id, ...data };
    });

    return NextResponse.json({ contracts });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Sözleşmeler alınamadı." }, { status: 500 });
  }
}

async function sendContractEmail(
  to: string,
  name: string,
  title: string,
  signUrl: string,
  contractId: string
) {
  try {
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.default.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    await transporter.sendMail({
      from: `"Cihangir Kandemir Studio" <${process.env.SMTP_USER}>`,
      to,
      subject: `Sözleşme İmzası Bekleniyor: ${title}`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#111;color:#f5f5f5;border-radius:16px;overflow:hidden;">
          <div style="background:linear-gradient(135deg,#C8A96E,#A8893E);padding:32px;text-align:center;">
            <div style="font-size:28px;font-weight:800;color:#0A0A0A;">CK</div>
            <div style="color:#0A0A0A;margin-top:8px;font-size:14px;">Cihangir Kandemir Studio</div>
          </div>
          <div style="padding:32px;">
            <h2 style="color:#C8A96E;margin-bottom:8px;">Sözleşme İmzanızı Bekliyor</h2>
            <p style="color:#A0A0A0;margin-bottom:6px;">Merhaba ${name},</p>
            <p style="color:#A0A0A0;line-height:1.7;margin-bottom:24px;">
              "<strong style="color:#f5f5f5">${title}</strong>" başlıklı sözleşme imzanızı bekliyor.
              Aşağıdaki butona tıklayarak sözleşmeyi inceleyip onaylayabilirsiniz.
            </p>
            <div style="text-align:center;margin-bottom:32px;">
              <a href="${signUrl}" style="background:linear-gradient(135deg,#C8A96E,#A8893E);color:#0A0A0A;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:600;display:inline-block;">
                Sözleşmeyi İncele ve İmzala →
              </a>
            </div>
            <p style="color:#555;font-size:13px;">
              Bu link 30 gün boyunca geçerlidir. Ref: #${contractId.slice(0, 8)}
            </p>
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.warn("Sözleşme e-postası gönderilemedi:", err);
  }
}
