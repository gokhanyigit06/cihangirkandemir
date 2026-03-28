import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getStorage, Storage } from "firebase-admin/storage";

let _app: App | null = null;

function getAdminApp(): App {
  if (_app) return _app;
  if (getApps().length > 0) {
    _app = getApps()[0];
    return _app;
  }

  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail =
    process.env.FIREBASE_CLIENT_EMAIL ||
    process.env.FIREBASE_ADMIN_CLIENT_EMAIL;

  // Base64 veya düz key desteği
  let privateKey = "";
  if (process.env.FIREBASE_PRIVATE_KEY_BASE64) {
    privateKey = Buffer.from(
      process.env.FIREBASE_PRIVATE_KEY_BASE64,
      "base64"
    ).toString("utf-8");
  } else {
    privateKey = (
      process.env.FIREBASE_PRIVATE_KEY ||
      process.env.FIREBASE_ADMIN_PRIVATE_KEY ||
      ""
    ).replace(/\\n/g, "\n");
  }

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase Admin env eksik: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY_BASE64"
    );
  }

  _app = initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });

  return _app;
}

// Proxy yerine sade getter fonksiyonları — daha güvenilir
export function getAdminAuth(): Auth {
  return getAuth(getAdminApp());
}

export function getAdminDb(): Firestore {
  return getFirestore(getAdminApp());
}

export function getAdminStorage(): Storage {
  return getStorage(getAdminApp());
}

// Geriye dönük uyumluluk için alias'lar (mevcut kodlar bozulmasın)
export const adminAuth = {
  verifyIdToken: (...args: Parameters<Auth["verifyIdToken"]>) =>
    getAdminAuth().verifyIdToken(...args),
  verifySessionCookie: (...args: Parameters<Auth["verifySessionCookie"]>) =>
    getAdminAuth().verifySessionCookie(...args),
  createSessionCookie: (...args: Parameters<Auth["createSessionCookie"]>) =>
    getAdminAuth().createSessionCookie(...args),
  createUser: (...args: Parameters<Auth["createUser"]>) =>
    getAdminAuth().createUser(...args),
  updateUser: (...args: Parameters<Auth["updateUser"]>) =>
    getAdminAuth().updateUser(...args),
  setCustomUserClaims: (...args: Parameters<Auth["setCustomUserClaims"]>) =>
    getAdminAuth().setCustomUserClaims(...args),
  getUserByEmail: (...args: Parameters<Auth["getUserByEmail"]>) =>
    getAdminAuth().getUserByEmail(...args),
  deleteUser: (...args: Parameters<Auth["deleteUser"]>) =>
    getAdminAuth().deleteUser(...args),
};

export const adminDb = {
  collection: (...args: Parameters<Firestore["collection"]>) =>
    getAdminDb().collection(...args),
  doc: (...args: Parameters<Firestore["doc"]>) =>
    getAdminDb().doc(...args),
  runTransaction: (...args: Parameters<Firestore["runTransaction"]>) =>
    getAdminDb().runTransaction(...args),
};

export const adminStorage = {
  bucket: (...args: Parameters<Storage["bucket"]>) =>
    getAdminStorage().bucket(...args),
};
