import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "C_Studio Portal",
    template: "%s | C_Studio Portal",
  },
  description: "Cihangir Kandemir Studio — Özel Üye Platformu",
  robots: { index: false, follow: false }, // Kapalı platform — SEO engeli
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
