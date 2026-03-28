"use client";

import { useEffect, useState } from "react";
import type { Order } from "@/lib/types";

const STATUS_LABEL: Record<string, { label: string; badge: string }> = {
  pending: { label: "Beklemede", badge: "badge-gold" },
  paid: { label: "Ödendi", badge: "badge-green" },
  cancelled: { label: "İptal", badge: "badge-red" },
  refunded: { label: "İade", badge: "badge-blue" },
};

export default function PortalOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((d) => { setOrders(d.orders ?? []); setLoading(false); });
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>Siparişlerim</h1>
        <p>Tüm siparişlerinizi ve durumlarını takip edin.</p>
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 64 }} />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>
          Henüz sipariş bulunmamaktadır.
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Sipariş ID</th>
                <th>Ürünler</th>
                <th>Toplam</th>
                <th>Durum</th>
                <th>Tarih</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const s = STATUS_LABEL[order.status] ?? STATUS_LABEL.pending;
                return (
                  <tr key={order.id}>
                    <td style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      #{order.id?.slice(0, 8)}
                    </td>
                    <td>
                      {order.items.map((i) => (
                        <div key={i.productId} style={{ fontSize: "0.8125rem" }}>
                          {i.productName} <span style={{ color: "var(--text-muted)" }}>×{i.quantity}</span>
                        </div>
                      ))}
                    </td>
                    <td style={{ fontWeight: 600, color: "var(--brand-primary)" }}>
                      {order.total.toLocaleString("tr-TR")} ₺
                    </td>
                    <td><span className={`badge ${s.badge}`}>{s.label}</span></td>
                    <td style={{ color: "var(--text-muted)", fontSize: "0.8125rem" }}>
                      {new Date(order.createdAt).toLocaleDateString("tr-TR")}
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
