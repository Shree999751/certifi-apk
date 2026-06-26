import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import type { Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export interface FirebaseServices {
  auth: Auth;
  db: Firestore;
}

export const initFirebase = (config: FirebaseConfig | null): FirebaseServices | null => {
  if (!config || !config.apiKey || !config.projectId) return null;
  try {
    const app = getApps().length === 0 ? initializeApp(config) : getApp();
    const auth = getAuth(app);
    const db = getFirestore(app);
    return { auth, db };
  } catch (err) {
    console.error('Failed dynamically initializing Firebase:', err);
    return null;
  }
};

