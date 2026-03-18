import { db, Collections } from './firebase.service'

/**
 * Retrieve all skills for a specific user
 */
export async function getSkillsByUser(userId: string) {
    const querySnapshot = await db.collection(Collections.SKILLS)
        .where('userId', '==', userId)
        .get()
    
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

/**
 * Add a new skill for the user
 */
export async function addSkill(
    uid: string,
    data: { name: string; category: string; level: number }
) {
    const { name, category, level } = data

    const skillData = {
        userId: uid,
        name,
        category,
        level: Math.min(5, Math.max(1, level || 1)),
        endorsementCount: 0,
        fromGitHub: false,
        createdAt: new Date(),
        updatedAt: new Date(),
    }

    const result = await db.collection(Collections.SKILLS).add(skillData)

    // Update user's skill count
    const userRef = db.collection(Collections.USERS).doc(uid)
    const userDoc = await userRef.get()
    
    if (userDoc.exists) {
        await userRef.update({
            'stats.skillCount': (userDoc.data()?.stats?.skillCount || 0) + 1,
        })
    }

    return { id: result.id, ...skillData }
}

/**
 * Update an existing skill
 * Returns object with ok flag and error details if authorization fails
 */
export async function updateSkill(
    uid: string,
    skillId: string,
    body: Record<string, any>
) {
    const skillDoc = await db.collection(Collections.SKILLS).doc(skillId).get()

    if (!skillDoc.exists) {
        return { ok: false, status: 404, error: 'Skill not found' }
    }

    const skillData = skillDoc.data()
    
    if (skillData?.userId !== uid) {
        return { ok: false, status: 403, error: 'Not authorized to update this skill' }
    }

    const updateData: Record<string, any> = { updatedAt: new Date() }
    
    if (body.name !== undefined) {
        updateData.name = body.name
    }
    
    if (body.category !== undefined) {
        updateData.category = body.category
    }
    
    if (body.level !== undefined) {
        updateData.level = Math.min(5, Math.max(1, body.level))
    }

    await skillDoc.ref.update(updateData)
    
    return { ok: true, updated: updateData }
}

/**
 * Delete a skill by ID
 * Returns object with ok flag and error details if authorization fails
 */
export async function deleteSkill(uid: string, skillId: string) {
    const skillDoc = await db.collection(Collections.SKILLS).doc(skillId).get()

    if (!skillDoc.exists) {
        return { ok: false, status: 404, error: 'Skill not found' }
    }

    const skillData = skillDoc.data()
    
    if (skillData?.userId !== uid) {
        return { ok: false, status: 403, error: 'Not authorized to delete this skill' }
    }

    await skillDoc.ref.delete()

    // Update user's skill count
    const userRef = db.collection(Collections.USERS).doc(uid)
    const userDoc = await userRef.get()
    
    if (userDoc.exists) {
        const newCount = Math.max(0, (userDoc.data()?.stats?.skillCount || 1) - 1)
        await userRef.update({ 'stats.skillCount': newCount })
    }

    return { ok: true }
}
