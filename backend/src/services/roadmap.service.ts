import { db } from './firebase.service'

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
  createdAt: any
  updatedAt: any
}

const COLLECTION = 'roadmaps'

export const roadmapService = {
  /**
   * Save or create user roadmap in Firestore
   */
  saveRoadmap: async (
    userId: string,
    skillName: string,
    myLevel: number,
    targetLevel: number,
    rawWeeks: any[]
  ): Promise<UserRoadmap> => {
    const docId = `${userId}_${skillName.replace(/[^a-zA-Z0-9]/g, '_')}`
    
    // Transform simple tasks list from AI (strings) to objects with completed status
    const weeks: RoadmapWeek[] = rawWeeks.map((w: any) => ({
      week: Number(w.week),
      title: String(w.title),
      desc: String(w.desc),
      tasks: (w.tasks || []).map((t: string) => ({ text: t, completed: false })),
      resources: w.resources || []
    }))

    const roadmapData: UserRoadmap = {
      userId,
      skillName,
      myLevel,
      targetLevel,
      weeks,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    await db.collection(COLLECTION).doc(docId).set(roadmapData)
    return { id: docId, ...roadmapData }
  },

  /**
   * Fetch roadmap by userId and skillName
   */
  getRoadmap: async (userId: string, skillName: string): Promise<UserRoadmap | null> => {
    const docId = `${userId}_${skillName.replace(/[^a-zA-Z0-9]/g, '_')}`
    const doc = await db.collection(COLLECTION).doc(docId).get()
    
    if (!doc.exists) {
      return null
    }

    return { id: doc.id, ...doc.data() } as UserRoadmap
  },

  /**
   * Toggle task completion status
   */
  updateTaskStatus: async (
    userId: string,
    skillName: string,
    weekIndex: number,
    taskIndex: number,
    completed: boolean
  ): Promise<boolean> => {
    const docId = `${userId}_${skillName.replace(/[^a-zA-Z0-9]/g, '_')}`
    const docRef = db.collection(COLLECTION).doc(docId)
    const doc = await docRef.get()

    if (!doc.exists) {
      return false
    }

    const data = doc.data() as UserRoadmap
    if (!data.weeks || !data.weeks[weekIndex] || !data.weeks[weekIndex].tasks[taskIndex]) {
      return false
    }

    // Modify specific task status
    data.weeks[weekIndex].tasks[taskIndex].completed = completed
    data.updatedAt = new Date().toISOString()

    await docRef.update({
      weeks: data.weeks,
      updatedAt: data.updatedAt
    })

    return true
  }
}
