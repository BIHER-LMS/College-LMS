import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { env } from './env';

let firebaseApp: App | null = null;
let firebaseAuth: Auth | null = null;

try {
  if (env.FIREBASE_PROJECT_ID && env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY) {
    let privateKey = env.FIREBASE_PRIVATE_KEY;
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1);
    }
    privateKey = privateKey.replace(/\\n/g, '\n');

    if (getApps().length === 0) {
      firebaseApp = initializeApp({
        credential: cert({
          projectId: env.FIREBASE_PROJECT_ID,
          clientEmail: env.FIREBASE_CLIENT_EMAIL,
          privateKey,
        }),
      });
    } else {
      firebaseApp = getApps()[0];
    }
    firebaseAuth = getAuth(firebaseApp);
    console.log('[Firebase] Admin SDK initialized successfully for project:', env.FIREBASE_PROJECT_ID);
  } else {
    console.warn('[Firebase] Admin SDK credentials not fully provided. Falling back to local JWT auth.');
  }
} catch (error: any) {
  console.warn('[Firebase] Admin SDK initialization note:', error.message);
}

export { firebaseApp, firebaseAuth };

export async function verifyFirebaseIdToken(token: string) {
  if (!firebaseAuth) {
    throw new Error('Firebase Admin SDK is not initialized');
  }
  return await firebaseAuth.verifyIdToken(token);
}
