import { auth } from '../utils/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * รอให้ Firebase auth state โหลดเสร็จก่อน
 * แก้ปัญหา race condition ที่ auth.currentUser ยัง null ตอน mount ครั้งแรก
 */
function waitForAuthReady(): Promise<void> {
    return new Promise((resolve) => {
        // ถ้า auth state โหลดเสร็จแล้ว (currentUser มีหรือไม่มี แต่ไม่ใช่ undefined)
        // Firebase จะเรียก onAuthStateChanged อย่างน้อย 1 ครั้งเสมอ
        const unsubscribe = onAuthStateChanged(auth, () => {
            unsubscribe();
            resolve();
        });
    });
}

let authReady = false;
// Mark auth as ready after first state change
onAuthStateChanged(auth, () => { authReady = true; });

export const fetchAPI = async (endpoint: string, options: RequestInit = {}, retry = true) => {
    // ถ้า auth ยังไม่พร้อม ให้รอก่อน (ป้องกัน 401 จาก race condition)
    if (!authReady) {
        await waitForAuthReady();
    }

    const user = auth.currentUser;
    let token = "";
    
    if (user) {
        token = await user.getIdToken();
    }

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(options.headers as Record<string, string>),
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    // If 401 and we haven't retried yet — force refresh token and retry once
    if (response.status === 401 && retry && user) {
        const newToken = await user.getIdToken(true);
        headers.Authorization = `Bearer ${newToken}`;
        const retryResponse = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });
        const retryData = await retryResponse.json().catch(() => ({}));
        if (!retryResponse.ok) {
            throw new Error(retryData?.message || `API Error: ${retryResponse.status}`);
        }
        return retryData;
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        const message = data?.message || `API Error: ${response.status}`;
        throw new Error(String(message));
    }

    return data;
};