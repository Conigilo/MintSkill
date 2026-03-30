import { fetchAPI } from './api';

interface SyncProfileData {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
}

export const userService = {
  // ฟังก์ชันสำหรับเรียกหลังบ้านให้เซฟข้อมูล User ลง Firestore (เมื่อ Login ครั้งแรก)
  syncProfile: async (userData: SyncProfileData) => {
    try {
      return await fetchAPI('/users/sync', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
    } catch (error) {
      // Fall back to localStorage if backend is unavailable
      console.warn("Backend sync failed, saving to localStorage:", error);
      if (typeof window !== 'undefined') {
        localStorage.setItem(`user_${userData.uid}`, JSON.stringify(userData));
      }
      return { success: true, data: userData, local: true };
    }
  },

  // ดึงข้อมูล Profile ปัจจุบันจากหลังบ้าน
  getProfile: async () => {
    try {
      return await fetchAPI('/users/profile', {
        method: 'GET'
      });
    } catch (error) {
      // Return default profile if backend is unavailable
      console.warn("Failed to fetch profile from backend:", error);
      // Return empty profile that will be filled with data from components
      return {
        success: false,
        local: true,
        data: {
          uid: '',
          email: '',
          displayName: '',
          photoURL: ''
        }
      };
    }
  }
};