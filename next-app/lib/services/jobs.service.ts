/**
 * Jobs Service - Handles job recommendations and matching
 */

import { fetchAPI } from './api'
import type { ApiResponse } from '@/lib/types'

export interface JobPosting {
  id: string
  title: string
  company: string
  location: string
  salary?: string
  description?: string
  requiredSkills: string[]
  preferredSkills?: string[]
  matchScore?: number
  matchStatus?: 'Highly Recommended' | 'Good Match' | 'Skill Gap Detected'
  postedAt?: string
  link?: string
}

export const jobsService = {
  /**
   * Get skill-matched job recommendations
   */
  getJobRecommendations: async (
    filters?: {
      location?: string
      minMatchScore?: number
      skills?: string[]
      limit?: number
    }
  ): Promise<JobPosting[] | null> => {
    try {
      const params = new URLSearchParams()
      if (filters?.location) params.append('location', filters.location)
      if (filters?.minMatchScore) params.append('minMatchScore', filters.minMatchScore.toString())
      if (filters?.skills) filters.skills.forEach(s => params.append('skills', s))
      if (filters?.limit) params.append('limit', filters.limit.toString())

      const url = `/jobs/recommendations?${params.toString()}`
      const data = await fetchAPI(url)
      return data.data || []
    } catch (error) {
      console.error('Error fetching job recommendations:', error)
      return null
    }
  },

  /**
   * Get all available jobs
   */
  getAllJobs: async (
    filters?: {
      location?: string
      skills?: string[]
      limit?: number
      offset?: number
    }
  ): Promise<JobPosting[] | null> => {
    try {
      const params = new URLSearchParams()
      if (filters?.location) params.append('location', filters.location)
      if (filters?.skills) filters.skills.forEach(s => params.append('skills', s))
      if (filters?.limit) params.append('limit', filters.limit.toString())
      if (filters?.offset) params.append('offset', filters.offset.toString())

      const url = `/jobs?${params.toString()}`
      const data = await fetchAPI(url)
      return data.data || []
    } catch (error) {
      console.error('Error fetching jobs:', error)
      return null
    }
  },

  /**
   * Apply for a job
   */
  applyForJob: async (
    jobId: string,
    coverLetter?: string
  ): Promise<{ applied: boolean; applicationId?: string } | null> => {
    try {
      const data = await fetchAPI(`/jobs/${jobId}/apply`, {
        method: 'POST',
        body: JSON.stringify({ coverLetter }),
      })
      return data.data || null
    } catch (error) {
      console.error('Error applying for job:', error)
      return null
    }
  }
}
export const applyForJob = jobsService.applyForJob
