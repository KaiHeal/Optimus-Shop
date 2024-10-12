import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD0iFy3SwZ-_2D1b5WMCdMRdZdXnAhmZg8",
  authDomain: "fir-lab4-11f33.firebaseapp.com",
  databaseURL: "https://fir-lab4-11f33-default-rtdb.firebaseio.com",
  projectId: "fir-lab4-11f33",
  storageBucket: "fir-lab4-11f33.appspot.com",
  messagingSenderId: "263448853734",
  appId: "1:263448853734:web:e0a5e8795dc98119348f27",
  measurementId: "G-7FTXDGDTYS"
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const FIRESTORE_DB = getFirestore(FIREBASE_APP);
