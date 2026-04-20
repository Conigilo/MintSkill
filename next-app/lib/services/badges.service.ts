import { fetchAPI } from './api';
import { auth } from '@/lib/utils/firebase';

export const badgeService = {
  // ดึง Badge ทั้งหมดของ user ที่กำลัง login อยู่
  getMyBadges: async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error('Not authenticated');
    return await fetchAPI(`/badges/${uid}`, { method: 'GET' });
  },

  /**
   * Fetch all badges for a specific user ID
   */
  fetchUserBadges: async (userId: string): Promise<Badge[] | null> => {
    try {
      const data = await fetchAPI(`/badges/${userId}`)
      return data.badges || data.data || []
    } catch (error) {
      console.error('Error fetching badges:', error)
      return null
    }
  }
};

export interface Badge {
  [x: string]: string;
  id: string;
  name: string;
  description?: string;
  icon?: string;
  image?: string;
  earnedAt?: string;
}

// Named exports for hooks to ensure compatibility with Next.js SSR
export async function fetchUserBadges(userId: string): Promise<Badge[] | null> {
  return badgeService.fetchUserBadges(userId);
}