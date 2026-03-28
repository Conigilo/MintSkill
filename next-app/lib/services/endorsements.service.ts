import { fetchAPI } from './api';

export const endorsementService = {
  // ดึงประวัติว่ามีใครมากด Endorse เราบ้าง
  getMyEndorsements: async () => {
    return await fetchAPI('/endorsements', { method: 'GET' });
  },

  // กด Endorse ให้เพื่อน (ส่ง ID เพื่อน และ สกิลที่โหวตให้)
  endorseFriend: async (targetUserId: string, skillName: string) => {
    return await fetchAPI('/endorsements', {
      method: 'POST',
      body: JSON.stringify({ targetId: targetUserId, skill: skillName })
    });
  }
};

export interface Endorsement {
  id: string;
  fromUserId: string;
  fromUserName?: string;
  skill: string;
  createdAt?: string;
}

// Named exports for hooks to ensure compatibility with Next.js SSR
export async function fetchMyEndorsements(): Promise<Endorsement[]> {
  return endorsementService.getMyEndorsements();
}