import { getDatabase, ref, remove } from "firebase/database";
import { initializeApp } from "firebase/app";

// const firebaseConfig = {
//     apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
//     authDomain: "inewgenweb.firebaseapp.com",
//     databaseURL: "https://inewgenweb-default-rtdb.asia-southeast1.firebasedatabase.app",
//     projectId: "inewgenweb",
//     storageBucket: "inewgenweb.firebasestorage.app",
//     messagingSenderId: "367428928627",
//     appId: "1:367428928627:web:2c0dad766e8f7918145606",
//     measurementId: "G-C9H5D17Y7T"
// };

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBWgVJNagD8ttdzlJOSzzlmIGqMcserE2Y",
  authDomain: "test-firebase-fee55.firebaseapp.com",
  databaseURL: "https://test-firebase-fee55-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "test-firebase-fee55",
  storageBucket: "test-firebase-fee55.firebasestorage.app",
  messagingSenderId: "921191423657",
  appId: "1:921191423657:web:8162de73acd3b310a353b8",
  measurementId: "G-LJY37H36HC"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, remove };
