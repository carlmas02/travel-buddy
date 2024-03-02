// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyA_HwGhYoUT4-2P9zR2JqkdRyC_BX383nc",
//   authDomain: "travel-app-7f607.firebaseapp.com",
//   projectId: "travel-app-7f607",
//   storageBucket: "travel-app-7f607.appspot.com",
//   messagingSenderId: "758794957894",
//   appId: "1:758794957894:web:dc5e685652449e7d668647",
// };

const firebaseConfig = {
  apiKey: "AIzaSyA4kMmjDk8pacGRqVoE94xXJbSLHGdJbxw",
  authDomain: "travellog-76fbc.firebaseapp.com",
  projectId: "travellog-76fbc",
  storageBucket: "travellog-76fbc.appspot.com",
  messagingSenderId: "229361367942",
  appId: "1:229361367942:web:50b07835bd17992a338a07",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
export const realtimeDB = getDatabase();
