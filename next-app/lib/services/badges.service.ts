import { fetchAPI } from './api';

export const badgeService = {
  // ดึง Badge ทั้งหมดที่เรามี
  getMyBadges: async () => {
    return await fetchAPI('/badges', { method: 'GET' });
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
  id: string;
  name: string;
  image?: string;
  earnedAt?: string;
}

// Named exports for hooks to ensure compatibility with Next.js SSR
export async function fetchUserBadges(userId: string): Promise<Badge[] | null> {
  return badgeService.fetchUserBadges(userId);
}