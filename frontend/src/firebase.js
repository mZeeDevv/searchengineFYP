import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
    apiKey: "AIzaSyDuaOYbXpf3S3cZ3uCKIWC4J4PU4VtrEPA",
    authDomain: "visual-search-fyp-a5eb6.firebaseapp.com",
    projectId: "visual-search-fyp-a5eb6",
    storageBucket: "visual-search-fyp-a5eb6.firebasestorage.app",
    messagingSenderId: "35895026266",
    appId: "1:35895026266:web:5ec393a4554ec1a92b2e63",
    measurementId: "G-P6DNNCPKSJ"
};
  
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const storage = getStorage(app);


