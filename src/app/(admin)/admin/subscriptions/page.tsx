"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

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

interface User { id: string; displayName: string; email: string; }

const INTERVAL_LABEL: Record<string, string> = { monthly: "Aylık", yearly: "Yıllık" };

export default function AdminSubscriptionsPage() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ userId: "", productId: "", productName: "", amount: "", interval: "monthly" });

  async function fetchAll() {
    setLoading(true);
    const [subsRes, usersRes] = await Promise.all([
      fetch("/api/subscriptions").then((r) => r.json()),
      fetch("/api/users").then((r) => r.json()),
    ]);
    setSubs(subsRes.subscriptions ?? []);
    setUsers((usersRes.users ?? []).filter((u: User & { role: string }) => u.role === "member"));
    setLoading(false);
  }

  useEffect(() => { fetchAll(); }, []);

  async function handleCreate() {
    setSaving(true);
    await fetch("/api/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, amount: Number(form.amount) }),
    });
    setSaving(false);
    setShowModal(false);
    setForm({ userId: "", productId: "", productName: "", amount: "", interval: "monthly" });
    fetchAll();
  }

  async function cancelSub(id: string) {
    if (!confirm("Bu aboneliği iptal etmek istediğinizden emin misiniz?")) return;
    await fetch("/api/subscriptions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscriptionId: id, status: "cancelled" }),
    });
    fetchAll();
  }

  const monthlyRevenue = subs
    .filter((s) => s.status === "active" && s.interval === "monthly")
    .reduce((sum, s) => sum + s.amount, 0);

  return (
    <div>
      <div className="page-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1>Abonelik Yönetimi</h1>
          <p>Müşteri aboneliklerini yönetin ve yeni abonelik oluşturun.</p>
        </div>
        <button id="create-sub-btn" className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Abonelik Oluştur
        </button>
      </div>

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-label">Aktif Abonelik</div>
          <div className="stat-value">{subs.filter((s) => s.status === "active").length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Aylık Gelir</div>
          <div className="stat-value">{monthlyRevenue.toLocaleString("tr-TR")} ₺</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">İptal Edilen</div>
          <div className="stat-value">{subs.filter((s) => s.status === "cancelled").length}</div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 64 }} />)}
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Hizmet</th>
                <th>Müşteri</th>
                <th>Tutar</th>
                <th>Periyot</th>
                <th>Sonraki Fatura</th>
                <th>Durum</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {subs.map((sub) => {
                const user = users.find((u) => u.id === sub.userId);
                return (
                  <tr key={sub.id}>
                    <td style={{ fontWeight: 500 }}>{sub.productName}</td>
                    <td style={{ fontSize: "0.8125rem" }}>
                      <div>{user?.displayName ?? "—"}</div>
                      <div style={{ color: "var(--text-muted)" }}>{user?.email ?? sub.userId.slice(0, 8)}</div>
                    </td>
                    <td style={{ fontWeight: 600, color: "var(--brand-primary)" }}>
                      {sub.amount.toLocaleString("tr-TR")} ₺
                    </td>
                    <td>{INTERVAL_LABEL[sub.interval] ?? sub.interval}</td>
                    <td style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                      {sub.status === "active" ? new Date(sub.nextBillingDate).toLocaleDateString("tr-TR") : "—"}
                    </td>
                    <td>
                      <span className={`badge ${sub.status === "active" ? "badge-green" : "badge-red"}`}>
                        {sub.status === "active" ? "Aktif" : "İptal"}
                      </span>
                    </td>
                    <td>
                      {sub.status === "active" && (
                        <button className="btn btn-danger btn-sm" onClick={() => cancelSub(sub.id)}>
                          İptal Et
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
          onClick={() => setShowModal(false)}>
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--bg-border)", borderRadius: "var(--radius-xl)", padding: 36, width: "100%", maxWidth: 480 }}
            onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: 20 }}>Yeni Abonelik</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="input-group">
                <label className="input-label">Müşteri *</label>
                <select className="input" value={form.userId} onChange={(e) => setForm((f) => ({ ...f, userId: e.target.value }))}>
                  <option value="">— Seçiniz —</option>
                  {users.map((u) => <option key={u.id} value={u.id}>{u.displayName} ({u.email})</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Hizmet Adı *</label>
                <input className="input" value={form.productName} onChange={(e) => setForm((f) => ({ ...f, productName: e.target.value }))} placeholder="Sosyal Medya Yönetimi" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="input-group">
                  <label className="input-label">Tutar (₺) *</label>
                  <input className="input" type="number" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} placeholder="3000" />
                </div>
                <div className="input-group">
                  <label className="input-label">Periyot</label>
                  <select className="input" value={form.interval} onChange={(e) => setForm((f) => ({ ...f, interval: e.target.value }))}>
                    <option value="monthly">Aylık</option>
                    <option value="yearly">Yıllık</option>
                  </select>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "flex-end" }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>İptal</button>
              <button id="save-sub-btn" className="btn btn-primary" onClick={handleCreate} disabled={saving || !form.userId || !form.productName || !form.amount}>
                {saving ? "Oluşturuluyor…" : "Oluştur"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
