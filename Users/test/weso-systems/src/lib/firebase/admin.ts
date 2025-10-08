// src/lib/firebase/admin.ts
import admin from 'firebase-admin';
import { getApps, initializeApp, getApp, App } from 'firebase-admin/app';

// This function ensures that Firebase Admin is initialized only once.
export const initializeAdminApp = (): App => {
  const apps = getApps();
  if (apps.length > 0) {
    return apps[0]!;
  }

  // If no app is initialized, create a new one.
  try {
    const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountString) {
      throw new Error(
        'The FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. The value should be the JSON content of your service account key file.'
      );
    }
    const serviceAccount = JSON.parse(serviceAccountString);
    
    return initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  } catch (error: any) {
    console.error('CRITICAL ERROR: Firebase Admin SDK initialization failed.', error.message);
    // This fallback is for local development environments where the ENV VAR might not be set.
    // In a real production environment, this part should ideally not be needed.
    try {
      const serviceAccount = require('../../../serviceAccountKey.json');
      return initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
    } catch (localError: any) {
      console.error(
        "CRITICAL ERROR: Fallback local initialization also failed. Ensure 'serviceAccountKey.json' is in the root directory for local development or FIREBASE_SERVICE_ACCOUNT_KEY is set for production.",
        localError.message
      );
      // Re-throw the error to prevent the app from continuing with a non-initialized Firebase instance
      throw new Error('Firebase Admin SDK could not be initialized. See server logs for details.');
    }
  }
};
