
'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

/**
 * Initializes Firebase with robust safeguards.
 * 
 * Now uses hardcoded config for reliability.
 */
export function initializeFirebase(): {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
} {
  const isBrowser = typeof window !== 'undefined';
  
  if (!isBrowser) {
    return {
      firebaseApp: {} as any,
      firestore: {} as any,
      auth: {} as any,
    };
  }

  try {
    const apps = getApps();
    const firebaseApp = apps.length > 0 
      ? getApp() 
      : initializeApp(firebaseConfig);
      
    const firestore = getFirestore(firebaseApp);
    const auth = getAuth(firebaseApp);

    return { firebaseApp, firestore, auth };
  } catch (error) {
    console.error('Firebase failed to initialize:', error);
    return {
      firebaseApp: {} as any,
      firestore: {} as any,
      auth: {} as any,
    };
  }
}

export * from './provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
