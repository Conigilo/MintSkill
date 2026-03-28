/**
 * Skills Service - Handles skills API operations
 */

import { fetchAPI } from './api'

export interface Skill {
  id?: string
  name: string
  category: string
  level?: number
  endorsements?: number
  verified?: boolean
  createdAt?: string
}

export const skillsService = {
  /**
   * Fetch all skills for the current user
   */
  getMySkills: async (): Promise<Skill[] | null> => {
    try {
      const data = await fetchAPI('/skills/me')
      return data.skills || data.data || []
    } catch (error) {
      console.error('Error fetching my skills:', error)
      return null
    }
  },

  /**
   * Fetch all skills for a specific user ID
   */
  fetchUserSkills: async (userId: string): Promise<Skill[] | null> => {
    try {
      const data = await fetchAPI(`/skills/${userId}`)
      return data.skills || data.data || []
    } catch (error) {
      console.error('Error fetching skills:', error)
      return null
    }
  },

  /**
   * Add a new skill
   */
  addSkill: async (
    skillData: Omit<Skill, 'id' | 'createdAt'>
  ): Promise<Skill | null> => {
    try {
      const data = await fetchAPI('/skills', {
        method: 'POST',
        body: JSON.stringify(skillData),
      })
      return data.data || data
    } catch (error) {
      console.error('Error adding skill:', error)
      return null
    }
  },

  /**
   * Update an existing skill
   */
  updateSkill: async (
    skillId: string,
    updates: Partial<Omit<Skill, 'id' | 'createdAt'>>
  ): Promise<Skill | null> => {
    try {
      const data = await fetchAPI(`/skills/${skillId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      })
      return data.updated || data.data || data
    } catch (error) {
      console.error('Error updating skill:', error)
      return null
    }
  },

  /**
   * Delete a skill
   */
  deleteSkill: async (skillId: string): Promise<boolean> => {
    try {
      await fetchAPI(`/skills/${skillId}`, {
        method: 'DELETE',
      })
      return true
    } catch (error) {
      console.error('Error deleting skill:', error)
      return false
    }
  }
}

// Named exports for hooks to ensure compatibility with Next.js SSR
export async function fetchUserSkills(userId: string): Promise<Skill[] | null> {
  return skillsService.fetchUserSkills(userId);
}

// Alias for compatibility
export const skillService = skillsService;