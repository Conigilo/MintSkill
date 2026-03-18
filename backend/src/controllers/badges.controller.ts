import * as BadgesService from '../services/badges.service'

/**
 * Get all badges for a user
 */
export async function getBadgesHandler({ params, set }: any) {
    try {
        const badges = await BadgesService.getBadgesByUser(params.userId)
        return { badges }
    } catch (error: any) {
        console.error('Badges fetch error:', error.message)
        set.status = 500
        return { error: error.message }
    }
}
