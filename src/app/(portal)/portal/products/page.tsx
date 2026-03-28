"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, Check, X } from "lucide-react";
import type { Product, OrderItem } from "@/lib/types";
import styles from "./products.module.css";

const PRICE_UNIT_LABEL: Record<string, string> = {
  once: "Tek Seferlik",
  month: "/ Ay",
  year: "/ Yıl",
};

export default function PortalProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [ordering, setOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => {
        setProducts((d.products ?? []).filter((p: Product) => p.isActive));
        setLoading(false);
      });
  }, []);

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          productId: product.id!,
          productName: product.name,
          quantity: 1,
          unitPrice: product.price,
        },
      ];
    });
    setShowCart(true);
  }

  function removeFromCart(productId: string) {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  }

  const cartTotal = cart.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  async function placeOrder() {
    setOrdering(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: cart }),
    });
    if (res.ok) {
      setCart([]);
      setShowCart(false);
      setOrderSuccess(true);
      setTimeout(() => setOrderSuccess(false), 5000);
    }
    setOrdering(false);
  }

  return (
    <div>
      <div className="page-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1>Ürünler & Paketler</h1>
          <p>Size özel hizmet ve paketleri inceleyin.</p>
        </div>
        {cart.length > 0 && (
          <button id="open-cart-btn" className="btn btn-primary" onClick={() => setShowCart(true)}>
            <ShoppingCart size={16} /> Sepet ({cart.length})
          </button>
        )}
      </div>

      {orderSuccess && (
        <div className={styles.successBanner}>
          <Check size={18} />
          Siparişiniz alındı! Faturanız e-posta adresinize gönderilecektir.
        </div>
      )}

      {loading ? (
        <div className={styles.grid}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 200, borderRadius: "var(--radius-lg)" }} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>
          Şu an için ürün bulunmamaktadır.
        </div>
      ) : (
        <div className={styles.grid}>
          {products.map((p) => (
            <div key={p.id} className={styles.productCard}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span className="badge badge-gray">{p.category}</span>
                {p.isCustomizable && (
                  <span className="badge badge-gold">Özelleştirilebilir</span>
                )}
              </div>
              <div className={styles.productName}>{p.name}</div>
              <div className={styles.productDesc}>{p.description}</div>
              <div>
                <span className={styles.productPrice}>
                  {p.price.toLocaleString("tr-TR")} ₺
                </span>
                <span className={styles.productPriceSub}> {PRICE_UNIT_LABEL[p.priceUnit]}</span>
              </div>
              <button
                id={`add-to-cart-${p.id}`}
                className="btn btn-primary btn-sm"
                style={{ marginTop: 4 }}
                onClick={() => addToCart(p)}
              >
                <ShoppingCart size={14} /> Sepete Ekle
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Sepet Drawer */}
      {showCart && (
        <div className={styles.overlay} onClick={() => setShowCart(false)}>
          <div className={styles.cartDrawer} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: "1.1rem" }}>Sepetim</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowCart(false)}>
                <X size={18} />
              </button>
            </div>

            {cart.length === 0 ? (
              <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "40px 0" }}>Sepet boş.</p>
            ) : (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
                  {cart.map((item) => (
                    <div key={item.productId} className={styles.cartItem}>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: "0.9rem" }}>{item.productName}</div>
                        <div style={{ color: "var(--brand-primary)", fontWeight: 600, marginTop: 2 }}>
                          {(item.unitPrice * item.quantity).toLocaleString("tr-TR")} ₺
                        </div>
                      </div>
                      <button className="btn btn-danger btn-sm" onClick={() => removeFromCart(item.productId)}>
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="divider" />
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, fontFamily: "'Outfit', sans-serif" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Toplam (KDV hariç)</span>
                  <span style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--brand-primary)" }}>
                    {cartTotal.toLocaleString("tr-TR")} ₺
                  </span>
                </div>

                <button
                  id="place-order-btn"
                  className="btn btn-primary"
                  style={{ width: "100%", justifyContent: "center" }}
                  onClick={placeOrder}
                  disabled={ordering}
                >
                  {ordering ? "Sipariş oluşturuluyor…" : "Sipariş Ver"}
                </button>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 8, textAlign: "center" }}>
                  %20 KDV faturaya yansıtılacaktır.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
