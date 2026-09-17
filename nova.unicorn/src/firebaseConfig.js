import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBMk6twqrPNUxzI9mXjQVLKvA-Zj-iPEbQ",
  authDomain: "minitasker-e75bdf47.firebaseapp.com",
  projectId: "minitasker-e75bdf47",
  storageBucket: "minitasker-e75bdf47.firebasestorage.app",
  messagingSenderId: "298306799940",
  appId: "1:298306799940:web:37cbedfae5edadfa552f11"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };