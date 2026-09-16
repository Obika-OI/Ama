import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  signInAnonymously,
  linkWithPopup,
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot 
} from 'firebase/firestore';

// User's manual Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDDhSUsNIZLZEAJEZi5ZPeD_O-OGiNe86k",
  authDomain: "ama-babycare.firebaseapp.com",
  projectId: "ama-babycare",
  storageBucket: "ama-babycare.firebasestorage.app",
  messagingSenderId: "659272330070",
  appId: "1:659272330070:web:bf494e9fadf8c4c2c6c4f7",
  measurementId: "G-3VBX1QEMMD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
let analytics: any = null;
isSupported().then(supported => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

let dbInstance: ReturnType<typeof getFirestore>;
try {
  dbInstance = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true,
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  });
} catch (err) {
  console.warn("Firestore already initialized or custom settings unsupported, using standard instance:", err);
  dbInstance = getFirestore(app);
}

export const db = dbInstance;
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize the Gemini Developer API backend service
export const ai = getAI(app, { backend: new GoogleAIBackend() });
export const model = getGenerativeModel(ai, { model: "gemini-3.5-flash" });

export { 
  analytics,
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  signInAnonymously,
  linkWithPopup,
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot 
};
export type { FirebaseUser };

// --- Error Handling as defined in SKILL.md ---
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
