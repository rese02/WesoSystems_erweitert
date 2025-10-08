// src/lib/firebase/admin.ts
import admin from 'firebase-admin';
import { getApps, initializeApp, getApp } from 'firebase-admin/app';

const initializeAdminApp = () => {
  if (getApps().length > 0) {
    return getApp();
  }

  try {
    const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountString) {
      throw new Error(
        'The FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. The value should be the JSON content of your service account key file.'
      );
    }
    const serviceAccount = JSON.parse(serviceAccountString);
    console.log('Attempting to initialize Firebase Admin SDK for production...');
    return initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  } catch (error) {
    console.error('CRITICAL ERROR: Firebase Admin SDK initialization failed.', error);
    // Fallback for local development if the primary method fails
    // This allows running the app locally using a file
    try {
      console.log('Attempting to initialize Firebase Admin SDK for local development...');
      const serviceAccount = require('../../../serviceAccountKey.json');
      return initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
    } catch (localError) {
      console.error(
        "CRITICAL ERROR: Fallback local initialization also failed. Ensure 'serviceAccountKey.json' is in the root directory for local development or FIREBASE_SERVICE_ACCOUNT_KEY is set for production.",
        localError
      );
      // Re-throw the error to prevent the app from continuing with a non-initialized Firebase instance
      throw new Error('Firebase Admin SDK could not be initialized.');
    }
  }
};

// Initialize the app and then export the services
const adminApp = initializeAdminApp();
const db = admin.firestore(adminApp);
const auth = admin.auth(adminApp);
const storage = admin.storage(adminApp);

export { db, auth, storage };
