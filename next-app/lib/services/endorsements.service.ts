import { fetchAPI } from './api';
import { auth } from '@/lib/utils/firebase';

export const endorsementService = {
  // ดึงประวัติว่ามีใครมากด Endorse เราบ้าง
  getMyEndorsements: async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error('Not authenticated');
    return await fetchAPI(`/endorsements/${uid}`, { method: 'GET' });
  },

  // ดึงประวัติว่าเราส่ง Endorse ให้ใครบ้าง
  getSentEndorsements: async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error('Not authenticated');
    return await fetchAPI(`/endorsements/sent/${uid}`, { method: 'GET' });
  },

  // ขอ Endorsement Link (ส่งให้คนอื่นมากด endorse เรา)
  requestEndorsement: async (recipientName: string, recipientEmail?: string, message?: string) => {
    return await fetchAPI('/endorsements/request', {
      method: 'POST',
      body: JSON.stringify({ recipientName, recipientEmail, message }),
    });
  },

  // Endorse เพื่อนโดยตรง — map ไปที่ directEndorse
  endorseFriend: async (targetUserId: string, skillName: string) => {
    return await fetchAPI('/endorsements/direct', {
      method: 'POST',
      body: JSON.stringify({
        toUserId: targetUserId,
        skills: [skillName],
        message: `I endorse your skill: ${skillName}`,
      }),
    });
  },

  // Direct endorse: ส่ง endorsement ให้ user อื่นทันที (ต้อง login)
  directEndorse: async (payload: {
    toUserId: string;
    skills: string[];
    message: string;
    fromRole?: string;
  }) => {
    return await fetchAPI('/endorsements/direct', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // ดึง skills ของ user คนอื่น (สำหรับ populate ใน modal)
  getUserSkills: async (userId: string) => {
    const data = await fetchAPI(`/skills/${userId}`);
    return (data.data || []) as Array<{ id: string; name: string }>;
  },
};

export interface Endorsement {
  id: string;
  fromUserId?: string;
  fromUserName?: string;
  fromName?: string;
  fromRole?: string;
  fromAvatarUrl?: string;
  message?: string;
  skills?: string[];
  skill?: string;
  status?: 'pending' | 'verified';
  createdAt?: any;
  verifiedAt?: any;
}

// Named exports for hooks to ensure compatibility with Next.js SSR
export async function fetchMyEndorsements(): Promise<Endorsement[]> {
  const res = await endorsementService.getMyEndorsements();
  return res?.data || [];
}

export async function fetchMySentEndorsements(): Promise<Endorsement[]> {
  const res = await endorsementService.getSentEndorsements();
  return res?.data || [];
}