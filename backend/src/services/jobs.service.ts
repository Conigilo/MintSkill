import { db, Collections } from './firebase.service'

export interface Job {
    id?: string
    title: string
    company: string
    location: string
    salary?: string
    description: string
    requiredSkills: string[]
    postedAt: Date
}

/**
 * Get all available jobs with optional filters
 */
export async function getAllJobs(filters?: any) {
    let jobsQuery: any = db.collection(Collections.JOBS)

    if (filters?.location) {
        jobsQuery = jobsQuery.where('location', '==', filters.location)
    }

    const snapshot = await jobsQuery.orderBy('postedAt', 'desc').limit(filters?.limit || 20).get()
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
}

/**
 * Get recommended jobs based on matching skills
 */
export async function getRecommendations(userSkills: string[], limit = 5) {
    if (userSkills.length === 0) {
        return await getAllJobs({ limit })
    }

    // Firestore doesn't support 'array-contains-any' with more than 10 items
    // So we pick the first 10 skills or just filter in-memory for simplicity in this MVP
    const snapshot = await db.collection(Collections.JOBS)
        .where('requiredSkills', 'array-contains-any', userSkills.slice(0, 10))
        .limit(limit)
        .get()

    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
}

/**
 * Get job details by ID
 */
export async function getJobById(jobId: string) {
    const doc = await db.collection(Collections.JOBS).doc(jobId).get()
    if (!doc.exists) return null
    return { id: doc.id, ...doc.data() }
}
