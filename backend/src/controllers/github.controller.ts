import * as GitHubService from '../services/github.service'
import { verifyToken } from '../middleware/auth.middleware'

/**
 * Sync GitHub data for authenticated user
 * Fetches latest repositories and contribution data
 */
export async function syncGitHubHandler({ headers, set }: any) {
    try {
        const decoded = await verifyToken(headers['authorization'] || null)
        const result = await GitHubService.syncGitHub(decoded.uid)

        return result
    } catch (error: any) {
        set.status = error.message === 'GitHub not connected' ? 400 : 401
        return { error: error.message }
    }
}

/**
 * Get all GitHub repositories for authenticated user
 */
export async function getReposHandler({ headers, set }: any) {
    try {
        const decoded = await verifyToken(headers['authorization'] || null)
        const repos = await GitHubService.getRepos(decoded.uid)

        return { repos }
    } catch (error: any) {
        set.status = 401
        return { error: error.message }
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

        return dashboard
    } catch (error: any) {
        set.status = 401
        return { error: error.message }
    }
}