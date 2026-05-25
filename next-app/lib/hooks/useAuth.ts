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
import { githubService } from '../services/github.service';

let lastSyncedTime = 0;

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // ดักจับการเปลี่ยนแปลงสถานะ Login
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            if (currentUser) {
                const now = Date.now();
                // ป้องกันการซิงค์ข้อมูลรัวๆ (Throttle) หากซิงค์ไปไม่เกิน 30 วินาทีก่อนหน้า
                if (now - lastSyncedTime > 30000) {
                    lastSyncedTime = now;
                    try {
                        await userService.syncProfile({
                            uid: currentUser.uid,
                            email: currentUser.email,
                            displayName: currentUser.displayName,
                            photoURL: currentUser.photoURL,
                        });
                    } catch (error) {
                        console.error("ซิงค์ข้อมูลล้มเหลว (ไม่บัง Auth):", error);
                    }
                }
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const loginWithGithub = async () => {
        const provider = new GithubAuthProvider();
        provider.addScope('repo'); // Request repo scope to count stars and commits
        provider.addScope('read:user');
        try {
            const result = await signInWithPopup(auth, provider);
            const credential = GithubAuthProvider.credentialFromResult(result);
            if (credential?.accessToken) {
                await githubService.connectAccount(credential.accessToken);
            }
            return result;
        } catch (error: any) {
            // ผู้ใช้ปิด popup เอง หรือกดซ้ำ — ไม่ใช่ error จริง
            if (error?.code === 'auth/cancelled-popup-request' || error?.code === 'auth/popup-closed-by-user') {
                return null;
            }
            console.error("GitHub Login Error:", error);
            throw error;
        }
    };

    const linkGithubAccount = async () => {
        if (!auth.currentUser) {
            throw new Error("No user logged in");
        }

        const provider = new GithubAuthProvider();
        provider.addScope('repo'); // Request repo scope to count stars and commits
        provider.addScope('read:user');

        try {
            const result = await linkWithPopup(auth.currentUser, provider);
            const credential = GithubAuthProvider.credentialFromResult(result);
            if (credential?.accessToken) {
                await githubService.connectAccount(credential.accessToken);
            }
            return result;
        } catch (error: any) {
            if (error?.code === 'auth/credential-already-in-use') {
                throw new Error("บัญชี GitHub นี้ถูกเชื่อมต่อกับผู้ใช้อื่นไปแล้ว กรุณาลองใช้บัญชีอื่น หรือออกจากระบบแล้วล็อกอินด้วย GitHub แทน");
            }
            console.error("GitHub Link Error:", error);
            throw error;
        }
    };

    // 2. ฟังก์ชัน Login ด้วย Google
    const loginWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            return await signInWithPopup(auth, provider);
        } catch (error: any) {
            // ผู้ใช้ปิด popup เอง หรือกดซ้ำ — ไม่ใช่ error จริง
            if (error?.code === 'auth/cancelled-popup-request' || error?.code === 'auth/popup-closed-by-user') {
                return null;
            }
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

            // ซิงค์กับหลังบ้าน (Firestore)
            // ถ้าตรงนี้พัง จะถือว่าการสมัครสมาชิกไม่สมบูรณ์ เพราะจะไม่มีที่เก็บข้อมูล Skill
            await userService.syncProfile({
                uid: result.user.uid,
                email: result.user.email,
                displayName: name,
                photoURL: result.user.photoURL,
            });

            return result;
        } catch (error) {
            console.error("SignUp/Sync Error:", error);
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