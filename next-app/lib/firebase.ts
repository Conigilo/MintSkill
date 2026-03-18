import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBMwMXF1jfjo7C9pTWEUZKmbcr_C88lyCw",
    authDomain: "web-pro-261e6.firebaseapp.com",
    projectId: "web-pro-261e6",
    storageBucket: "web-pro-261e6.firebasestorage.app",
    messagingSenderId: "869632344083",
    appId: "1:869632344083:web:96ef8b40f6cee806713fe6",
    measurementId: "G-F95YW0BXGH"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
export const firebaseAuth = getAuth(app)
export const firebaseDb = getFirestore(app)
export default app