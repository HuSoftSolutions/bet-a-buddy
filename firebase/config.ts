import { getFirestore } from "firebase/firestore";
import { auth } from "./client";
import { getApp } from "firebase/app";

// Get the Firebase app instance
const app = getApp();

// Initialize Firestore
const db = getFirestore(app);

export { db };