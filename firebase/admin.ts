import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";


// Initialize Firebase Admin
function initAdmin() {

  if (getApps().length === 0) {
    console.log("Initializing Firebase Admin with project:", process.env.FIREBASE_ADMIN_PROJECT_ID);

    try {
      return initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
      });
    } catch (error) {
      console.error("Error initializing Firebase Admin:", error);
      throw error;
    }
  }

  // Return the already-initialized app
  return getApps()[0];
}

const adminApp = initAdmin();
const adminFirestore = getFirestore(adminApp);

export { adminApp, adminFirestore };
