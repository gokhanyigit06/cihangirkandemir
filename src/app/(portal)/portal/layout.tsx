import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import Sidebar from "@/components/Sidebar/Sidebar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Üye Portalı", template: "%s | C_Studio Portalı" },
};

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("__session")?.value;

  if (!sessionCookie) redirect("/login");

  let uid: string;
  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    uid = decoded.uid;
  } catch {
    redirect("/login");
  }

  const userDoc = await adminDb.collection("users").doc(uid!).get();
  if (!userDoc.exists || userDoc.data()?.status !== "active") {
    redirect("/login");
  }

  return (
    <div className="dashboard-layout">
      <Sidebar role="member" />
      <main className="dashboard-content animate-fadeIn">{children}</main>
    </div>
  );
}
