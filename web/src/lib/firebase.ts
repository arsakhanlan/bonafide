import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Live Firebase configuration for bonafide-cup-2026 (public values; env vars can override).
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyA7BFYJh4aWQinckC6N0_o1ZQONGqyLMHM',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'bonafide-cup-2026.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'bonafide-cup-2026',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'bonafide-cup-2026.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '199277557753',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:199277557753:web:3562db37f9fce27192af28',
};

// Initialize Firebase safely
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);

/**
 * Get current ID token or sign in anonymously if not logged in yet
 */
export async function getAuthToken(): Promise<string> {
  try {
    if (!auth.currentUser) {
      const cred = await signInAnonymously(auth);
      return await cred.user.getIdToken();
    }
    return await auth.currentUser.getIdToken();
  } catch (error) {
    console.warn('Firebase anonymous auth not available; using demo session token', error);
    return 'demo-token-bonafide';
  }
}

