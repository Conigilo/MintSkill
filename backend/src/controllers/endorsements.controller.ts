import * as EndorsementsService from '../services/endorsements.service'
import { verifyToken } from '../middleware/auth.middleware'
import { validateEndorsementInput, validateRequiredString } from '../utils/validators'
import { AuthenticationError, AuthorizationError, NotFoundError, ValidationError } from '../utils/errors'

/**
 * Get endorsements for authenticated user
 */
export async function getEndorsementsHandler({ headers, params, set }: any) {
    try {
        const user = await verifyToken(headers['authorization'] || null)
        const userId = validateRequiredString(params.userId, 'User ID')

        // Users can only view their own endorsements
        if (user.uid !== userId) {
            set.status = 403
            return { 
                success: false,
                error: 'Can only view your own endorsements',
                code: 'FORBIDDEN'
            }
        }

        const endorsements = await EndorsementsService.getEndorsementsByUser(userId)
        return { 
            success: true,
            data: endorsements,
            meta: { count: endorsements.length }
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
 * Get endorsements SENT by authenticated user
 */
export async function getSentEndorsementsHandler({ headers, params, set }: any) {
    try {
        const user = await verifyToken(headers['authorization'] || null)
        const userId = validateRequiredString(params.userId, 'User ID')

        // Users can only view their own sent endorsements
        if (user.uid !== userId) {
            set.status = 403
            return { 
                success: false,
                error: 'Can only view your own sent endorsements',
                code: 'FORBIDDEN'
            }
        }

        const endorsements = await EndorsementsService.getSentEndorsementsByUser(userId)
        return { 
            success: true,
            data: endorsements,
            meta: { count: endorsements.length }
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
 * Request endorsement from another user
 */
export async function requestEndorsementHandler({ headers, body, set }: any) {
    try {
        const user = await verifyToken(headers['authorization'] || null)
        const recipientName = validateRequiredString(body.recipientName, 'Recipient name')
        const recipientEmail = validateRequiredString(body.recipientEmail, 'Recipient email')
        const message = body.message || ''

        const result = await EndorsementsService.createEndorsementRequest(
            user.uid,
            recipientName,
            recipientEmail,
            { message }
        )

        set.status = 201
        return { 
            success: true,
            data: result 
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
 * Verify endorsement token
 */
export async function verifyTokenHandler({ params, set }: any) {
    try {
        const token = validateRequiredString(params.token, 'Token')
        const result = await EndorsementsService.verifyEndorsementToken(token)
        
        return { 
            success: true,
            data: result 
        }
    } catch (error: any) {
        if (error.message === 'INVALID_TOKEN' || error instanceof NotFoundError) {
            set.status = 404
            return { 
                success: false,
                error: 'Invalid or expired token',
                code: 'INVALID_TOKEN'
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
 * Submit endorsement for a user
 */
export async function submitEndorsementHandler({ params, body, set }: any) {
    try {
        const token = validateRequiredString(params.token, 'Token')
        const validatedInput = validateEndorsementInput(body)

        const result = await EndorsementsService.submitEndorsement(token, validatedInput)
        
        set.status = 201
        return { 
            success: true,
            data: result 
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
        if (error.message === 'INVALID_TOKEN') {
            set.status = 404
            return { 
                success: false,
                error: 'Invalid or expired token',
                code: 'INVALID_TOKEN'
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
 * Direct endorsement: authenticated user endorses another user immediately
 */
export async function directEndorseHandler({ headers, body, set }: any) {
    try {
        const user = await verifyToken(headers['authorization'] || null)
        const result = await EndorsementsService.directEndorse(user.uid, body)

        set.status = 201
        return { success: true, data: result }
    } catch (error: any) {
        if (error.message === 'MISSING_FIELDS') {
            set.status = 400
            return { success: false, error: 'toUserId, skills (array), and message are required', code: 'VALIDATION_ERROR' }
        }
        if (error.message === 'CANNOT_ENDORSE_SELF') {
            set.status = 400
            return { success: false, error: 'You cannot endorse yourself', code: 'CANNOT_ENDORSE_SELF' }
        }
        if (error.message === 'ALREADY_ENDORSED') {
            set.status = 409
            return { success: false, error: 'You have already endorsed this user', code: 'ALREADY_ENDORSED' }
        }
        if (error instanceof AuthenticationError) {
            set.status = 401
            return { success: false, error: error.message, code: 'UNAUTHORIZED' }
        }
        set.status = 500
        return { success: false, error: error.message, code: 'INTERNAL_ERROR' }
    }
}
