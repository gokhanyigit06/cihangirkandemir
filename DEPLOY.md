# C_Studio — Coolify Deployment Guide

## Ortam Değişkenleri (Environment Variables)

Coolify panelinde **Settings → Environment Variables** altına şunları ekle:

```env
# Firebase Client
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBf07KebBu9CRcCs8WHPHymGHtxIhb_QAE
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=cihangirkandemir-50cb8.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=cihangirkandemir-50cb8
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=cihangirkandemir-50cb8.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=470619840149
NEXT_PUBLIC_FIREBASE_APP_ID=1:470619840149:web:4427a9a791b35df9da059c

# Firebase Admin
FIREBASE_PROJECT_ID=cihangirkandemir-50cb8
FIREBASE_CLIENT_EMAIL=<service-account-client-email>
FIREBASE_PRIVATE_KEY="<service-account-private-key>"

# App
NEXT_PUBLIC_APP_URL=https://studio.cihangirkandemir.com
SESSION_SECRET=<en-az-32-karakter-guclu-secret>

# SMTP (isteğe bağlı)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<eposta@gmail.com>
SMTP_PASS=<app-password>

# İyzico (ödeme sistemi — sonraki faz)
IYZICO_API_KEY=<api-key>
IYZICO_SECRET_KEY=<secret-key>
IYZICO_BASE_URL=https://api.iyzipay.com
```

## Deploy Adımları

1. **Coolify UI'ye giriş yap**
2. **New Application** → **GitHub** → `gokhanyigit06/cihangirkandemir`
3. **Build Pack:** Dockerfile
4. **Branch:** `main`
5. **Port:** `3000`
6. Yukarıdaki env değişkenlerini ekle
7. **Deploy** butonuna bas

## Domain Ayarı

- Coolify → Application → Domains → `studio.cihangirkandemir.com` ekle
- DNS: A kaydını Coolify sunucu IP'sine yönlendir
- SSL: Coolify otomatik Let's Encrypt sertifikası alır

## Health Check

- Path: `/api/health`
- Interval: 30s

## Güvenlik Notları

- `FIREBASE_PRIVATE_KEY` değerini çift tırnak içinde gir, `\n` karakterleri korunmalı
- `.env.local` dosyasını **asla** commit etme (`.gitignore`'da mevcut)
- GitHub token'ını revoke edip yeni token al
