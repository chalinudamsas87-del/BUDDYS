import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// ⚠️ REPLACE THESE WITH YOUR OWN FIREBASE CONFIG
// Go to https://console.firebase.google.com → Your project → Project Settings → Web app
const firebaseConfig = {
  apiKey: "AIzaSyBj_gVKESRmxAXdOewrSTxDyBYgOLG3jIA",
  authDomain: "buddys-6f4c6.firebaseapp.com",
  projectId: "buddys-6f4c6",
  storageBucket: "buddys-6f4c6.firebasestorage.app",
  messagingSenderId: "597027258911",
  appId: "1:597027258911:web:3a63c855ca1e8654cccb2a"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
