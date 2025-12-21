import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBUlO8l6fW5JvdyuXOKI3NNwbEwGmPDTSY",
  authDomain: "assistix-57da7.firebaseapp.com",
  projectId: "assistix-57da7",
  storageBucket: "assistix-57da7.firebasestorage.app",
  messagingSenderId: "967356831856",
  appId: "1:967356831856:web:7bb90138a275fb97823cb5",
  measurementId: "G-DNMK87P1JS"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
