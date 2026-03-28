import type { Metadata } from "next";

export const metadata: Metadata = { title: "Ana Sayfa" };

export default function PortalDashboardPage() {
  return (
    <div>
      <div className="page-header">
        <h1>Hoş Geldiniz 👋</h1>
        <p>Cihangir Kandemir Studio özel üye portalına hoş geldiniz.</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-label">Aktif Abonelik</div>
          <div className="stat-value">—</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🛒</div>
          <div className="stat-label">Toplam Sipariş</div>
          <div className="stat-value">—</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📄</div>
          <div className="stat-label">Bekleyen Fatura</div>
          <div className="stat-value">—</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-label">Bekleyen Sözleşme</div>
          <div className="stat-value">—</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: "1.1rem", marginBottom: 16 }}>Hızlı Erişim</h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a href="/portal/products" className="btn btn-primary">Ürünlere Göz At</a>
          <a href="/portal/orders" className="btn btn-secondary">Siparişlerim</a>
          <a href="/portal/invoices" className="btn btn-secondary">Faturalarım</a>
        </div>
      </div>
    </div>
  );
}
