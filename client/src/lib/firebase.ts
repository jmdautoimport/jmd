import { initializeApp } from "firebase/app";
import { getFirestore, enableMultiTabIndexedDbPersistence } from "firebase/firestore";

// Firebase configuration from environment variables
// Customers must create a .env file with these values
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Validate config
export const isFirebaseInitialized = !!firebaseConfig.apiKey;

let app;
let dbInstance;

if (isFirebaseInitialized) {
  console.log("Initializing Firebase with Project ID:", firebaseConfig.projectId);
  try {
    app = initializeApp(firebaseConfig);
    dbInstance = getFirestore(app);
    console.log("Firebase app and Firestore instance created.");
  } catch (initErr) {
    console.error("Firebase initialization failed:", initErr);
  }

  // Enable offline persistence
  if (typeof window !== "undefined" && dbInstance) {
    console.log("Attempting to enable Firestore persistence...");
    enableMultiTabIndexedDbPersistence(dbInstance).then(() => {
      console.log("Firestore persistence enabled successfully.");
    }).catch((err) => {
      if (err.code === 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled in one tab at a time.
        console.warn("Firestore persistence failed: Multiple tabs open.");
      } else if (err.code === 'unimplemented') {
        // The current browser does not support persistence
        console.warn("Firestore persistence failed: Browser not supported.");
      } else {
        console.error("Firestore persistence error:", err);
      }
    });
  }
} else {
  console.warn("Firebase credentials missing. App will run in Setup Mode. Check your VITE_FIREBASE_* env variables.");
}

// Export casted db to avoid TypeScript errors in consumers
export const db = dbInstance as ReturnType<typeof getFirestore>;

// Advanced diagnostics for debugging
if (typeof window !== "undefined") {
  (window as any).firebaseDiagnostics = {
    isInitialized: isFirebaseInitialized,
    projectId: firebaseConfig.projectId,
    browserOnline: navigator.onLine,
    config: { ...firebaseConfig, apiKey: firebaseConfig.apiKey ? "REDACTED" : "MISSING" },
    checkConnection: async () => {
      if (!isFirebaseInitialized) return "Firebase not initialized";
      try {
        const { collection, getDocs, limit, query } = await import("firebase/firestore");
        const q = query(collection(db, "cars"), limit(1));
        const snap = await getDocs(q);
        return `Connection successful. Found ${snap.size} cars in 'cars' collection.`;
      } catch (err: any) {
        return `Connection failed: ${err.message} (Code: ${err.code})`;
      }
    },
    importDataFromJSON: async (jsonData: any[]) => {
      if (!isFirebaseInitialized) return "Firebase not initialized";
      try {
        const { collection, addDoc } = await import("firebase/firestore");
        const carsCol = collection(db, "cars");
        let count = 0;
        for (const car of jsonData) {
          await addDoc(carsCol, {
            ...car,
            id: crypto.randomUUID(),
            slug: car.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
            published: true,
            isComingSoon: false
          });
          count++;
        }
        return `Successfully imported ${count} cars.`;
      } catch (err: any) {
        return `Import failed: ${err.message}`;
      }
    }
  };
  console.log("Firebase Diagnostics available at: window.firebaseDiagnostics");
}




