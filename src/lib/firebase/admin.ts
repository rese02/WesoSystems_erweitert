// src/lib/firebase/admin.ts
import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

// WICHTIG: Dieser Code versucht jetzt, die Datei zu laden,
// die im Hauptverzeichnis des Projekts liegt.
try {
  // Der Pfad navigiert vom `src/lib/firebase`-Ordner vier Ebenen nach oben ins Hauptverzeichnis.
  const serviceAccount = require('../../../serviceAccountKey.json');

  if (!getApps().length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      // Der Storage Bucket Name wird aus der Umgebungsvariable gelesen, die bereits für die Client-Seite konfiguriert ist.
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
    });
    console.log('Firebase Admin SDK erfolgreich initialisiert.');
  }
} catch (error) {
  console.error("KRITISCHER FEHLER: Die 'serviceAccountKey.json' konnte nicht geladen werden. Stelle sicher, dass sie im Hauptverzeichnis deines Projekts liegt und korrekt formatiert ist.", error);
}

const db = admin.firestore();
const auth = admin.auth();
const storage = admin.storage();

export { db, auth, storage };
