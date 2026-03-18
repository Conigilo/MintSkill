import * as SkillsService from '../services/skills.service'
import { verifyToken } from '../middleware/auth.middleware'

/**
 * Get all skills for a user
 */
export async function getSkillsHandler({ params, set }: any) {
    try {
        const skills = await SkillsService.getSkillsByUser(params.userId)
        return { skills }
    } catch (error: any) {
        console.error('Skills fetch error:', error.message)
        set.status = 500
        return { error: error.message }
    }
}

/**
 * Add a new skill for authenticated user
 */
export async function addSkillHandler({ headers, body, set }: any) {
    try {
        const user = await verifyToken(headers['authorization'] || null)

        if (!body.name || !body.category) {
            set.status = 400
            return { error: 'name and category are required' }
        }

        const skill = await SkillsService.addSkill(user.uid, body)
        return skill
    } catch (error: any) {
        set.status = error.message.includes('invalid') || error.message.includes('Missing') ? 401 : 500
        return { error: error.message }
    }
}

/**
 * Update a skill
 */
export async function updateSkillHandler({ headers, params, body, set }: any) {
    try {
        const user = await verifyToken(headers['authorization'] || null)
        const result = await SkillsService.updateSkill(user.uid, params.skillId, body)

        if (!result.ok) {
            set.status = result.status || 500
            return { error: result.error }
        }

        return { success: true, updated: result.updated }
    } catch (error: any) {
        set.status = error.message.includes('invalid') || error.message.includes('Missing') ? 401 : 500
        return { error: error.message }
    }
}

/**
 * Delete a skill
 */
export async function deleteSkillHandler({ headers, params, set }: any) {
    try {
        const user = await verifyToken(headers['authorization'] || null)
        const result = await SkillsService.deleteSkill(user.uid, params.skillId)

        if (!result.ok) {
            set.status = result.status || 500
            return { error: result.error }
        }

        return { success: true }
    } catch (error: any) {
        set.status = error.message.includes('invalid') || error.message.includes('Missing') ? 401 : 500
        return { error: error.message }
    }
}
