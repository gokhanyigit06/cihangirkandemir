import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getStorage, Storage } from "firebase-admin/storage";

// Lazy singleton — build sırasında değil, ilk API çağrısında başlar
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
  const privateKey = (
    process.env.FIREBASE_PRIVATE_KEY ||
    process.env.FIREBASE_ADMIN_PRIVATE_KEY ||
    ""
  ).replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase Admin env değişkenleri eksik: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY"
    );
  }

  _app = initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });

  return _app;
}

// Getter fonksiyonları — her çağrıda lazy init yapar
export const adminAuth: Auth = new Proxy({} as Auth, {
  get(_, prop) {
    return (getAuth(getAdminApp()) as never)[prop as string];
  },
});

export const adminDb: Firestore = new Proxy({} as Firestore, {
  get(_, prop) {
    return (getFirestore(getAdminApp()) as never)[prop as string];
  },
});

export const adminStorage: Storage = new Proxy({} as Storage, {
  get(_, prop) {
    return (getStorage(getAdminApp()) as never)[prop as string];
  },
});
