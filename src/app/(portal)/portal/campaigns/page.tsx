"use client";

import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";

interface Campaign {
  id: string;
  title: string;
  description: string;
  bannerUrl: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  link?: string;
  targetGroups: string[];
}

export default function PortalCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/campaigns")
      .then((r) => r.json())
      .then((d) => {
        const now = new Date();
        const active = (d.campaigns ?? []).filter((c: Campaign) =>
          c.isActive &&
          new Date(c.startDate) <= now &&
          new Date(c.endDate) >= now
        );
        setCampaigns(active);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>Kampanyalar</h1>
        <p>Size özel aktif kampanya ve fırsatları inceleyin.</p>
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 160, borderRadius: "var(--radius-lg)" }} />)}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>
          Şu an aktif kampanya bulunmamaktadır.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {campaigns.map((c) => (
            <div key={c.id} style={{ background: "var(--bg-surface)", border: "1px solid var(--bg-border)", borderRadius: "var(--radius-lg)", overflow: "hidden", display: "flex", transition: "all 0.25s ease" }}
              className="card-hover">
              {/* Banner */}
              {c.bannerUrl ? (
                <div style={{ width: 200, flexShrink: 0, background: `url(${c.bannerUrl}) center/cover`, minHeight: 140 }} />
              ) : (
                <div style={{ width: 200, flexShrink: 0, background: "linear-gradient(135deg,var(--brand-primary),var(--brand-primary-dark))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem" }}>
                  🎯
                </div>
              )}

              {/* İçerik */}
              <div style={{ padding: "24px 28px", flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <h2 style={{ fontSize: "1.1rem", fontWeight: 600 }}>{c.title}</h2>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    {new Date(c.startDate).toLocaleDateString("tr-TR")} – {new Date(c.endDate).toLocaleDateString("tr-TR")}
                  </span>
                </div>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: 1.6, marginBottom: c.link ? 16 : 0 }}>
                  {c.description}
                </p>
                {c.link && (
                  <a href={c.link} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                    <ExternalLink size={13} /> Fırsata Git
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
