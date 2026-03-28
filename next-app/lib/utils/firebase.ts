import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GithubAuthProvider, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Providers
const githubProvider = new GithubAuthProvider();
const googleProvider = new GoogleAuthProvider();

export const loginWithGithub = () => signInWithPopup(auth, githubProvider);
export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);