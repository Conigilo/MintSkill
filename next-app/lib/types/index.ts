/**
 * Centralized type definitions for the application
 */

// Auth Types
export interface AuthUser {
  id: string
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  screenName?: string
  githubToken?: string
}

export interface AuthState {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
}

export type AuthProvider = 'github' | 'google'

// Skills & Endorsements
export interface Skill {
  id: string
  name: string
  category: SkillCategory
  proficiency: ProficiencyLevel
  endorsements: number
  endorsedBy: string[]
  yearsOfExperience?: number
}

export type SkillCategory = 'frontend' | 'backend' | 'devops' | 'design' | 'soft-skills' | 'other'
export type ProficiencyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'

export interface Endorsement {
  id: string
  skillId: string
  from: string
  message?: string
  timestamp: number
}

// Profile
export interface UserProfile {
  id: string
  name: string
  handle: string
  email: string
  photoURL: string
  bio: string
  title: string
  location: string
  links: {
    github?: string
    linkedin?: string
    portfolio?: string
    twitter?: string
  }
  skills: Skill[]
  endorsements: Endorsement[]
  stats: {
    skillCount: number
    endorsementCount: number
    portfolioExports: number
  }
}

// GitHub Stats
export interface GitHubStats {
  repositories: number
  contributions: number
  stars: number
  pullRequests: number
  followers: number
  following: number
}

// UI Component Props
export interface TabConfig {
  key: string
  label: string
  count?: number
  icon?: React.ReactNode
}

export type TabKey = 'overview' | 'skills' | 'endorsements' | 'gap' | 'widget'

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ApiError {
  code: string
  message: string
  status: number
  details?: Record<string, unknown>
}

// Modal/Notification Types
export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  message: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

// Export Types
export interface ExportFormat {
  format: 'pdf' | 'json' | 'md'
  name: string
  icon: string
}

// Filter & Sort Types
export interface FilterOptions {
  category?: SkillCategory
  proficiency?: ProficiencyLevel
  searchQuery?: string
}

export interface SortOptions {
  field: 'name' | 'endorsements' | 'proficiency'
  order: 'asc' | 'desc'
}
