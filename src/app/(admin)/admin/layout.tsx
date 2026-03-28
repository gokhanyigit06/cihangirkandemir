import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import Sidebar from "@/components/Sidebar/Sidebar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Yönetici Paneli", template: "%s | C_Studio Admin" },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("__session")?.value;

  if (!sessionCookie) redirect("/login");

  let role: string;
  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    const userDoc = await adminDb.collection("users").doc(decoded.uid).get();
    role = userDoc.data()?.role ?? "member";
  } catch {
    redirect("/login");
  }

  if (role! !== "admin") redirect("/portal");

  return (
    <div className="dashboard-layout">
      <Sidebar role="admin" />
      <main className="dashboard-content animate-fadeIn">{children}</main>
    </div>
  );
}
