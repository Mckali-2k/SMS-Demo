import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';

// Check if we're in development mode without proper Firebase config
const isTestMode = process.env.NODE_ENV === 'development' && 
  (!process.env.FIREBASE_PROJECT_ID || 
   process.env.FIREBASE_PROJECT_ID === 'test-project' ||
   !process.env.FIREBASE_PRIVATE_KEY ||
   process.env.FIREBASE_PRIVATE_KEY.includes('TEST_KEY'));

let firebaseInitialized = false;

if (!isTestMode) {
  // Validate required environment variables for production
  const requiredEnvVars = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL'
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }

  const serviceAccount: ServiceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID!,
    privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
  };

  // Initialize Firebase Admin SDK
  if (!admin.apps.length) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
      firebaseInitialized = true;
      console.log('✅ Firebase initialized successfully');
    } catch (error) {
      console.error('❌ Firebase initialization failed:', error);
      throw error;
    }
  }
} else {
  console.log('⚠️  Running in test mode - Firebase disabled');
}

// Export Firebase services (will be null in test mode)
export const auth = firebaseInitialized ? admin.auth() : null;
export const firestore = firebaseInitialized ? admin.firestore() : null;
export const storage = firebaseInitialized ? admin.storage() : null;

export { firebaseInitialized, isTestMode };
export default admin;