import * as UsersService from '../services/users.service'
import { verifyToken } from '../middleware/auth.middleware'
import { validateProfileUpdateInput, validateRequiredString } from '../utils/validators'
import { AuthenticationError, NotFoundError, ValidationError } from '../utils/errors'

/**
 * Get authenticated user's profile
 */
export async function getMyProfileHandler({ headers, set }: any) {
    try {
        const decoded = await verifyToken(headers['authorization'] || null)
        const profile = await UsersService.getMyProfile(decoded.uid)

        if (!profile) {
            set.status = 404
            return { 
                success: false,
                error: 'User not found',
                code: 'USER_NOT_FOUND'
            }
        }

        return { 
            success: true,
            data: profile 
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
 * Sync user profile from Firebase auth data
 */
export async function syncProfileHandler({ headers, body, set }: any) {
    try {
        const decoded = await verifyToken(headers['authorization'] || null)
        const profile = await UsersService.syncProfile(decoded.uid, body)

        return { 
            success: true,
            data: profile 
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
 * Update authenticated user's profile
 */
export async function updateMyProfileHandler({ headers, body, set }: any) {
    try {
        const decoded = await verifyToken(headers['authorization'] || null)
        const validatedInput = validateProfileUpdateInput(body)
        const updated = await UsersService.updateMyProfile(decoded.uid, validatedInput)

        return { 
            success: true,
            data: updated 
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
        if (error instanceof AuthenticationError) {
            set.status = 401
            return { 
                success: false,
                error: error.message,
                code: error.code
            }
        }
        set.status = 500
        return { 
            success: false,
            error: error.message,
            code: 'INTERNAL_ERROR'
        }
    }
}

/**
 * Get public profile for a user by username
 */
export async function getPublicProfileHandler({ params, set }: any) {
    try {
        const username = validateRequiredString(params.username, 'Username')
        const profile = await UsersService.getPublicProfile(username)

        if (!profile) {
            set.status = 404
            return { 
                success: false,
                error: 'User not found',
                code: 'USER_NOT_FOUND'
            }
        }

        return { 
            success: true,
            data: profile 
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
        set.status = 500
        return { 
            success: false,
            error: error.message,
            code: 'INTERNAL_ERROR'
        }
    }
}

/**
 * Get complete portfolio for resume/CV generation
 */
export async function getPortfolioHandler({ params, set }: any) {
    try {
        const username = validateRequiredString(params.username, 'Username')
        const portfolio = await UsersService.getPortfolio(username)

        if (!portfolio) {
            set.status = 404
            return { 
                success: false,
                error: 'User not found',
                code: 'USER_NOT_FOUND'
            }
        }

        return { 
            success: true,
            data: portfolio 
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
        set.status = 500
        return { 
            success: false,
            error: error.message,
            code: 'INTERNAL_ERROR'
        }
    }
}

/**
 * Search for users by criteria
 */
export async function searchUsersHandler({ query, set }: any) {
    try {
        const q = validateRequiredString(query.q || '', 'Search query')
        const limit = query.limit ? parseInt(query.limit) : 20
        
        const users = await UsersService.searchUsers(q, {
            location: query.location,
            limit
        })
        
        return { 
            success: true,
            data: users,
            meta: { count: users.length }
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
        set.status = 500
        return { 
            success: false,
            error: error.message,
            code: 'INTERNAL_ERROR'
        }
    }
}

/**
 * Get recommended developers for discovery
 */
export async function getRecommendationsHandler({ query, set }: any) {
    try {
        const limit = query.limit ? parseInt(query.limit) : 10
        const users = await UsersService.getRecommendations(limit)
        
        return { 
            success: true,
            data: users,
            meta: { count: users.length }
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
