import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBf-pXQ2g7sTRkztd0cnOffn40j1BN2eYA",
  authDomain: "campus-lost-found-da094.firebaseapp.com",
  projectId: "campus-lost-found-da094",
  storageBucket: "campus-lost-found-da094.firebasestorage.app",
  messagingSenderId: "228407079541",
  appId: "1:228407079541:web:b98b0c6ba5f3c4edaabe3c"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
