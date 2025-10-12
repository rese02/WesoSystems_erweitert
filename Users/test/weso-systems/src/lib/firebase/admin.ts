// src/lib/firebase/admin.ts
import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

function initializeAdminApp() {
  const apps = getApps();
  if (apps.length > 0) {
    return apps[0]!;
  }

  // Wenn keine App initialisiert ist, wird eine neue erstellt.
  try {
    const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountString) {
      throw new Error(
        'Die Umgebungsvariable FIREBASE_SERVICE_ACCOUNT_KEY ist nicht gesetzt. Der Wert sollte der JSON-Inhalt Ihrer Service-Account-Schlüsseldatei sein.'
      );
    }
    const serviceAccount = JSON.parse(serviceAccountString);
    
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  } catch (error: any) {
    console.error('KRITISCHER FEHLER: Die Initialisierung des Firebase Admin SDK ist fehlgeschlagen.', error.message);
    // Fallback für die lokale Entwicklung, falls die Umgebungsvariable nicht gesetzt ist.
    try {
      const serviceAccount = require('../../../serviceAccountKey.json');
      return admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
    } catch (localError: any) {
      console.error(
        "KRITISCHER FEHLER: Auch die lokale Fallback-Initialisierung ist fehlgeschlagen. Stellen Sie sicher, dass 'serviceAccountKey.json' für die lokale Entwicklung im Stammverzeichnis vorhanden ist oder FIREBASE_SERVICE_ACCOUNT_KEY für die Produktion gesetzt ist.",
        localError.message
      );
      // Erneutes Auslösen des Fehlers, um zu verhindern, dass die App mit einer nicht initialisierten Firebase-Instanz weiterläuft.
      throw new Error('Firebase Admin SDK konnte nicht initialisiert werden. Siehe Server-Protokolle für Details.');
    }
  }
}

const adminApp = initializeAdminApp();

const db = admin.firestore();
const auth = admin.auth();
const storage = admin.storage();

export { db, auth, storage };
