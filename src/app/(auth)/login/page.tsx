"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      // ID token'ı server'a gönder → session cookie oluştur
      const idToken = await credential.user.getIdToken();
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!res.ok) throw new Error("Oturum açılamadı.");

      // Kullanıcı rolüne göre yönlendir
      const data = await res.json();
      if (data.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/portal");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Bir hata oluştu.";
      // Firebase hata mesajlarını Türkçeleştir
      if (msg.includes("invalid-credential") || msg.includes("wrong-password") || msg.includes("user-not-found")) {
        setError("E-posta veya şifre hatalı.");
      } else if (msg.includes("too-many-requests")) {
        setError("Çok fazla deneme. Lütfen bir süre bekleyin.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      {/* Background pattern */}
      <div className={styles.bg} />

      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.logo}>
          <span className={styles.logoMark}>CK</span>
          <div>
            <div className={styles.logoName}>Cihangir Kandemir</div>
            <div className={styles.logoSub}>Studio Portal</div>
          </div>
        </div>

        <h1 className={styles.title}>Hoş Geldiniz</h1>
        <p className={styles.desc}>
          Bu platform yalnızca davetli üyeler içindir.
        </p>

        <form onSubmit={handleLogin} className={styles.form}>
          <div className="input-group">
            <label className="input-label" htmlFor="email">
              E-posta Adresi
            </label>
            <input
              id="email"
              type="email"
              className="input"
              placeholder="ornek@sirket.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="password">
              Şifre
            </label>
            <input
              id="password"
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button
            id="login-submit"
            type="submit"
            className={`btn btn-primary btn-lg ${styles.submitBtn}`}
            disabled={loading}
          >
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>

        <div className={styles.footer}>
          Platforma erişim için bir davet almanız gerekmektedir.
          <br />
          Sorun yaşıyorsanız{" "}
          <a href="https://wa.me/90XXXXXXXXXX" target="_blank" rel="noopener noreferrer">
            WhatsApp
          </a>{" "}
          üzerinden ulaşın.
        </div>
      </div>
    </div>
  );
}
