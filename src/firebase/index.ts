'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

/**
 * Initializes Firebase with robust safeguards for the Next.js build process.
 * 
 * THE FIX:
 * During 'next build', environment variables are often missing. This function
 * detects if we are in a build environment (missing API keys) and returns 
 * dummy instances. This allows the build to complete. 
 */
export function initializeFirebase(): {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
} {
  // Check if we have the minimum required config to initialize
  const isConfigValid = typeof window !== 'undefined' && 
                        !!firebaseConfig.apiKey && 
                        firebaseConfig.apiKey !== 'undefined' && 
                        firebaseConfig.apiKey !== '';

  if (!isConfigValid) {
    // Return dummy objects to satisfy types during static site generation (build)
    // We cast to any/Auth to prevent the build from failing on type checks
    return {
      firebaseApp: {} as any,
      firestore: {} as any,
      auth: {} as any,
    };
  }

  // Real initialization - only runs in the browser when keys are present
  try {
    const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const firestore = getFirestore(firebaseApp);
    const auth = getAuth(firebaseApp);

    return { firebaseApp, firestore, auth };
  } catch (error) {
    console.warn('Firebase initialization failed:', error);
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
