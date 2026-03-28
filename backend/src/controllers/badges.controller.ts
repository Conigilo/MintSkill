import * as BadgesService from '../services/badges.service'
import { validateRequiredString } from '../utils/validators'

/**
 * Get all badges for a user
 */
export async function getBadgesHandler({ params, set }: any) {
    try {
        const userId = validateRequiredString(params.userId, 'User ID')
        const badges = await BadgesService.getBadgesByUser(userId)
        
        return { 
            success: true,
            data: badges,
            meta: { count: badges.length }
        }
    } catch (error: any) {
        console.error('Badges fetch error:', error.message)
        set.status = 500
        return { 
            success: false,
            error: error.message,
            code: 'INTERNAL_ERROR'
        }
    }
}
