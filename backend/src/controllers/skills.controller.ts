import * as SkillsService from '../services/skills.service'
import { verifyToken } from '../middleware/auth.middleware'
import { validateSkillInput, validateRequiredString } from '../utils/validators'
import { AppError, AuthenticationError, NotFoundError, ValidationError } from '../utils/errors'

/**
 * Get all skills for a user
 */
export async function getSkillsHandler({ params, set }: any) {
    try {
        const skills = await SkillsService.getSkillsByUser(params.userId)
        return { 
            success: true,
            data: skills 
        }
    } catch (error: any) {
        console.error('Skills fetch error:', error.message)
        set.status = 500
        return { 
            success: false,
            error: error.message,
            code: 'INTERNAL_ERROR'
        }
    }
}

/**
 * Get all skills for the authenticated user
 */
export async function getMySkillsHandler({ headers, set }: any) {
    try {
        const user = await verifyToken(headers['authorization'] || null)
        const skills = await SkillsService.getSkillsByUser(user.uid)
        return { 
            success: true,
            data: skills 
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
 * Add a new skill for authenticated user
 */
export async function addSkillHandler({ headers, body, set }: any) {
    try {
        const user = await verifyToken(headers['authorization'] || null)
        const validatedInput = validateSkillInput(body)

        const skill = await SkillsService.addSkill(user.uid, validatedInput)
        set.status = 201
        return { 
            success: true,
            data: skill 
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
 * Update a skill
 */
export async function updateSkillHandler({ headers, params, body, set }: any) {
    try {
        const user = await verifyToken(headers['authorization'] || null)
        const skillId = validateRequiredString(params.skillId, 'Skill ID')
        const validatedInput = validateSkillInput(body)

        const result = await SkillsService.updateSkill(user.uid, skillId, validatedInput)

        if (!result.ok) {
            set.status = result.status || 500
            return { 
                success: false,
                error: result.error,
                code: 'UPDATE_FAILED'
            }
        }

        return { 
            success: true,
            data: result.updated 
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
 * Delete a skill
 */
export async function deleteSkillHandler({ headers, params, set }: any) {
    try {
        const user = await verifyToken(headers['authorization'] || null)
        const skillId = validateRequiredString(params.skillId, 'Skill ID')
        const result = await SkillsService.deleteSkill(user.uid, skillId)

        if (!result.ok) {
            set.status = result.status || 500
            return { 
                success: false,
                error: result.error,
                code: 'DELETE_FAILED'
            }
        }

        return { 
            success: true,
            data: { deleted: true }
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
