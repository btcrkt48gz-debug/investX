import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { firebaseConfig } from './firebase-config';

// Prevent duplicate initialization in dev hot-reload
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]!;

export const db   = getFirestore(app);
export const rtdb = getDatabase(app);
export const auth = getAuth(app);

export default app;
