// src/lib/firebase/client.ts
import {initializeApp, getApp, getApps} from 'firebase/app';
import {getFirestore} from 'firebase/firestore';
import {getStorage} from 'firebase/storage';
import {getAuth} from 'firebase/auth';

const firebaseConfig = {
  projectId: 'studio-1902246321-d6cb9',
  appId: '1:920216848435:web:824139793154c2f9ebbb46',
  storageBucket: 'studio-1902246321-d6cb9.firebasestorage.app',
  apiKey: 'AIzaSyB60h3O3bcTj3eKR5t9f-HHKrTwmc4Uus4',
  authDomain: 'studio-1902246321-d6cb9.firebaseapp.com',
  messagingSenderId: '920216848435',
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export {app, db, storage, auth};
