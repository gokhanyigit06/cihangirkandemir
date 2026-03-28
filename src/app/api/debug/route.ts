export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

export async function GET() {
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const hasBase64Key = !!process.env.FIREBASE_PRIVATE_KEY_BASE64;
  const hasPlainKey = !!(process.env.FIREBASE_PRIVATE_KEY || process.env.FIREBASE_ADMIN_PRIVATE_KEY);

  // Firebase Admin başlatmayı dene
  let adminStatus = "not_tested";
  let adminError = "";
  try {
    const { getAdminAuth } = await import("@/lib/firebase/admin");
    const auth = getAdminAuth();
    // Basit bir işlem dene
    await auth.listUsers?.(1) ?? "listUsers not available";
    adminStatus = "ok";
  } catch (e) {
    adminStatus = "error";
    adminError = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json({
    env: {
      projectId: projectId ?? "MISSING",
      clientEmail: clientEmail ?? "MISSING",
      hasBase64Key,
      hasPlainKey,
      nodeEnv: process.env.NODE_ENV,
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
    },
    adminSdk: {
      status: adminStatus,
      error: adminError || null,
    },
  });
}
