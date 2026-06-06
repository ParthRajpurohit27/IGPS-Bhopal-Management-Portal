import { initializeFirebase } from "@/firebase";

/**
 * Re-exporting consolidated Firebase instances.
 * Note: Prefer using the hooks (useAuth, useFirestore) from '@/firebase' 
 * inside React components.
 */
const { auth, firestore: db } = initializeFirebase();

export { auth, db };
