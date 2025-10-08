// src/lib/firebase/admin.ts
import admin from 'firebase-admin';
import { getApps, initializeApp, getApp } from 'firebase-admin/app';

export const initializeAdminApp = () => {
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
    
    return initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  } catch (error) {
    console.error('CRITICAL ERROR: Firebase Admin SDK initialization failed.', error);
    // Fallback for local development if the primary method fails
    // This allows running the app locally using a file
    try {
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
