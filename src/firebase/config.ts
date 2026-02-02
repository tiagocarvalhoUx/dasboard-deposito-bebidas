import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// SUAS CREDENCIAIS DO FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyDDg9ysie1TWrB7onNAMF_LGRBHBVIe9Iw",
  authDomain: "dashboard-deposito.firebaseapp.com",
  projectId: "dashboard-deposito",
  storageBucket: "dashboard-deposito.firebasestorage.app",
  messagingSenderId: "922364647878",
  appId: "1:922364647878:web:12f8e81e8c968cd7f8bac7",
  measurementId: "G-1E52302KE5"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app;
