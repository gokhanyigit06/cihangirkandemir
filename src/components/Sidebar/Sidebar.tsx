"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FileText,
  CreditCard,
  Users,
  Megaphone,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";
import styles from "./Sidebar.module.css";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface SidebarProps {
  role: "admin" | "member";
}

const MEMBER_NAV: NavItem[] = [
  { label: "Ana Sayfa", href: "/portal", icon: LayoutDashboard },
  { label: "Ürünler & Paketler", href: "/portal/products", icon: Package },
  { label: "Siparişlerim", href: "/portal/orders", icon: ShoppingCart },
  { label: "Faturalarım", href: "/portal/invoices", icon: FileText },
  { label: "Aboneliklerim", href: "/portal/subscriptions", icon: CreditCard },
  { label: "Kampanyalar", href: "/portal/campaigns", icon: Megaphone },
  { label: "Ayarlar", href: "/portal/settings", icon: Settings },
];

const ADMIN_NAV: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Ürün Yönetimi", href: "/admin/products", icon: Package },
  { label: "Siparişler", href: "/admin/orders", icon: ShoppingCart },
  { label: "Faturalar", href: "/admin/invoices", icon: FileText },
  { label: "Abonelikler", href: "/admin/subscriptions", icon: CreditCard },
  { label: "Müşteriler", href: "/admin/users", icon: Users },
  { label: "Kampanyalar", href: "/admin/campaigns", icon: Megaphone },
];

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const navItems = role === "admin" ? ADMIN_NAV : MEMBER_NAV;
  const basePath = role === "admin" ? "/admin" : "/portal";

  async function handleLogout() {
    await fetch("/api/auth/session", { method: "DELETE" });
    router.push("/login");
  }

  function isActive(href: string) {
    if (href === basePath) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <aside className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.logo}>
        <div className={styles.logoMark}>CK</div>
        <div>
          <div className={styles.logoName}>C_Studio</div>
          <div className={styles.logoRole}>
            {role === "admin" ? "Yönetici Paneli" : "Üye Portalı"}
          </div>
        </div>
      </div>

      <div className={styles.divider} />

      {/* Navigation */}
      <nav className={styles.nav}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${active ? styles.navItemActive : ""}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
              {active && <ChevronRight size={14} className={styles.chevron} />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className={styles.bottom}>
        <div className={styles.divider} />
        <button
          id="sidebar-logout"
          onClick={handleLogout}
          className={styles.logoutBtn}
        >
          <LogOut size={18} />
          <span>Çıkış Yap</span>
        </button>
      </div>
    </aside>
  );
}
