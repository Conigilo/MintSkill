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
    const snapshot = await db.collection(Collections.JOBS)
        .where('requiredSkills', 'array-contains-any', userSkills.slice(0, 10))
        .limit(limit)
        .get()

    const recommended = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
    
    // Fallback if no specific matches found
    if (recommended.length === 0) {
        return await getAllJobs({ limit })
    }
    
    return recommended;
}

/**
 * Get job details by ID
 */
export async function getJobById(jobId: string) {
    const doc = await db.collection(Collections.JOBS).doc(jobId).get()
    if (!doc.exists) return null
    return { id: doc.id, ...doc.data() }
}
