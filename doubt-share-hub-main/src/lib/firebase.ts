import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

// 🔧 Replace with your Firebase project's web config.
// Firebase Console → Project Settings → Your apps → Web app → Config
// These keys are publishable and safe to keep in source.
const firebaseConfig = {
  apiKey: "AIzaSyAVDDUmwvhECaVChNHY4WMNP8ukIC00bJc",
  authDomain: "doubt-share-hub.firebaseapp.com",
  projectId: "doubt-share-hub",
  storageBucket: "doubt-share-hub.firebasestorage.app",
  messagingSenderId: "759160099087",
  appId: "1:759160099087:web:c3704a480e69a52d0b2e7a",
  measurementId: "G-VWYGL7TX7H",
};

export const isFirebaseConfigured =
  !!firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith("YOUR_");

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;

function ensureApp(): FirebaseApp {
  if (!isFirebaseConfigured) {
    throw new Error(
      "Firebase is not configured. Add your web config to src/lib/firebase.ts."
    );
  }
  if (!_app) _app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return _app;
}

export function getFirebaseAuth(): Auth {
  if (!_auth) _auth = getAuth(ensureApp());
  return _auth;
}

export function getDb(): Firestore {
  if (!_db) _db = getFirestore(ensureApp());
  return _db;
}
