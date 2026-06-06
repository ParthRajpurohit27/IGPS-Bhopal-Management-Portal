
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/**
 * Firebase configuration using environment variables.
 * 
 * To resolve the "invalid API key" error:
 * 1. Go to the Firebase Console (https://console.firebase.google.com/)
 * 2. Select your project and go to "Project settings"
 * 3. Under "General" -> "Your apps", find your Web app (or create one)
 * 4. Copy the values from the `firebaseConfig` object and ensure they are
 *    available in your environment as NEXT_PUBLIC_FIREBASE_* variables.
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
// If variables are missing, we log a warning but don't crash the build
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
