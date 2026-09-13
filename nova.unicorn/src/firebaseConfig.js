import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: `${process.env.REACT_APP_FIREBASE_KEY}`,
  authDomain: "nova-unicorn-cfae8.firebaseapp.com",
  projectId: "nova-unicorn-cfae8",
  storageBucket: "nova-unicorn-cfae8.appspot.com",
  messagingSenderId: "654148363121",
  appId: "1:654148363121:web:77780bf98f200fa8330cd0",
  measurementId: "G-BCZCWYW71K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };