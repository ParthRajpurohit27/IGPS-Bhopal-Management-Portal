import { initializeFirebase } from "@/firebase";

/**
 * Re-exporting consolidated Firebase instances with lazy initialization.
 */
const getFirebase = () => {
  return initializeFirebase();
};

// We export them as objects that proxy to the actual instances
// to avoid module-level initialization crashes during the build.
export const auth = typeof window !== 'undefined' ? getFirebase().auth : {} as any;
export const db = typeof window !== 'undefined' ? getFirebase().firestore : {} as any;
