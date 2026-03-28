"use client";

import { useEffect, useState } from "react";

interface Invoice {
  id: string;
  invoiceNumber: string;
  userEmail: string;
  total: number;
  taxAmount: number;
  createdAt: string;
  pdfUrl?: string;
  billingInfo: { name: string; company?: string };
}

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/invoices")
      .then((r) => r.json())
      .then((d) => { setInvoices(d.invoices ?? []); setLoading(false); });
  }, []);

  const totalKdv = invoices.reduce((s, i) => s + (i.taxAmount ?? 0), 0);
  const totalNet = invoices.reduce((s, i) => s + (i.total - (i.taxAmount ?? 0)), 0);

  return (
    <div>
      <div className="page-header">
        <h1>Fatura Yönetimi</h1>
        <p>Tüm müşteri faturalarını görüntüleyin.</p>
      </div>

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-label">Toplam Fatura</div>
          <div className="stat-value">{invoices.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Net Tutar</div>
          <div className="stat-value">{totalNet.toLocaleString("tr-TR")} ₺</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Toplam KDV</div>
          <div className="stat-value">{totalKdv.toLocaleString("tr-TR")} ₺</div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: 64 }} />)}
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Fatura No</th>
                <th>Müşteri</th>
                <th>Faturalanan</th>
                <th>KDV</th>
                <th>Toplam</th>
                <th>Tarih</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td style={{ fontWeight: 600, color: "var(--brand-primary)" }}>{inv.invoiceNumber}</td>
                  <td style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>{inv.userEmail}</td>
                  <td style={{ fontSize: "0.8125rem" }}>
                    <div>{inv.billingInfo.name}</div>
                    {inv.billingInfo.company && <div style={{ color: "var(--text-muted)" }}>{inv.billingInfo.company}</div>}
                  </td>
                  <td style={{ color: "var(--text-secondary)" }}>{(inv.taxAmount ?? 0).toLocaleString("tr-TR")} ₺</td>
                  <td style={{ fontWeight: 600, color: "var(--brand-primary)" }}>{inv.total.toLocaleString("tr-TR")} ₺</td>
                  <td style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                    {new Date(inv.createdAt).toLocaleDateString("tr-TR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
