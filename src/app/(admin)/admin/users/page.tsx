"use client";

import { useEffect, useState } from "react";
import { UserPlus, Mail, Users, CheckCircle, XCircle, Clock } from "lucide-react";

interface User {
  id: string;
  email: string;
  displayName: string;
  company?: string;
  role: string;
  status: string;
  createdAt: string;
  groupIds: string[];
}

interface Invite {
  id: string;
  email: string;
  status: string;
  createdAt: string;
  expiresAt: string;
}

const STATUS_ICONS: Record<string, React.ReactNode> = {
  active: <CheckCircle size={14} />,
  pending: <Clock size={14} />,
  suspended: <XCircle size={14} />,
};

const STATUS_BADGE: Record<string, string> = {
  active: "badge-green",
  pending: "badge-gold",
  suspended: "badge-red",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"users" | "invites">("users");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteResult, setInviteResult] = useState<{ url?: string; error?: string } | null>(null);

  async function fetchAll() {
    setLoading(true);
    const [usersRes, invitesRes] = await Promise.all([
      fetch("/api/users").then((r) => r.json()),
      fetch("/api/invites").then((r) => r.json()),
    ]);
    setUsers(usersRes.users ?? []);
    setInvites(invitesRes.invites ?? []);
    setLoading(false);
  }

  useEffect(() => { fetchAll(); }, []);

  async function handleInvite() {
    setInviting(true);
    setInviteResult(null);
    const res = await fetch("/api/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: inviteEmail }),
    });
    const data = await res.json();
    if (res.ok) {
      setInviteResult({ url: data.inviteUrl });
      setInviteEmail("");
      fetchAll();
    } else {
      setInviteResult({ error: data.error });
    }
    setInviting(false);
  }

  async function updateUser(userId: string, updates: Record<string, string>) {
    await fetch("/api/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ...updates }),
    });
    fetchAll();
  }

  return (
    <div>
      <div className="page-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1>Müşteri Yönetimi</h1>
          <p>Üyeleri yönetin, davet gönderin ve rollerini düzenleyin.</p>
        </div>
        <button id="invite-user-btn" className="btn btn-primary" onClick={() => { setShowInviteModal(true); setInviteResult(null); }}>
          <UserPlus size={16} /> Üye Davet Et
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-label">Toplam Üye</div>
          <div className="stat-value">{users.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Aktif Üye</div>
          <div className="stat-value">{users.filter((u) => u.status === "active").length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Bekleyen Davet</div>
          <div className="stat-value">{invites.filter((i) => i.status === "pending").length}</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "var(--bg-elevated)", padding: 4, borderRadius: "var(--radius-md)", width: "fit-content" }}>
        <button
          className={`btn btn-sm ${tab === "users" ? "btn-primary" : "btn-ghost"}`}
          onClick={() => setTab("users")}
        >
          <Users size={14} /> Üyeler ({users.length})
        </button>
        <button
          className={`btn btn-sm ${tab === "invites" ? "btn-primary" : "btn-ghost"}`}
          onClick={() => setTab("invites")}
        >
          <Mail size={14} /> Davetler ({invites.length})
        </button>
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: 64 }} />)}
        </div>
      ) : tab === "users" ? (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Ad Soyad</th>
                <th>E-posta</th>
                <th>Şirket</th>
                <th>Rol</th>
                <th>Durum</th>
                <th>Kayıt Tarihi</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td style={{ fontWeight: 500 }}>{user.displayName}</td>
                  <td style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>{user.email}</td>
                  <td style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>{user.company || "—"}</td>
                  <td>
                    <span className={`badge ${user.role === "admin" ? "badge-gold" : "badge-blue"}`}>
                      {user.role === "admin" ? "Admin" : "Üye"}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${STATUS_BADGE[user.status] ?? "badge-gray"}`} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                      {STATUS_ICONS[user.status]}
                      {user.status === "active" ? "Aktif" : user.status === "pending" ? "Beklemede" : "Askıya Alındı"}
                    </span>
                  </td>
                  <td style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                    {new Date(user.createdAt).toLocaleDateString("tr-TR")}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      {user.status === "active" ? (
                        <button className="btn btn-danger btn-sm" onClick={() => updateUser(user.id, { status: "suspended" })}>
                          Askıya Al
                        </button>
                      ) : (
                        <button className="btn btn-secondary btn-sm" onClick={() => updateUser(user.id, { status: "active" })}>
                          Aktive Et
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>E-posta</th>
                <th>Durum</th>
                <th>Gönderilme</th>
                <th>Son Geçerlilik</th>
              </tr>
            </thead>
            <tbody>
              {invites.map((inv) => (
                <tr key={inv.id}>
                  <td>{inv.email}</td>
                  <td>
                    <span className={`badge ${inv.status === "accepted" ? "badge-green" : inv.status === "pending" ? "badge-gold" : "badge-red"}`}>
                      {inv.status === "accepted" ? "Kabul Edildi" : inv.status === "pending" ? "Bekliyor" : "Süresi Doldu"}
                    </span>
                  </td>
                  <td style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                    {new Date(inv.createdAt).toLocaleDateString("tr-TR")}
                  </td>
                  <td style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                    {new Date(inv.expiresAt).toLocaleDateString("tr-TR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Davet Modal */}
      {showInviteModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
          onClick={() => setShowInviteModal(false)}>
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--bg-border)", borderRadius: "var(--radius-xl)", padding: 36, width: "100%", maxWidth: 460 }}
            onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: 8 }}>Üye Davet Et</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: 24 }}>
              Daveti e-posta ile gönderilecek. Üye kayıt olduğunda otomatik aktif edilecektir.
            </p>

            <div className="input-group" style={{ marginBottom: 16 }}>
              <label className="input-label">E-posta Adresi *</label>
              <input
                id="invite-email-input"
                className="input"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="musteri@sirket.com"
              />
            </div>

            {inviteResult?.url && (
              <div style={{ background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: "var(--radius-md)", padding: "12px 16px", marginBottom: 16 }}>
                <div style={{ color: "var(--success)", fontSize: "0.8125rem", fontWeight: 500, marginBottom: 6 }}>✓ Davet gönderildi!</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", wordBreak: "break-all" }}>
                  SMTP ayarlanmadıysa bu linki paylaş:<br />
                  <span style={{ color: "var(--brand-primary)" }}>{inviteResult.url}</span>
                </div>
              </div>
            )}

            {inviteResult?.error && (
              <div style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: "var(--radius-md)", padding: "12px 16px", marginBottom: 16, color: "var(--error)", fontSize: "0.8125rem" }}>
                {inviteResult.error}
              </div>
            )}

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn btn-secondary" onClick={() => setShowInviteModal(false)}>Kapat</button>
              <button id="send-invite-btn" className="btn btn-primary" onClick={handleInvite} disabled={inviting || !inviteEmail}>
                {inviting ? "Gönderiliyor…" : <><Mail size={14} /> Davet Gönder</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
