import { fetchAPI } from './api';

export const githubService = {
  // ส่ง GitHub Access Token ไปให้ backend เก็บไว้
  connectAccount: async (accessToken: string) => {
    return await fetchAPI('/github/connect', {
      method: 'POST',
      body: JSON.stringify({ token: accessToken })
    });
  },

  // สั่งให้ backend ไปดึง Repositories + auto-detect skills จาก languages
  syncGitHub: async () => {
    return await fetchAPI('/github/sync', { method: 'POST' });
  },

  // ดึง Repositories ที่ sync ไว้แล้ว (เรียงตาม stars)
  getMyRepos: async () => {
    return await fetchAPI('/github/repos', { method: 'GET' });
  },

  // ดึงข้อมูลทั้งหมดสำหรับ Dashboard ใน 1 call
  getDashboard: async () => {
    return await fetchAPI('/github/dashboard', { method: 'GET' });
  },

  // สลับสถานะ Spotlight ของ repo
  toggleSpotlight: async (repoDocId: string) => {
    return await fetchAPI(`/github/repos/${repoDocId}/spotlight`, { method: 'PUT' });
  },
};