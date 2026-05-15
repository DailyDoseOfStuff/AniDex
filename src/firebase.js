/**
 * Firebase Configuration & Initialization
 */
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCsaDUw0cUGLERbz0lHBfL_pydRPW1Iueo",
  authDomain: "anitr-e1dfe.firebaseapp.com",
  projectId: "anitr-e1dfe",
  storageBucket: "anitr-e1dfe.firebasestorage.app",
  messagingSenderId: "781296361305",
  appId: "1:781296361305:web:2d033aa7e1d582a6687648",
  measurementId: "G-9ETH5VEQK0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);