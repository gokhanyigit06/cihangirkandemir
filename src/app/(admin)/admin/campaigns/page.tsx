"use client";

import { useEffect, useState } from "react";
import { Plus, Megaphone } from "lucide-react";

interface Campaign {
  id: string;
  title: string;
  description: string;
  bannerUrl: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  link?: string;
}

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    bannerUrl: "",
    link: "",
    startDate: "",
    endDate: "",
    isActive: true,
  });

  async function fetchCampaigns() {
    setLoading(true);
    const res = await fetch("/api/campaigns");
    const data = await res.json();
    setCampaigns(data.campaigns ?? []);
    setLoading(false);
  }

  useEffect(() => { fetchCampaigns(); }, []);

  async function handleSave() {
    setSaving(true);
    await fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setShowModal(false);
    setForm({ title: "", description: "", bannerUrl: "", link: "", startDate: "", endDate: "", isActive: true });
    fetchCampaigns();
  }

  async function toggleActive(c: Campaign) {
    await fetch("/api/campaigns", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: c.id, isActive: !c.isActive }),
    });
    fetchCampaigns();
  }

  return (
    <div>
      <div className="page-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1>Kampanya Yönetimi</h1>
          <p>Kampanyalar oluşturun, düzenleyin ve yayınlayın.</p>
        </div>
        <button id="add-campaign-btn" className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Yeni Kampanya
        </button>
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 80 }} />)}
        </div>
      ) : campaigns.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 24px", background: "var(--bg-surface)", border: "1px solid var(--bg-border)", borderRadius: "var(--radius-lg)", color: "var(--text-muted)", textAlign: "center" }}>
          <Megaphone size={48} style={{ marginBottom: 12 }} />
          <p>Henüz kampanya oluşturulmamış.</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Başlık</th>
                <th>Başlangıç</th>
                <th>Bitiş</th>
                <th>Durum</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => {
                const now = new Date();
                const live = c.isActive && new Date(c.startDate) <= now && new Date(c.endDate) >= now;
                return (
                  <tr key={c.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{c.title}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{c.description?.slice(0, 60)}</div>
                    </td>
                    <td style={{ fontSize: "0.8125rem" }}>{new Date(c.startDate).toLocaleDateString("tr-TR")}</td>
                    <td style={{ fontSize: "0.8125rem" }}>{new Date(c.endDate).toLocaleDateString("tr-TR")}</td>
                    <td>
                      <span className={`badge ${live ? "badge-green" : c.isActive ? "badge-gold" : "badge-gray"}`}>
                        {live ? "Yayında" : c.isActive ? "Planlandı" : "Pasif"}
                      </span>
                    </td>
                    <td>
                      <button className={`btn btn-sm ${c.isActive ? "btn-danger" : "btn-secondary"}`} onClick={() => toggleActive(c)}>
                        {c.isActive ? "Pasife Al" : "Aktife Al"}
                      </button>
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
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--bg-border)", borderRadius: "var(--radius-xl)", padding: 36, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: 20 }}>Yeni Kampanya</h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="input-group">
                <label className="input-label">Başlık *</label>
                <input className="input" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Yaz Kampanyası 2025" />
              </div>
              <div className="input-group">
                <label className="input-label">Açıklama</label>
                <textarea className="input" rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} style={{ resize: "vertical" }} placeholder="Kampanya detayları…" />
              </div>
              <div className="input-group">
                <label className="input-label">Banner URL (görsel linki)</label>
                <input className="input" value={form.bannerUrl} onChange={(e) => setForm((f) => ({ ...f, bannerUrl: e.target.value }))} placeholder="https://…" />
              </div>
              <div className="input-group">
                <label className="input-label">Yönlendirme Linki</label>
                <input className="input" value={form.link} onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))} placeholder="https://… (isteğe bağlı)" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="input-group">
                  <label className="input-label">Başlangıç Tarihi *</label>
                  <input className="input" type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
                </div>
                <div className="input-group">
                  <label className="input-label">Bitiş Tarihi *</label>
                  <input className="input" type="date" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} />
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "flex-end" }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>İptal</button>
              <button id="save-campaign-btn" className="btn btn-primary" onClick={handleSave} disabled={saving || !form.title || !form.startDate || !form.endDate}>
                {saving ? "Kaydediliyor…" : "Yayınla"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
