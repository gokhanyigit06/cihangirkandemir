"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";

interface UserProfile {
  displayName: string;
  company: string;
  phone: string;
  taxId: string;
  taxOffice: string;
  address: string;
  email: string;
}

export default function PortalSettingsPage() {
  const [profile, setProfile] = useState<UserProfile>({
    displayName: "", company: "", phone: "", taxId: "", taxOffice: "", address: "", email: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => { if (d.user) setProfile(d.user); setLoading(false); });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) return (
    <div>
      <div className="page-header"><h1>Ayarlar</h1></div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 50 }} />)}
      </div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h1>Ayarlar</h1>
        <p>Profil bilgilerinizi ve fatura adresinizi güncelleyin.</p>
      </div>

      <form onSubmit={handleSave} style={{ maxWidth: 640 }}>
        {/* Profil Bilgileri */}
        <div className="card" style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: "1rem", marginBottom: 20 }}>Profil Bilgileri</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="input-group">
              <label className="input-label">Ad Soyad</label>
              <input className="input" value={profile.displayName} onChange={(e) => setProfile((p) => ({ ...p, displayName: e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="input-label">E-posta</label>
              <input className="input" value={profile.email} readOnly style={{ opacity: 0.6 }} />
            </div>
            <div className="input-group">
              <label className="input-label">Telefon</label>
              <input className="input" value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} placeholder="+90 5XX XXX XX XX" />
            </div>
          </div>
        </div>

        {/* Fatura Bilgileri */}
        <div className="card" style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: "1rem", marginBottom: 20 }}>Fatura Bilgileri</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="input-group">
              <label className="input-label">Şirket Adı</label>
              <input className="input" value={profile.company} onChange={(e) => setProfile((p) => ({ ...p, company: e.target.value }))} placeholder="Şirket A.Ş. (isteğe bağlı)" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="input-group">
                <label className="input-label">Vergi No</label>
                <input className="input" value={profile.taxId} onChange={(e) => setProfile((p) => ({ ...p, taxId: e.target.value }))} placeholder="1234567890" />
              </div>
              <div className="input-group">
                <label className="input-label">Vergi Dairesi</label>
                <input className="input" value={profile.taxOffice} onChange={(e) => setProfile((p) => ({ ...p, taxOffice: e.target.value }))} placeholder="Kadıköy V.D." />
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">Fatura Adresi</label>
              <textarea className="input" rows={3} value={profile.address} onChange={(e) => setProfile((p) => ({ ...p, address: e.target.value }))} placeholder="Tam adres…" style={{ resize: "vertical" }} />
            </div>
          </div>
        </div>

        {saved && (
          <div style={{ background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: "var(--radius-md)", padding: "12px 16px", marginBottom: 16, color: "var(--success)", fontSize: "0.875rem" }}>
            ✓ Bilgileriniz kaydedildi.
          </div>
        )}

        <button id="save-settings-btn" type="submit" className="btn btn-primary" disabled={saving}>
          <Save size={16} /> {saving ? "Kaydediliyor…" : "Değişiklikleri Kaydet"}
        </button>
      </form>
    </div>
  );
}
