// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCkiA-7FYA9vBTgojbYXdkpsPQ5cAx_nk4",
  authDomain: "registro-e2328.firebaseapp.com",
  projectId: "registro-e2328",
  storageBucket: "registro-e2328.firebasestorage.app",
  messagingSenderId: "315752771883",
  appId: "1:315752771883:web:93dad6707d4778bd5fd56e",
  databaseURL: "https://registro-e2328-default-rtdb.firebaseio.com",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
