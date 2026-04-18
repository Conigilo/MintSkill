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

const MOCK_DEVELOPERS: Developer[] = [
  {
    id: "dev-001",
    displayName: "Alice Developer",
    username: "alice_dev",
    title: "Senior Full-Stack Engineer",
    bio: "Passionate about building scalable web apps with React and Node.",
    matchScore: 92,
    topSkills: [
      { name: "React", level: 5, verified: true },
      { name: "TypeScript", level: 4, verified: true },
      { name: "Node.js", level: 4, verified: false }
    ],
    endorsements: 12
  },
  {
    id: "dev-002",
    displayName: "Bob Smith",
    username: "bob_coder",
    title: "Frontend Developer",
    bio: "UI/UX enthusiast. Love TailwindCSS and animations.",
    matchScore: 85,
    topSkills: [
      { name: "Vue.js", level: 4, verified: true },
      { name: "CSS", level: 5, verified: true },
      { name: "Figma", level: 3, verified: false }
    ],
    endorsements: 8
  },
  {
    id: "dev-003",
    displayName: "Charlie Engineer",
    username: "charlie_be",
    title: "Backend System Architect",
    bio: "Go and Rust advocate. Databases make me happy.",
    matchScore: 68,
    topSkills: [
      { name: "Go", level: 5, verified: true },
      { name: "PostgreSQL", level: 4, verified: true },
      { name: "Docker", level: 4, verified: true }
    ],
    endorsements: 15
  },
  {
    id: "dev-004",
    displayName: "Diana ML",
    username: "diana_data",
    title: "Data Scientist / AI Engineer",
    bio: "Python, ML models, and Data Visualization workflows.",
    matchScore: 45,
    topSkills: [
      { name: "Python", level: 5, verified: true },
      { name: "Machine Learning", level: 4, verified: true },
      { name: "SQL", level: 3, verified: false }
    ],
    endorsements: 5
  },
  {
    id: "dev-005",
    displayName: "Nadech Kugimiya",
    username: "nadech",
    title: "Software Engineer",
    bio: "Building cool stuff for the final project.",
    matchScore: 99,
    topSkills: [
      { name: "Next.js", level: 5, verified: true },
      { name: "Bun", level: 4, verified: true },
      { name: "TailwindCSS", level: 5, verified: true }
    ],
    endorsements: 20
  }
];

export const developersService = {
  /**
   * Search for developers with skill matching (Mock Functional Implementation)
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
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 600));

      let results = [...MOCK_DEVELOPERS];

      if (query) {
        const q = query.toLowerCase();
        results = results.filter(dev => 
          (dev.displayName && dev.displayName.toLowerCase().includes(q)) ||
          (dev.title && dev.title.toLowerCase().includes(q)) ||
          (dev.skills && dev.skills.some(s => s.toLowerCase().includes(q))) ||
          (dev.topSkills && dev.topSkills.some(s => s.name.toLowerCase().includes(q)))
        );
      }

      if (filters?.limit) {
        results = results.slice(0, filters.limit);
      }

      return results;
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
