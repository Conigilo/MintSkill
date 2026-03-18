import * as UsersService from '../services/users.service'
import { verifyToken } from '../middleware/auth.middleware'

/**
 * Get authenticated user's profile
 */
export async function getMyProfileHandler({ headers, set }: any) {
    try {
        const decoded = await verifyToken(headers['authorization'] || null)
        const profile = await UsersService.getMyProfile(decoded.uid)

        if (!profile) {
            set.status = 404
            return { error: 'User not found' }
        }

        return { user: profile }
    } catch (error: any) {
        set.status = 401
        return { error: error.message }
    }
}

/**
 * Update authenticated user's profile
 */
export async function updateMyProfileHandler({ headers, body, set }: any) {
    try {
        const decoded = await verifyToken(headers['authorization'] || null)
        const updated = await UsersService.updateMyProfile(decoded.uid, body)

        return { success: true, updated }
    } catch (error: any) {
        set.status = error.message.includes('Missing') || error.message.includes('invalid') ? 401 : 500
        return { error: error.message }
    }
}

/**
 * Get public profile for a user by username
 */
export async function getPublicProfileHandler({ params, set }: any) {
    try {
        const profile = await UsersService.getPublicProfile(params.username)

        if (!profile) {
            set.status = 404
            return { error: 'User not found' }
        }

        return { user: profile }
    } catch (error: any) {
        set.status = 500
        return { error: error.message }
    }
}

/**
 * Get complete portfolio for resume/CV generation
 */
export async function getPortfolioHandler({ params, set }: any) {
    try {
        const portfolio = await UsersService.getPortfolio(params.username)

        if (!portfolio) {
            set.status = 404
            return { error: 'User not found' }
        }

        return portfolio
    } catch (error: any) {
        set.status = 500
        return { error: error.message }
    }
}
