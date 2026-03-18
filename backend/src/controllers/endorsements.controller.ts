import * as EndorsementsService from '../services/endorsements.service'
import { verifyToken } from '../middleware/auth.middleware'

/**
 * Get endorsements for authenticated user
 */
export async function getEndorsementsHandler({ headers, params, set }: any) {
    try {
        const user = await verifyToken(headers['authorization'] || null)

        // Users can only view their own endorsements
        if (user.uid !== params.userId) {
            set.status = 403
            return { error: 'Can only view your own endorsements' }
        }

        const endorsements = await EndorsementsService.getEndorsementsByUser(params.userId)
        return { endorsements }
    } catch (error: any) {
        set.status = 401
        return { error: error.message }
    }
}

/**
 * Request endorsement from another user
 */
export async function requestEndorsementHandler({ headers, body, set }: any) {
    try {
        const user = await verifyToken(headers['authorization'] || null)

        const result = await EndorsementsService.createEndorsementRequest(
            user.uid,
            body.recipientName,
            body.recipientEmail
        )

        return result
    } catch (error: any) {
        if (error.message === 'EMPTY_NAME') {
            set.status = 400
            return { error: 'recipientName is required' }
        }

        set.status = error.message.includes('invalid') || error.message.includes('Missing') ? 401 : 500
        return { error: error.message }
    }
}

/**
 * Verify endorsement token
 */
export async function verifyTokenHandler({ params, set }: any) {
    try {
        return await EndorsementsService.verifyEndorsementToken(params.token)
    } catch (error: any) {
        set.status = 500
        return { error: error.message }
    }
}

/**
 * Submit endorsement for a user
 */
export async function submitEndorsementHandler({ params, body, set }: any) {
    try {
        const result = await EndorsementsService.submitEndorsement(params.token, body)
        return result
    } catch (error: any) {
        if (error.message === 'MISSING_FIELDS') {
            set.status = 400
            return { error: 'message, skills, and fromName are required' }
        }

        if (error.message === 'INVALID_TOKEN') {
            set.status = 404
            return { error: 'Invalid or expired token' }
        }

        set.status = 500
        return { error: error.message }
    }
}
