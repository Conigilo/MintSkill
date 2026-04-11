import { useState, useEffect } from 'react';
import {
    onAuthStateChanged,
    User,
    GithubAuthProvider,
    GoogleAuthProvider,
    signInWithPopup,
    linkWithPopup,
    signOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    getAuth
} from 'firebase/auth';
import { auth } from '@/lib/utils/firebase'; 
import { userService } from '../services/user.service';

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // ดักจับการเปลี่ยนแปลงสถานะ Login
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                // Force reload to get latest displayName and photoURL
                try {
                    await currentUser.reload();
                } catch (error) {
                    console.warn("Failed to reload user:", error);
                }
            }
            
            setUser(currentUser);

            if (currentUser) {
                // ถ้ายืนยันตัวตนผ่าน Firebase สำเร็จ -> ยิงไปทักทายหลังบ้าน Elysia
                try {
                    await userService.syncProfile({
                        uid: currentUser.uid,
                        email: currentUser.email,
                        displayName: currentUser.displayName,
                        photoURL: currentUser.photoURL,
                    });
                    console.log("ซิงค์ข้อมูลกับ Backend สำเร็จ!");
                } catch (error) {
                    console.error("ซิงค์ข้อมูลล้มเหลว (ไม่บัง Auth):", error);
                }
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // 1. ฟังก์ชัน Login ด้วย GitHub
    const loginWithGithub = async () => {
        const provider = new GithubAuthProvider();
        try {
            return await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("GitHub Login Error:", error);
            throw error;
        }
    };

    const linkGithubAccount = async () => {
        if (!auth.currentUser) {
            throw new Error("No user logged in");
        }

        const provider = new GithubAuthProvider();
        try {
            return await linkWithPopup(auth.currentUser, provider);
        } catch (error) {
            console.error("GitHub Link Error:", error);
            throw error;
        }
    };

    // 2. ฟังก์ชัน Login ด้วย Google
    const loginWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            return await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Google Login Error:", error);
            throw error;
        }
    };

    // 3. ฟังก์ชันสมัครสมาชิกด้วย Email
    const signUpWithEmail = async (name: string, email: string, password: string) => {
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            
            // อัปเดต Profile ชื่อให้ทันที
            await updateProfile(result.user, { displayName: name });
            
            // Force refresh Firebase state เพื่อให้ displayName ขึ้นมา
            // (อันนี้จะทำให้ onAuthStateChanged ถูก trigger อีกครั้ง)
            const currentAuth = getAuth();
            if (currentAuth.currentUser) {
                await currentAuth.currentUser.reload();
            }
            
            // ซิงค์กับหลังบ้านแบบ Manual เพื่อให้ชื่อไปทันที
            try {
                await userService.syncProfile({
                    uid: result.user.uid,
                    email: result.user.email,
                    displayName: name,
                    photoURL: result.user.photoURL,
                });
                console.log("ซิงค์ข้อมูลสำเร็จ!");
            } catch (syncError) {
                console.error("Profile sync failed (non-critical):", syncError);
                // Don't re-throw - let signup succeed even if sync fails
            }
            
            return result;
        } catch (error) {
            console.error("SignUp Error:", error);
            throw error;
        }
    };

    // 4. ฟังก์ชัน Login ด้วย Email
    const signInWithEmail = async (email: string, password: string) => {
        try {
            return await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error("SignIn Error:", error);
            throw error;
        }
    };

    const logout = async () => {
        await signOut(auth);
    };

    return { 
        user, 
        loading, 
        loginWithGithub, 
        linkGithubAccount,
        loginWithGoogle, 
        signUpWithEmail, 
        signInWithEmail, 
        logout 
    };
};