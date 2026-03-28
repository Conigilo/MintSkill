/**
 * Application constants
 */

// Theme Colors
export const THEME = {
  // Base colors
  bg: {
    primary: '#090d14',
    secondary: '#0d1117',
    tertiary: '#161b22',
  },
  border: '#30363d',
  text: {
    primary: '#c9d1d9',
    secondary: '#8b949e',
    error: '#f85149',
    success: '#238636',
  },
  accent: '#58a6ff',
  green: '#238636',
  red: '#f85149',
  yellow: '#d29922',
  blue: '#1f6feb',
}

// API Configuration
export const API_CONFIG = {
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
}

// Skill Categories
export const SKILL_CATEGORIES = [
  { value: 'frontend', label: 'Frontend', icon: '🎨' },
  { value: 'backend', label: 'Backend', icon: '⚙️' },
  { value: 'devops', label: 'DevOps', icon: '🚀' },
  { value: 'design', label: 'Design', icon: '✏️' },
  { value: 'soft-skills', label: 'Soft Skills', icon: '🤝' },
  { value: 'other', label: 'Other', icon: '📚' },
] as const

// Proficiency Levels
export const PROFICIENCY_LEVELS = [
  { value: 'beginner', label: 'Beginner', color: '#243da8' },
  { value: 'intermediate', label: 'Intermediate', color: '#1f6feb' },
  { value: 'advanced', label: 'Advanced', color: '#d29922' },
  { value: 'expert', label: 'Expert', color: '#238636' },
] as const

// Export Formats
export const EXPORT_FORMATS = [
  { format: 'pdf' as const, name: 'PDF', icon: '📄' },
  { format: 'json' as const, name: 'JSON', icon: '📋' },
  { format: 'md' as const, name: 'Markdown', icon: '📝' },
] as const

// Tab Configuration
export const DASHBOARD_TABS = [
  { key: 'overview', label: 'Overview', icon: '📊' },
  { key: 'skills', label: 'Skills', icon: '🎯', count: 24 },
  { key: 'endorsements', label: 'Endorsements', icon: '👍', count: 12 },
  { key: 'gap', label: 'Gap Analysis', icon: '📈' },
  { key: 'widget', label: 'Widget & Export', icon: '🔗' },
] as const

// Error Messages
export const ERROR_MESSAGES = {
  AUTH_FAILED: 'Authentication failed. Please try again.',
  AUTH_CANCELLED: 'Authentication was cancelled.',
  LOGIN_ERROR: 'Unable to log in. Please check your credentials.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  INVALID_INPUT: 'Invalid input provided.',
} as const

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Successfully logged in!',
  LOGOUT_SUCCESS: 'Successfully logged out.',
  PROFILE_UPDATED: 'Profile updated successfully.',
  EXPORT_SUCCESS: 'Portfolio exported successfully.',
  ENDORSEMENT_SENT: 'Endorsement request sent.',
} as const

// Validation Rules
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_BIO_LENGTH: 500,
  MAX_NAME_LENGTH: 100,
  DEBOUNCE_DELAY: 300,
} as const

// Animation Durations (ms)
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  AUTH_CALLBACK: '/auth/callback',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  NOT_FOUND: '/404',
} as const

// Local Storage Keys
export const LOCAL_STORAGE = {
  AUTH_TOKEN: 'auth_token',
  USER_PREFERENCES: 'user_preferences',
  CACHED_PROFILE: 'cached_profile',
  THEME_PREFERENCE: 'theme_preference',
} as const

// API Endpoints - Centralized
export { API_ENDPOINTS, BASE_URL } from './api-endpoints'
