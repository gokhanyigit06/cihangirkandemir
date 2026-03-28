"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, FileText, Clock } from "lucide-react";

interface Contract {
  id: string;
  title: string;
  content: string;
  sentAt: string;
  expiresAt: string;
  status: string;
}

function SignForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [alreadySigned, setAlreadySigned] = useState(false);
  const [signerName, setSignerName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);
  const [signedAt, setSignedAt] = useState("");

  useEffect(() => {
    if (!token) { setError("Geçersiz link."); setLoading(false); return; }
    fetch(`/api/contracts/sign?token=${token}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.alreadySigned) { setAlreadySigned(true); setLoading(false); return; }
        if (d.error) { setError(d.error); setLoading(false); return; }
        setContract(d);
        setLoading(false);
      });
  }, [token]);

  async function handleSign() {
    if (!agreed || !signerName.trim()) return;
    setSigning(true);

    const res = await fetch("/api/contracts/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, signerName }),
    });

    const data = await res.json();
    if (res.ok) {
      setSigned(true);
      setSignedAt(data.signedAt);
    } else {
      setError(data.error ?? "İmzalama başarısız.");
    }
    setSigning(false);
  }

  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(200,169,110,0.1) 0%, transparent 70%), var(--bg-base)", padding: "40px 24px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
          <div style={{ width: 44, height: 44, background: "linear-gradient(135deg,var(--brand-primary),var(--brand-primary-dark))", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Outfit',sans-serif", fontWeight: 800, color: "var(--text-inverse)" }}>CK</div>
          <div>
            <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700 }}>Cihangir Kandemir Studio</div>
            <div style={{ fontSize: "0.75rem", color: "var(--brand-primary)" }}>Online Sözleşme İmzalama</div>
          </div>
        </div>

        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 40 }} />)}
          </div>
        )}

        {!loading && alreadySigned && (
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--bg-border)", borderRadius: "var(--radius-xl)", padding: 48, textAlign: "center" }}>
            <CheckCircle size={56} style={{ color: "var(--success)", margin: "0 auto 16px" }} />
            <h2 style={{ color: "var(--success)", marginBottom: 8 }}>Sözleşme Zaten İmzalandı</h2>
            <p style={{ color: "var(--text-muted)" }}>Bu sözleşme daha önce başarıyla imzalanmıştır.</p>
          </div>
        )}

        {!loading && error && !alreadySigned && (
          <div style={{ background: "var(--bg-surface)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: "var(--radius-xl)", padding: 48, textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: 16 }}>⛔</div>
            <h2 style={{ color: "var(--error)", marginBottom: 8 }}>Geçersiz Link</h2>
            <p style={{ color: "var(--text-muted)" }}>{error}</p>
          </div>
        )}

        {!loading && signed && (
          <div style={{ background: "var(--bg-surface)", border: "1px solid rgba(74,222,128,0.3)", borderRadius: "var(--radius-xl)", padding: 48, textAlign: "center" }}>
            <CheckCircle size={64} style={{ color: "var(--success)", margin: "0 auto 16px" }} />
            <h1 style={{ color: "var(--success)", marginBottom: 12 }}>Sözleşme İmzalandı!</h1>
            <p style={{ color: "var(--text-secondary)", marginBottom: 8 }}>
              <strong>{signerName}</strong> tarafından başarıyla imzalandı.
            </p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.8125rem" }}>
              İmzalanma zamanı: {new Date(signedAt).toLocaleString("tr-TR")}
            </p>
          </div>
        )}

        {!loading && contract && !signed && !error && (
          <>
            {/* Sözleşme Başlığı */}
            <div style={{ background: "var(--bg-surface)", border: "1px solid var(--bg-border)", borderRadius: "var(--radius-lg)", padding: "20px 24px", marginBottom: 24, display: "flex", alignItems: "center", gap: 16, justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <FileText size={24} style={{ color: "var(--brand-primary)", flexShrink: 0 }} />
                <div>
                  <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 600, fontSize: "1.1rem" }}>{contract.title}</div>
                  <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginTop: 2 }}>
                    Gönderildi: {new Date(contract.sentAt).toLocaleDateString("tr-TR")}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8125rem", color: "var(--warning)" }}>
                <Clock size={14} />
                Son: {new Date(contract.expiresAt).toLocaleDateString("tr-TR")}
              </div>
            </div>

            {/* Sözleşme İçeriği */}
            <div style={{ background: "var(--bg-surface)", border: "1px solid var(--bg-border)", borderRadius: "var(--radius-lg)", padding: "32px", marginBottom: 24, maxHeight: 480, overflowY: "auto", lineHeight: 1.8, fontSize: "0.9375rem", color: "var(--text-secondary)", whiteSpace: "pre-wrap" }}>
              {contract.content}
            </div>

            {/* İmzalama Formu */}
            <div style={{ background: "var(--bg-surface)", border: "1px solid var(--brand-primary)", borderRadius: "var(--radius-lg)", padding: "28px" }}>
              <h3 style={{ marginBottom: 16, fontSize: "1rem" }}>İmzalama</h3>

              <div className="input-group" style={{ marginBottom: 16 }}>
                <label className="input-label">Ad Soyad *</label>
                <input
                  id="signer-name"
                  className="input"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  placeholder="Tam adınızı giriniz"
                />
              </div>

              <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", marginBottom: 20 }}>
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  style={{ marginTop: 3, flexShrink: 0 }}
                />
                <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  Sözleşmeyi okudum, anladım ve tüm koşulları kabul ediyorum. Bu onayın yasal bir bağlayıcılığı olduğunu biliyorum.
                </span>
              </label>

              <button
                id="sign-contract-btn"
                className="btn btn-primary"
                style={{ width: "100%", justifyContent: "center", fontSize: "1rem" }}
                onClick={handleSign}
                disabled={!agreed || !signerName.trim() || signing}
              >
                {signing ? "İmzalanıyor…" : "✍️ Sözleşmeyi İmzala"}
              </button>

              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 12, textAlign: "center" }}>
                IP adresiniz ve imzalama zamanı kayıt altına alınacaktır.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function ContractSignPage() {
  return (
    <Suspense fallback={<div />}>
      <SignForm />
    </Suspense>
  );
}
