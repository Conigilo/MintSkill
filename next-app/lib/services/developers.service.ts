/**
 * Developers Service - Handles developers discovery and profiles
 */

import { fetchAPI } from './api'
import type { UserProfile } from '@/lib/types'

export interface Developer extends Omit<UserProfile, 'endorsements'> {
  matchScore?: number
  topSkills?: Array<{ name: string; level: number; verified: boolean }>
  endorsements?: number
}

export const developersService = {
  /**
   * Search for developers with skill matching
   */
  searchDevelopers: async (
    query?: string,
    filters?: {
      skills?: string[]
      minEndorsements?: number
      limit?: number
      offset?: number
    }
  ): Promise<Developer[] | null> => {
    try {
      const params = new URLSearchParams()
      if (query) params.append('q', query)
      if (filters?.skills) filters.skills.forEach(s => params.append('skills', s))
      if (filters?.minEndorsements) params.append('minEndorsements', filters.minEndorsements.toString())
      if (filters?.limit) params.append('limit', filters.limit.toString())
      if (filters?.offset) params.append('offset', filters.offset.toString())

      const url = `/users/search?${params.toString()}`
      const data = await fetchAPI(url)
      return data.data || []
    } catch (error) {
      console.error('Error searching developers:', error)
      return null
    }
  },

  /**
   * Get public profile of a developer
   */
  getDeveloperProfile: async (username: string): Promise<Developer | null> => {
    try {
      const data = await fetchAPI(`/users/${username}`)
      return data.data || null
    } catch (error) {
      console.error('Error fetching developer profile:', error)
      return null
    }
  },

  /**
   * Get developer portfolio (complete CV/Resume data)
   */
  getDeveloperPortfolio: async (username: string): Promise<Record<string, unknown> | null> => {
    try {
      const data = await fetchAPI(`/users/${username}/portfolio`)
      return data.data || null
    } catch (error) {
      console.error('Error fetching developer portfolio:', error)
      return null
    }
  },

  /**
   * Get recommended developers based on current user's skills
   */
  getRecommendedDevelopers: async (limit = 10): Promise<Developer[] | null> => {
    try {
      const data = await fetchAPI(`/users/recommendations?limit=${limit}`)
      return data.data || []
    } catch (error) {
      console.error('Error fetching recommended developers:', error)
      return null
    }
  }
}
