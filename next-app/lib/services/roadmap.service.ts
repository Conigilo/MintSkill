import { fetchAPI } from './api'

export interface RoadmapTask {
  text: string
  completed: boolean
}

export interface RoadmapWeek {
  week: number
  title: string
  desc: string
  tasks: RoadmapTask[]
  resources: string[]
}

export interface UserRoadmap {
  id?: string
  userId: string
  skillName: string
  myLevel: number
  targetLevel: number
  weeks: RoadmapWeek[]
  createdAt: string
  updatedAt: string
}

export const roadmapService = {
  /**
   * Request AI service to generate a 4-week learning roadmap
   */
  generateRoadmap: async (
    skillName: string,
    myLevel: number,
    targetLevel: number
  ): Promise<{ success: boolean; data: UserRoadmap; message?: string }> => {
    return await fetchAPI('/ai/roadmap', {
      method: 'POST',
      body: JSON.stringify({ skillName, myLevel, targetLevel })
    })
  },

  /**
   * Get saved roadmap from Firestore
   */
  getRoadmap: async (
    skillName: string
  ): Promise<{ success: boolean; data: UserRoadmap }> => {
    return await fetchAPI(`/ai/roadmap/${encodeURIComponent(skillName)}`, {
      method: 'GET'
    })
  },

  /**
   * Update specific task completion status in Firestore
   */
  updateTaskStatus: async (
    skillName: string,
    weekIndex: number,
    taskIndex: number,
    completed: boolean
  ): Promise<{ success: boolean; message: string }> => {
    return await fetchAPI(`/ai/roadmap/${encodeURIComponent(skillName)}/task`, {
      method: 'PATCH',
      body: JSON.stringify({ weekIndex, taskIndex, completed })
    })
  }
}
