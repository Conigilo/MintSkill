import * as JobsService from '../services/jobs.service'
import { verifyToken } from '../middleware/auth.middleware'
import { validateRequiredString, validateNumberRange } from '../utils/validators'
import { AuthenticationError, NotFoundError } from '../utils/errors'

/**
 * Get all available jobs
 */
export async function getAllJobsHandler({ query, set }: any) {
    try {
        const limit = query.limit ? validateNumberRange(parseInt(query.limit), 'Limit', 1, 100) : 20
        
        const jobs = await JobsService.getAllJobs({
            location: query.location,
            limit
        })
        
        return { 
            success: true,
            data: jobs,
            meta: { count: jobs.length, limit }
        }
    } catch (error: any) {
        set.status = 500
        return { 
            success: false,
            error: error.message,
            code: 'INTERNAL_ERROR'
        }
    }
}

/**
 * Get job recommendations for authenticated user
 */
export async function getRecommendationsHandler({ headers, query, set }: any) {
    try {
        const decoded = await verifyToken(headers['authorization'] || null)
        const limit = query.limit ? validateNumberRange(parseInt(query.limit), 'Limit', 1, 50) : 20
        
        // In a real app, we'd fetch user skills here
        const jobs = await JobsService.getRecommendations([], limit)
        
        return { 
            success: true,
            data: jobs,
            meta: { count: jobs.length, userId: decoded.uid }
        }
    } catch (error: any) {
        set.status = 401
        return { 
            success: false,
            error: error.message,
            code: 'AUTH_ERROR'
        }
    }
}

/**
 * Get job detail by ID
 */
export async function getJobByIdHandler({ params, set }: any) {
    try {
        const jobId = validateRequiredString(params.id, 'Job ID')
        const job = await JobsService.getJobById(jobId)
        
        if (!job) {
            set.status = 404
            return { 
                success: false,
                error: 'Job not found',
                code: 'JOB_NOT_FOUND'
            }
        }
        
        return { 
            success: true,
            data: job 
        }
    } catch (error: any) {
        set.status = 500
        return { 
            success: false,
            error: error.message,
            code: 'INTERNAL_ERROR'
        }
    }
}

/**
 * Apply for a job
 */
export async function applyForJobHandler({ params, body, headers, set }: any) {
    try {
        const decoded = await verifyToken(headers['authorization'] || null)
        const jobId = validateRequiredString(params.id, 'Job ID')
        
        // Verify the job exists first
        const job = await JobsService.getJobById(jobId)
        if (!job) {
            set.status = 404
            return {
                success: false,
                error: 'Job not found',
                code: 'JOB_NOT_FOUND'
            }
        }

        // In a real app, save to a 'applications' collection in Firestore
        // For now, return a simulated success response
        return {
            success: true,
            data: {
                applied: true,
                applicationId: `app_${decoded.uid}_${jobId}_${Date.now()}`,
                jobId,
                userId: decoded.uid,
                appliedAt: new Date().toISOString(),
                coverLetter: body?.coverLetter || null,
            },
            message: 'Application submitted successfully'
        }
    } catch (error: any) {
        if (error.message?.includes('token') || error.message?.includes('auth')) {
            set.status = 401
            return { success: false, error: 'Authentication required', code: 'UNAUTHORIZED' }
        }
        set.status = 500
        return {
            success: false,
            error: error.message,
            code: 'INTERNAL_ERROR'
        }
    }
}
