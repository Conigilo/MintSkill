import * as GitHubService from '../services/github.service'
import { verifyToken } from '../middleware/auth.middleware'
import { validateRequiredString } from '../utils/validators'
import { ValidationError } from '../utils/errors'

/**
 * Connect GitHub account by saving access token authenticated from frontend
 */
export async function connectGitHubHandler({ headers, body, set }: any) {
    try {
        const decoded = await verifyToken(headers['authorization'] || null)
        const token = validateRequiredString(body.token, 'GitHub token')
        
        await GitHubService.saveGitHubToken(decoded.uid, token)
        
        return { 
            success: true,
            data: { message: 'GitHub account connected successfully' }
        }
    } catch (error: any) {
        if (error instanceof ValidationError) {
            set.status = 400
            return { 
                success: false,
                error: error.message,
                code: error.code
            }
        }
        set.status = 401
        return { 
            success: false,
            error: error.message,
            code: 'AUTH_ERROR'
        }
    }
}

/**
 * Sync GitHub data for authenticated user
 * Fetches latest repositories and contribution data
 */
export async function syncGitHubHandler({ headers, set }: any) {
    try {
        const decoded = await verifyToken(headers['authorization'] || null)
        const result = await GitHubService.syncGitHub(decoded.uid)

        return { 
            success: true,
            data: result 
        }
    } catch (error: any) {
        if (error.message === 'GitHub not connected') {
            set.status = 400
            return { 
                success: false,
                error: error.message,
                code: 'GITHUB_NOT_CONNECTED'
            }
        }
        if (error.message.includes('401') || error.message.includes('403')) {
            set.status = 401
            return { 
                success: false,
                error: 'GitHub token expired or invalid. Please re-connect your account.',
                code: 'GITHUB_AUTH_FAILED'
            }
        }
        set.status = 500
        return { 
            success: false,
            error: error.message,
            code: 'API_ERROR'
        }
    }
}

/**
 * Get all GitHub repositories for authenticated user
 */
export async function getReposHandler({ headers, set }: any) {
    try {
        const decoded = await verifyToken(headers['authorization'] || null)
        const repos = await GitHubService.getRepos(decoded.uid)

        return { 
            success: true,
            data: repos,
            meta: { count: repos.length }
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
 * Get GitHub dashboard data for authenticated user
 * Includes stats, activity, and contribution summary
 */
export async function getDashboardHandler({ headers, set }: any) {
    try {
        const decoded = await verifyToken(headers['authorization'] || null)
        const dashboard = await GitHubService.getDashboard(decoded.uid)

        return { 
            success: true,
            data: dashboard 
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
 * Toggle spotlight status for a repository
 */
export async function toggleRepoSpotlightHandler({ headers, params, set }: any) {
    try {
        const decoded = await verifyToken(headers['authorization'] || null)
        const repoDocId = validateRequiredString(params.repoDocId, 'Repository Document ID')
        
        const result = await GitHubService.toggleRepoSpotlight(decoded.uid, repoDocId)

        return { 
            success: true,
            data: result 
        }
    } catch (error: any) {
        if (error instanceof ValidationError) {
            set.status = 400
            return { success: false, error: error.message, code: error.code }
        }
        if (error.message === 'Repository not found' || error.message === 'Unauthorized') {
            set.status = error.message === 'Unauthorized' ? 403 : 404
            return { success: false, error: error.message }
        }
        set.status = 401
        return { 
            success: false,
            error: error.message,
            code: 'AUTH_ERROR'
        }
    }
}