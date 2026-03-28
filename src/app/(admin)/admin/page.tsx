import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

export default function AdminDashboardPage() {
  return (
    <div>
      <div className="page-header">
        <h1>Yönetici Paneli</h1>
        <p>Platform genelindeki özet ve hızlı işlemler.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-label">Toplam Üye</div>
          <div className="stat-value">—</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🛒</div>
          <div className="stat-label">Toplam Sipariş</div>
          <div className="stat-value">—</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-label">Bu Ay Ciro</div>
          <div className="stat-value">—</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-label">Bekleyen Sözleşme</div>
          <div className="stat-value">—</div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: "1.1rem", marginBottom: 16 }}>Hızlı İşlemler</h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a href="/admin/users" className="btn btn-primary">Üye Ekle / Davet Et</a>
          <a href="/admin/products" className="btn btn-secondary">Ürün Ekle</a>
          <a href="/admin/campaigns" className="btn btn-secondary">Kampanya Oluştur</a>
          <a href="/admin/invoices" className="btn btn-secondary">Fatura Gönder</a>
        </div>
      </div>
    </div>
  );
}
