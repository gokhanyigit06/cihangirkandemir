/**
 * İlk admin kullanıcısını Firebase'e ekleyen seed scripti.
 * Çalıştırma: npx ts-node --project tsconfig.json scripts/create-admin.ts
 * ya da: npx tsx scripts/create-admin.ts
 */
import * as admin from "firebase-admin";
import { readFileSync } from "fs";
import { resolve } from "path";

// Service account JSON'u oku
const serviceAccount = JSON.parse(
  readFileSync(
    resolve(process.cwd(), "cihangirkandemir-50cb8-firebase-adminsdk-fbsvc-cef851dcb1.json"),
    "utf-8"
  )
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const auth = admin.auth();
const db = admin.firestore();

async function createAdmin() {
  const email = "admin@cihangirkandemir.com"; // ← değiştirebilirsin
  const password = "Admin123!";              // ← değiştirebilirsin
  const displayName = "Cihangir Kandemir";

  try {
    // Firebase Auth'ta kullanıcı oluştur
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(email);
      console.log(`✓ Kullanıcı zaten var: ${email}`);
    } catch {
      userRecord = await auth.createUser({ email, password, displayName });
      console.log(`✓ Auth kullanıcısı oluşturuldu: ${email}`);
    }

    // Custom claim olarak admin rolü ata
    await auth.setCustomUserClaims(userRecord.uid, { role: "admin" });
    console.log(`✓ Admin custom claim atandı`);

    // Firestore'a kullanıcı dökümanı ekle
    await db.collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      displayName,
      role: "admin",
      status: "active",
      groupIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    console.log(`✓ Firestore kullanıcı dökümanı oluşturuldu`);
    console.log(`\n🎉 Admin hesabı hazır!`);
    console.log(`   E-posta : ${email}`);
    console.log(`   Şifre   : ${password}`);
    console.log(`\n⚠️  Şifreyi giriş yaptıktan sonra değiştirmeyi unutma!`);
  } catch (error) {
    console.error("Hata:", error);
  } finally {
    process.exit(0);
  }
}

createAdmin();
