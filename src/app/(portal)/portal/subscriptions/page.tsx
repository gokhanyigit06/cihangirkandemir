"use client";

import { useEffect, useState } from "react";
import { XCircle } from "lucide-react";

interface Subscription {
  id: string;
  userId: string;
  productName: string;
  amount: number;
  interval: string;
  status: string;
  startDate: string;
  nextBillingDate: string;
}

const INTERVAL_LABEL: Record<string, string> = {
  monthly: "Aylık",
  yearly: "Yıllık",
};

export default function PortalSubscriptionsPage() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchSubs() {
    setLoading(true);
    const res = await fetch("/api/subscriptions");
    const data = await res.json();
    setSubs(data.subscriptions ?? []);
    setLoading(false);
  }

  useEffect(() => { fetchSubs(); }, []);

  async function cancelSub(id: string) {
    if (!confirm("Aboneliği iptal etmek istediğinizden emin misiniz?")) return;
    await fetch("/api/subscriptions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscriptionId: id, status: "cancelled" }),
    });
    fetchSubs();
  }

  return (
    <div>
      <div className="page-header">
        <h1>Aboneliklerim</h1>
        <p>Aktif aboneliklerinizi ve sonraki fatura tarihlerini görüntüleyin.</p>
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 80, borderRadius: "var(--radius-lg)" }} />)}
        </div>
      ) : subs.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>
          Aktif aboneliğiniz bulunmamaktadır.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {subs.map((sub) => (
            <div key={sub.id} style={{ background: "var(--bg-surface)", border: `1px solid ${sub.status === "active" ? "var(--bg-border)" : "rgba(248,113,113,0.2)"}`, borderRadius: "var(--radius-lg)", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ fontWeight: 600, fontSize: "0.9375rem" }}>{sub.productName}</div>
                <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
                  {INTERVAL_LABEL[sub.interval] ?? sub.interval} · Başlangıç: {new Date(sub.startDate).toLocaleDateString("tr-TR")}
                </div>
                {sub.status === "active" && (
                  <div style={{ fontSize: "0.75rem", color: "var(--brand-primary)" }}>
                    Sonraki Fatura: {new Date(sub.nextBillingDate).toLocaleDateString("tr-TR")}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: "1.25rem", color: "var(--brand-primary)" }}>
                    {sub.amount.toLocaleString("tr-TR")} ₺
                  </div>
                  <span className={`badge ${sub.status === "active" ? "badge-green" : "badge-red"}`}>
                    {sub.status === "active" ? "Aktif" : "İptal Edildi"}
                  </span>
                </div>
                {sub.status === "active" && (
                  <button className="btn btn-danger btn-sm" onClick={() => cancelSub(sub.id)} title="İptal Et">
                    <XCircle size={14} /> İptal
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
