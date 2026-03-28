"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [tokenEmail, setTokenEmail] = useState("");
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [tokenError, setTokenError] = useState("");

  const [form, setForm] = useState({
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
    company: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) { setTokenError("Geçersiz davet linki."); setTokenValid(false); return; }
    fetch(`/api/register?token=${token}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.valid) { setTokenEmail(d.email); setForm((f) => ({ ...f, email: d.email })); setTokenValid(true); }
        else { setTokenError(d.error ?? "Geçersiz davet."); setTokenValid(false); }
      });
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError("Şifreler eşleşmiyor."); return; }
    if (form.password.length < 6) { setError("Şifre en az 6 karakter olmalıdır."); return; }

    setLoading(true);
    setError("");

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, ...form }),
    });

    const data = await res.json();
    if (res.ok) {
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } else {
      setError(data.error ?? "Kayıt tamamlanamadı.");
    }
    setLoading(false);
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(200,169,110,0.12) 0%, transparent 70%), var(--bg-base)" }}>
      <div style={{ width: "100%", maxWidth: 480, background: "var(--bg-surface)", border: "1px solid var(--bg-border)", borderRadius: "var(--radius-xl)", padding: 40, boxShadow: "var(--shadow-lg)" }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
          <div style={{ width: 44, height: 44, background: "linear-gradient(135deg,var(--brand-primary),var(--brand-primary-dark))", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: "1rem", color: "var(--text-inverse)" }}>CK</div>
          <div>
            <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: "0.9375rem" }}>Cihangir Kandemir</div>
            <div style={{ fontSize: "0.75rem", color: "var(--brand-primary)", fontWeight: 500 }}>Studio Portal — Kayıt</div>
          </div>
        </div>

        {tokenValid === null && (
          <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "40px 0" }}>
            <div className="skeleton" style={{ height: 20, width: "60%", margin: "0 auto" }} />
          </div>
        )}

        {tokenValid === false && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ fontSize: "2rem", marginBottom: 12 }}>⛔</div>
            <h2 style={{ color: "var(--error)", marginBottom: 8 }}>Geçersiz Davet</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>{tokenError}</p>
          </div>
        )}

        {tokenValid === true && !success && (
          <>
            <h1 style={{ fontSize: "1.5rem", marginBottom: 6 }}>Kaydı Tamamla</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: 24 }}>
              <strong style={{ color: "var(--brand-primary)" }}>{tokenEmail}</strong> için davet alındı.
            </p>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="input-group">
                <label className="input-label">Ad Soyad *</label>
                <input className="input" value={form.displayName} onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))} placeholder="Ahmet Yılmaz" required />
              </div>
              <div className="input-group">
                <label className="input-label">E-posta *</label>
                <input className="input" type="email" value={form.email} readOnly style={{ opacity: 0.6 }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="input-group">
                  <label className="input-label">Şifre *</label>
                  <input className="input" type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="••••••••" required />
                </div>
                <div className="input-group">
                  <label className="input-label">Şifre Tekrar *</label>
                  <input className="input" type="password" value={form.confirmPassword} onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))} placeholder="••••••••" required />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Şirket Adı</label>
                <input className="input" value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} placeholder="Şirket A.Ş. (isteğe bağlı)" />
              </div>
              <div className="input-group">
                <label className="input-label">Telefon</label>
                <input className="input" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+90 5XX XXX XX XX (isteğe bağlı)" />
              </div>

              {error && (
                <div style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: "var(--radius-md)", padding: "10px 14px", fontSize: "0.8125rem", color: "var(--error)" }}>
                  {error}
                </div>
              )}

              <button id="register-submit" type="submit" className="btn btn-primary btn-lg" style={{ justifyContent: "center", marginTop: 4 }} disabled={loading}>
                {loading ? "Kayıt yapılıyor…" : "Kaydı Tamamla"}
              </button>
            </form>
          </>
        )}

        {success && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ fontSize: "3rem", marginBottom: 16 }}>🎉</div>
            <h2 style={{ color: "var(--success)", marginBottom: 8 }}>Kaydınız Tamamlandı!</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>Giriş sayfasına yönlendiriliyorsunuz…</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div />}>
      <RegisterForm />
    </Suspense>
  );
}
