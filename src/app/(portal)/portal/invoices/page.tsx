"use client";

import { useEffect, useState } from "react";
import { FileText, Download } from "lucide-react";

interface Invoice {
  id: string;
  invoiceNumber: string;
  total: number;
  taxAmount: number;
  createdAt: string;
  pdfUrl?: string;
  billingInfo: { name: string; company?: string };
  items: { description: string; quantity: number; unitPrice: number; total: number }[];
}

export default function PortalInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Invoice | null>(null);

  useEffect(() => {
    fetch("/api/invoices")
      .then((r) => r.json())
      .then((d) => { setInvoices(d.invoices ?? []); setLoading(false); });
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>Faturalarım</h1>
        <p>Tüm faturalarınızı görüntüleyin ve indirin.</p>
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 64 }} />)}
        </div>
      ) : invoices.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>
          Henüz fatura bulunmamaktadır.
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Fatura No</th>
                <th>Adres</th>
                <th>KDV</th>
                <th>Toplam</th>
                <th>Tarih</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td style={{ fontWeight: 600 }}>{inv.invoiceNumber}</td>
                  <td style={{ fontSize: "0.8125rem" }}>
                    <div>{inv.billingInfo.name}</div>
                    {inv.billingInfo.company && (
                      <div style={{ color: "var(--text-muted)" }}>{inv.billingInfo.company}</div>
                    )}
                  </td>
                  <td style={{ color: "var(--text-secondary)" }}>
                    {inv.taxAmount.toLocaleString("tr-TR")} ₺
                  </td>
                  <td style={{ fontWeight: 600, color: "var(--brand-primary)" }}>
                    {inv.total.toLocaleString("tr-TR")} ₺
                  </td>
                  <td style={{ color: "var(--text-muted)", fontSize: "0.8125rem" }}>
                    {new Date(inv.createdAt).toLocaleDateString("tr-TR")}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setSelected(inv)}
                        title="Görüntüle"
                      >
                        <FileText size={14} />
                      </button>
                      {inv.pdfUrl && (
                        <a href={inv.pdfUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" title="PDF İndir">
                          <Download size={14} />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Fatura detay modal */}
      {selected && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
          onClick={() => setSelected(null)}
        >
          <div
            style={{ background: "var(--bg-surface)", border: "1px solid var(--bg-border)", borderRadius: "var(--radius-xl)", padding: 36, width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 4 }}>FATURA</div>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: "1.4rem", fontWeight: 700, color: "var(--brand-primary)" }}>{selected.invoiceNumber}</div>
              </div>
              <div style={{ textAlign: "right", fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
                <div>{new Date(selected.createdAt).toLocaleDateString("tr-TR")}</div>
                <div style={{ marginTop: 4, color: "var(--text-muted)" }}>Cihangir Kandemir Studio</div>
              </div>
            </div>

            <div className="divider" />

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Faturalanan</div>
              <div style={{ fontWeight: 500 }}>{selected.billingInfo.name}</div>
              {selected.billingInfo.company && <div style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>{selected.billingInfo.company}</div>}
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 16 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--bg-border)" }}>
                  <th style={{ textAlign: "left", padding: "8px 0", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Hizmet</th>
                  <th style={{ textAlign: "right", padding: "8px 0", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Toplam</th>
                </tr>
              </thead>
              <tbody>
                {selected.items.map((item, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--bg-border)" }}>
                    <td style={{ padding: "10px 0", fontSize: "0.875rem" }}>{item.description} ×{item.quantity}</td>
                    <td style={{ padding: "10px 0", fontSize: "0.875rem", textAlign: "right" }}>{item.total.toLocaleString("tr-TR")} ₺</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
              <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                KDV (%20): <strong>{selected.taxAmount.toLocaleString("tr-TR")} ₺</strong>
              </div>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: "1.25rem", fontWeight: 700, color: "var(--brand-primary)" }}>
                Toplam: {selected.total.toLocaleString("tr-TR")} ₺
              </div>
            </div>

            <div style={{ marginTop: 24, textAlign: "right" }}>
              <button className="btn btn-secondary" onClick={() => setSelected(null)}>Kapat</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
