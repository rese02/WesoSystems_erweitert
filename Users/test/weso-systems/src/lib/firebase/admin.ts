// src/lib/firebase/admin.ts
import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

function getFirebaseAdmin() {
  if (getApps().length > 0) {
    return admin;
  }

  try {
    const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountString) {
      throw new Error(
        'The FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. The value should be the JSON content of your service account key file.'
      );
    }
    const serviceAccount = JSON.parse(serviceAccountString);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
    console.log('Firebase Admin SDK for production successfully initialized.');
  } catch (error) {
    console.error('CRITICAL ERROR: Firebase Admin SDK initialization failed.', error);
    // Fallback for local development if the primary method fails
    // This allows running the app locally using a file
    try {
      const serviceAccount = require('../../../serviceAccountKey.json');
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
      console.log('Firebase Admin SDK for local development successfully initialized.');
    } catch (localError) {
      console.error(
        "CRITICAL ERROR: Fallback local initialization also failed. Ensure 'serviceAccountKey.json' is in the root directory for local development or FIREBASE_SERVICE_ACCOUNT_KEY is set for production.",
        localError
      );
      throw new Error('Firebase Admin SDK could not be initialized.');
    }
  }

  return admin;
}

const adminInstance = getFirebaseAdmin();
const db = adminInstance.firestore();
const auth = adminInstance.auth();
const storage = adminInstance.storage();

export { db, auth, storage };
