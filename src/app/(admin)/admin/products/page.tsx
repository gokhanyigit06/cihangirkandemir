"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, Package } from "lucide-react";
import type { Product } from "@/lib/types";
import styles from "./products.module.css";

const PRICE_UNIT_LABEL: Record<string, string> = {
  once: "Tek Seferlik",
  month: "/ Ay",
  year: "/ Yıl",
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    priceUnit: "once",
    category: "",
    isActive: true,
    isCustomizable: false,
  });
  const [saving, setSaving] = useState(false);

  async function fetchProducts() {
    setLoading(true);
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(data.products ?? []);
    setLoading(false);
  }

  useEffect(() => { fetchProducts(); }, []);

  function openNew() {
    setEditProduct(null);
    setForm({ name: "", description: "", price: "", priceUnit: "once", category: "", isActive: true, isCustomizable: false });
    setShowModal(true);
  }

  function openEdit(p: Product) {
    setEditProduct(p);
    setForm({ name: p.name, description: p.description, price: String(p.price), priceUnit: p.priceUnit, category: p.category, isActive: p.isActive, isCustomizable: p.isCustomizable });
    setShowModal(true);
  }

  async function handleSave() {
    setSaving(true);
    const body = { ...form, price: Number(form.price) };
    if (editProduct) {
      await fetch(`/api/products/${editProduct.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    } else {
      await fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    }
    setSaving(false);
    setShowModal(false);
    fetchProducts();
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu ürünü silmek istediğinizden emin misiniz?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    fetchProducts();
  }

  async function toggleActive(p: Product) {
    await fetch(`/api/products/${p.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !p.isActive }) });
    fetchProducts();
  }

  return (
    <div>
      <div className="page-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1>Ürün Yönetimi</h1>
          <p>Platform üzerindeki tüm ürün ve paketleri yönetin.</p>
        </div>
        <button id="add-product-btn" className="btn btn-primary" onClick={openNew}>
          <Plus size={16} /> Yeni Ürün
        </button>
      </div>

      {loading ? (
        <div className={styles.grid}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 180 }} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className={styles.empty}>
          <Package size={48} style={{ color: "var(--text-muted)", marginBottom: 12 }} />
          <p>Henüz ürün eklenmemiş.</p>
          <button className="btn btn-primary" onClick={openNew} style={{ marginTop: 12 }}>
            <Plus size={16} /> İlk Ürünü Ekle
          </button>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Ürün Adı</th>
                <th>Kategori</th>
                <th>Fiyat</th>
                <th>Tür</th>
                <th>Durum</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{p.name}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 2 }}>
                      {p.description?.slice(0, 60)}{p.description?.length > 60 ? "…" : ""}
                    </div>
                  </td>
                  <td><span className="badge badge-gray">{p.category}</span></td>
                  <td style={{ fontWeight: 600, color: "var(--brand-primary)" }}>
                    {p.price.toLocaleString("tr-TR")} ₺
                  </td>
                  <td>{PRICE_UNIT_LABEL[p.priceUnit]}</td>
                  <td>
                    <span className={`badge ${p.isActive ? "badge-green" : "badge-red"}`}>
                      {p.isActive ? "Aktif" : "Pasif"}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)} title="Düzenle">
                        <Pencil size={14} />
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => toggleActive(p)} title={p.isActive ? "Pasife Al" : "Aktife Al"}>
                        {p.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id!)} title="Sil">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className={styles.overlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: 20 }}>{editProduct ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}</h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="input-group">
                <label className="input-label">Ürün Adı *</label>
                <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Sosyal Medya Yönetim Paketi" />
              </div>
              <div className="input-group">
                <label className="input-label">Açıklama *</label>
                <textarea className="input" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Ürün detay açıklaması…" style={{ resize: "vertical" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="input-group">
                  <label className="input-label">Fiyat (₺) *</label>
                  <input className="input" type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="2500" />
                </div>
                <div className="input-group">
                  <label className="input-label">Ödeme Türü</label>
                  <select className="input" value={form.priceUnit} onChange={e => setForm(f => ({ ...f, priceUnit: e.target.value }))}>
                    <option value="once">Tek Seferlik</option>
                    <option value="month">Aylık</option>
                    <option value="year">Yıllık</option>
                  </select>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Kategori</label>
                <input className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Sosyal Medya, Tasarım, SEO…" />
              </div>
              <div style={{ display: "flex", gap: 20 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                  <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />
                  Aktif
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                  <input type="checkbox" checked={form.isCustomizable} onChange={e => setForm(f => ({ ...f, isCustomizable: e.target.checked }))} />
                  Özelleştirilebilir
                </label>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "flex-end" }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>İptal</button>
              <button id="save-product-btn" className="btn btn-primary" onClick={handleSave} disabled={saving || !form.name || !form.price}>
                {saving ? "Kaydediliyor…" : "Kaydet"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
