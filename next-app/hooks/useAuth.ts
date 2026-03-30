import { useState, useEffect } from 'react';
import {
    onAuthStateChanged,
    User,
    GithubAuthProvider,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile
} from 'firebase/auth';
import { auth } from '@/lib/utils/firebase'; 
import { userService } from '@/lib/services/user.service';

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // ดักจับการเปลี่ยนแปลงสถานะ Login
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
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
                } catch (error) {
                    // Non-blocking error - don't interrupt auth flow
                    console.warn("ซิงค์ข้อมูลล้มเหลว (ไม่บัง Auth):", error);
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
            
            // ซิงค์กับหลังบ้านแบบ Manual เพื่อให้ชื่อไปทันที
            await userService.syncProfile({
                uid: result.user.uid,
                email: result.user.email,
                displayName: name,
                photoURL: result.user.photoURL,
            });
            
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
        loginWithGoogle, 
        signUpWithEmail, 
        signInWithEmail, 
        logout 
    };
};
