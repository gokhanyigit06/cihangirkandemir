"use client";

import { useEffect, useState } from "react";
import { FileText, Send, CheckCircle, Clock, XCircle } from "lucide-react";

interface Contract {
  id: string;
  userId: string;
  title: string;
  content: string;
  status: string;
  sentAt: string;
  signedAt?: string;
  expiresAt: string;
}

interface User {
  id: string;
  email: string;
  displayName: string;
}

const STATUS_CONFIG: Record<string, { label: string; badge: string; icon: React.ReactNode }> = {
  sent: { label: "Gönderildi", badge: "badge-gold", icon: <Send size={12} /> },
  viewed: { label: "Görüldü", badge: "badge-blue", icon: <Clock size={12} /> },
  signed: { label: "İmzalandı", badge: "badge-green", icon: <CheckCircle size={12} /> },
  expired: { label: "Süresi Doldu", badge: "badge-red", icon: <XCircle size={12} /> },
};

const CONTRACT_TEMPLATE = `HIZMET SÖZLEŞMESİ

Bu sözleşme, Cihangir Kandemir Studio ("Hizmet Sağlayıcı") ile aşağıda belirtilen müşteri ("Müşteri") arasında akdedilmiştir.

1. HİZMET KAPSAMI
Hizmet Sağlayıcı, işbu sözleşmede belirlenen hizmetleri eksiksiz ve zamanında sağlamayı taahhüt eder.

2. ÖDEME KOŞULLARI
Belirlenen hizmet bedeli, fatura tarihinden itibaren 7 iş günü içinde ödenecektir.

3. GİZLİLİK
Taraflar, bu sözleşme kapsamında edindikleri tüm bilgileri gizli tutmayı kabul eder.

4. SÖZLEŞMENİN FESHİ
Her iki taraf da 30 gün önceden yazılı bildirimde bulunmak kaydıyla sözleşmeyi feshedebilir.

5. UYGULANACAK HUKUK
Bu sözleşme Türk Hukuku'na tabidir.`;

export default function AdminContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ userId: "", title: "", content: CONTRACT_TEMPLATE });
  const [signUrl, setSignUrl] = useState("");

  async function fetchAll() {
    setLoading(true);
    const [contractsRes, usersRes] = await Promise.all([
      fetch("/api/contracts").then((r) => r.json()),
      fetch("/api/users").then((r) => r.json()),
    ]);
    setContracts(contractsRes.contracts ?? []);
    setUsers((usersRes.users ?? []).filter((u: User & { role: string }) => u.role === "member"));
    setLoading(false);
  }

  useEffect(() => { fetchAll(); }, []);

  async function handleCreate() {
    setCreating(true);
    const res = await fetch("/api/contracts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      setSignUrl(data.signUrl);
      fetchAll();
    }
    setCreating(false);
  }

  return (
    <div>
      <div className="page-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1>Sözleşme Yönetimi</h1>
          <p>Müşterilere sözleşme gönderin ve imzalanma durumunu takip edin.</p>
        </div>
        <button id="create-contract-btn" className="btn btn-primary" onClick={() => { setShowModal(true); setSignUrl(""); }}>
          <FileText size={16} /> Sözleşme Gönder
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon">📄</div>
          <div className="stat-label">Toplam Sözleşme</div>
          <div className="stat-value">{contracts.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✍️</div>
          <div className="stat-label">İmzalanan</div>
          <div className="stat-value">{contracts.filter((c) => c.status === "signed").length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-label">Bekleyen</div>
          <div className="stat-value">{contracts.filter((c) => c.status === "sent").length}</div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 64 }} />)}
        </div>
      ) : contracts.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 24px", background: "var(--bg-surface)", border: "1px solid var(--bg-border)", borderRadius: "var(--radius-lg)", color: "var(--text-muted)", textAlign: "center" }}>
          <FileText size={48} style={{ marginBottom: 12 }} />
          <p>Henüz sözleşme gönderilmemiş.</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Başlık</th>
                <th>Müşteri</th>
                <th>Gönderilme</th>
                <th>Son Tarih</th>
                <th>Durum</th>
                <th>İmzalanma</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((c) => {
                const user = users.find((u) => u.id === c.userId);
                const s = STATUS_CONFIG[c.status] ?? STATUS_CONFIG.sent;
                const expired = c.status !== "signed" && new Date(c.expiresAt) < new Date();
                return (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 500 }}>{c.title}</td>
                    <td style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
                      {user?.displayName ?? c.userId.slice(0, 8)}
                    </td>
                    <td style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                      {new Date(c.sentAt).toLocaleDateString("tr-TR")}
                    </td>
                    <td style={{ fontSize: "0.8125rem", color: expired ? "var(--error)" : "var(--text-muted)" }}>
                      {new Date(c.expiresAt).toLocaleDateString("tr-TR")}
                    </td>
                    <td>
                      <span className={`badge ${expired && c.status !== "signed" ? "badge-red" : s.badge}`} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        {s.icon}
                        {expired && c.status !== "signed" ? "Süresi Doldu" : s.label}
                      </span>
                    </td>
                    <td style={{ fontSize: "0.8125rem", color: "var(--success)" }}>
                      {c.signedAt ? new Date(c.signedAt).toLocaleString("tr-TR") : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
          onClick={() => setShowModal(false)}>
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--bg-border)", borderRadius: "var(--radius-xl)", padding: 36, width: "100%", maxWidth: 640, maxHeight: "90vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: 20 }}>Sözleşme Gönder</h2>

            {signUrl ? (
              <div>
                <div style={{ background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: "var(--radius-md)", padding: "16px 20px", marginBottom: 20 }}>
                  <div style={{ color: "var(--success)", fontWeight: 600, marginBottom: 8 }}>✓ Sözleşme gönderildi!</div>
                  <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginBottom: 6 }}>SMTP ayarlanmadıysa bu linki müşteriyle paylaş:</div>
                  <div style={{ fontSize: "0.8125rem", color: "var(--brand-primary)", wordBreak: "break-all", background: "var(--bg-elevated)", padding: "10px 14px", borderRadius: "var(--radius-md)" }}>
                    {signUrl}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <button className="btn btn-secondary" onClick={() => { setShowModal(false); setForm({ userId: "", title: "", content: CONTRACT_TEMPLATE }); }}>Kapat</button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div className="input-group">
                    <label className="input-label">Müşteri *</label>
                    <select className="input" value={form.userId} onChange={(e) => setForm((f) => ({ ...f, userId: e.target.value }))}>
                      <option value="">— Seçiniz —</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>{u.displayName} ({u.email})</option>
                      ))}
                    </select>
                  </div>
                  <div className="input-group">
                    <label className="input-label">Sözleşme Başlığı *</label>
                    <input className="input" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Hizmet Sözleşmesi 2025" />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Sözleşme İçeriği *</label>
                    <textarea className="input" rows={12} value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} style={{ resize: "vertical", fontFamily: "monospace", fontSize: "0.8125rem" }} />
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "flex-end" }}>
                  <button className="btn btn-secondary" onClick={() => setShowModal(false)}>İptal</button>
                  <button id="send-contract-btn" className="btn btn-primary" onClick={handleCreate} disabled={creating || !form.userId || !form.title || !form.content}>
                    {creating ? "Gönderiliyor…" : <><Send size={14} /> Gönder</>}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
