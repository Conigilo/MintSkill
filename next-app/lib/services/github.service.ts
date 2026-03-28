import { fetchAPI } from './api';

export const githubService = {
  // ส่ง GitHub Access Token ไปให้ Elysia เก็บไว้
  connectAccount: async (accessToken: string) => {
    return await fetchAPI('/github/connect', {
      method: 'POST',
      body: JSON.stringify({ token: accessToken })
    });
  },

  // ให้ Elysia ไปกวาด Repositories ของเรามาโชว์
  getMyRepos: async () => {
    return await fetchAPI('/github/repos', { method: 'GET' });
  }
};