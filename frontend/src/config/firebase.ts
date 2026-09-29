import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAeZBGoTLHUwJqJjEUM01KB1SZIdP9mkG8",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "lms-college-5975a.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "lms-college-5975a",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "lms-college-5975a.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "470720333100",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:470720333100:web:2ea322bbacc0a12bc45889",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-XB651TRPY3",
};

// Initialize Firebase for client side
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
