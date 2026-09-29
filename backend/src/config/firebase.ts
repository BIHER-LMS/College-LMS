import * as admin from 'firebase-admin';
import { env } from './env';

/**
 * Initialize Firebase Admin SDK.
 *
 * We use service-account credentials supplied via environment variables
 * so that no credentials file needs to be bundled or committed.
 * The private key is stored as an escaped string in env vars and
 * needs newline characters restored.
 */
function initializeFirebase(): admin.app.App {
  // Avoid re-initializing if already initialized (e.g. in tests)
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }

  try {
    const privateKey = env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId: env.FIREBASE_PROJECT_ID,
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      }),
    });
  } catch (error: unknown) {
    if (env.NODE_ENV === 'development') {
      console.warn('⚠️ Firebase Admin initialized in development fallback mode.');
      return admin.initializeApp({
        projectId: env.FIREBASE_PROJECT_ID,
      });
    }
    throw error;
  }
}

const firebaseApp = initializeFirebase();
export const firebaseAuth = admin.auth();
export default firebaseApp;
