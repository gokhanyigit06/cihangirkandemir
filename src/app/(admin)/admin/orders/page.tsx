"use client";

import { useEffect, useState } from "react";

interface Order {
  id: string;
  userId: string;
  userEmail: string;
  items: { productName: string; quantity: number; unitPrice: number }[];
  total: number;
  status: string;
  invoiceId?: string;
  createdAt: string;
}

const STATUS: Record<string, { label: string; badge: string }> = {
  pending: { label: "Beklemede", badge: "badge-gold" },
  paid: { label: "Ödendi", badge: "badge-green" },
  cancelled: { label: "İptal", badge: "badge-red" },
  refunded: { label: "İade", badge: "badge-blue" },
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchOrders() {
    setLoading(true);
    const res = await fetch("/api/orders");
    const data = await res.json();
    setOrders(data.orders ?? []);
    setLoading(false);
  }

  useEffect(() => { fetchOrders(); }, []);

  async function updateStatus(orderId: string, status: string) {
    await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchOrders();
  }

  const totalRevenue = orders.filter((o) => o.status === "paid").reduce((s, o) => s + o.total, 0);

  return (
    <div>
      <div className="page-header">
        <h1>Sipariş Yönetimi</h1>
        <p>Tüm siparişleri görüntüleyin ve durumlarını güncelleyin.</p>
      </div>

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-label">Toplam Sipariş</div>
          <div className="stat-value">{orders.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Bekleyen</div>
          <div className="stat-value">{orders.filter((o) => o.status === "pending").length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Tahsilat</div>
          <div className="stat-value">{totalRevenue.toLocaleString("tr-TR")} ₺</div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: 64 }} />)}
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Sipariş</th>
                <th>Müşteri</th>
                <th>Ürünler</th>
                <th>Toplam</th>
                <th>Tarih</th>
                <th>Durum</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const s = STATUS[order.status] ?? STATUS.pending;
                return (
                  <tr key={order.id}>
                    <td style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      #{order.id?.slice(0, 8)}
                    </td>
                    <td style={{ fontSize: "0.8125rem" }}>{order.userEmail}</td>
                    <td>
                      {order.items.map((i, idx) => (
                        <div key={idx} style={{ fontSize: "0.8rem" }}>{i.productName} ×{i.quantity}</div>
                      ))}
                    </td>
                    <td style={{ fontWeight: 600, color: "var(--brand-primary)" }}>
                      {order.total.toLocaleString("tr-TR")} ₺
                    </td>
                    <td style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                      {new Date(order.createdAt).toLocaleDateString("tr-TR")}
                    </td>
                    <td><span className={`badge ${s.badge}`}>{s.label}</span></td>
                    <td>
                      {order.status === "pending" && (
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => updateStatus(order.id, "paid")}>
                            Ödendi
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => updateStatus(order.id, "cancelled")}>
                            İptal
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
