import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { randomBytes } from "crypto";

// POST — davet oluştur ve e-posta gönder
export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("__session")?.value;
    if (!sessionCookie) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    const userDoc = await adminDb.collection("users").doc(decoded.uid).get();
    if (userDoc.data()?.role !== "admin") {
      return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
    }

    const { email, groupIds = [] } = await req.json();
    if (!email) return NextResponse.json({ error: "E-posta gerekli." }, { status: 400 });

    // Zaten kayıtlı mı?
    try {
      await adminAuth.getUserByEmail(email);
      return NextResponse.json({ error: "Bu e-posta adresi zaten kayıtlı." }, { status: 409 });
    } catch {
      // Kayıtlı değil, devam et
    }

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 gün

    await adminDb.collection("invites").doc(token).set({
      token,
      email,
      groupIds,
      createdBy: decoded.uid,
      status: "pending",
      expiresAt,
      createdAt: new Date().toISOString(),
    });

    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/register?token=${token}`;

    // E-posta gönder
    await sendInviteEmail(email, inviteUrl);

    return NextResponse.json({ success: true, token, inviteUrl });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Davet gönderilemedi." }, { status: 500 });
  }
}

// GET — tüm davetleri listele (admin)
export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("__session")?.value;
    if (!sessionCookie) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    const userDoc = await adminDb.collection("users").doc(decoded.uid).get();
    if (userDoc.data()?.role !== "admin") {
      return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
    }

    const snapshot = await adminDb.collection("invites").orderBy("createdAt", "desc").get();
    const invites = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ invites });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Davetler alınamadı." }, { status: 500 });
  }
}

async function sendInviteEmail(to: string, inviteUrl: string) {
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
      subject: "C_Studio Platformuna Davetiyeniz",
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#111;color:#f5f5f5;border-radius:16px;overflow:hidden;">
          <div style="background:linear-gradient(135deg,#C8A96E,#A8893E);padding:32px;text-align:center;">
            <div style="font-size:28px;font-weight:800;color:#0A0A0A;">CK</div>
            <div style="color:#0A0A0A;margin-top:8px;font-size:14px;">Cihangir Kandemir Studio</div>
          </div>
          <div style="padding:32px;">
            <h2 style="color:#C8A96E;margin-bottom:16px;">Platforma Davet Edildiniz</h2>
            <p style="color:#A0A0A0;line-height:1.7;">
              Cihangir Kandemir Studio'nun özel üye platformuna davet aldınız.
              Aşağıdaki bağlantıya tıklayarak kaydınızı tamamlayabilirsiniz.
            </p>
            <div style="text-align:center;margin:32px 0;">
              <a href="${inviteUrl}" style="background:linear-gradient(135deg,#C8A96E,#A8893E);color:#0A0A0A;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:600;display:inline-block;">
                Kaydı Tamamla →
              </a>
            </div>
            <p style="color:#555;font-size:13px;text-align:center;">
              Bu davet 7 gün içinde geçerliliğini yitirecektir.
            </p>
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.warn("E-posta gönderilemedi (SMTP ayarları eksik olabilir):", err);
  }
}
