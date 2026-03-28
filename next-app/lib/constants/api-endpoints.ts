/**
 * API Endpoints - Centralized configuration for all API routes
 */

export const API_ENDPOINTS = {
  // Authentication routes
  AUTH: {
    GITHUB_CALLBACK: '/auth/github/callback',
    VERIFY: '/auth/verify',
    LOGOUT: '/auth/logout',
  },

  // Users routes
  USERS: {
    SEARCH: '/users/search',
    RECOMMENDATIONS: '/users/recommendations',
    ME: '/users/me',
    PROFILE: '/users/profile',
    SYNC: '/users/sync',
    GET_BY_USERNAME: (username: string) => `/users/${username}`,
    PORTFOLIO: (username: string) => `/users/${username}/portfolio`,
  },

  // Skills routes
  SKILLS: {
    GET_MY_SKILLS: '/skills/me',
    GET_USER_SKILLS: (userId: string) => `/skills/${userId}`,
    CREATE: '/skills',
    UPDATE: (skillId: string) => `/skills/${skillId}`,
    DELETE: (skillId: string) => `/skills/${skillId}`,
  },

  // Badges routes
  BADGES: {
    GET_ALL: '/badges',
    GET_USER_BADGES: (userId: string) => `/badges/${userId}`,
  },

  // Endorsements routes
  ENDORSEMENTS: {
    GET: '/endorsements',
    CREATE: '/endorsements',
  },

  // GitHub integration routes
  GITHUB: {
    CONNECT: '/github/connect',
    GET_REPOS: '/github/repos',
  },

  // Jobs routes
  JOBS: {
    GET_RECOMMENDATIONS: '/jobs/recommendations',
    GET_ALL: '/jobs',
    APPLY: (jobId: string) => `/jobs/${jobId}/apply`,
  },

  // Export/Portfolio routes
  EXPORT: {
    EXPORT_PDF: '/export/pdf',
    DOWNLOAD: (token: string) => `/export/${token}`,
  },
} as const;

// Base URL configuration
export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
