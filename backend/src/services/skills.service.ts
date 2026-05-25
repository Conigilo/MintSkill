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
 * Update user's aggregate skill stats in the users collection
 */
export async function updateUserSkillStats(uid: string) {
    const skillsSnap = await db.collection(Collections.SKILLS)
        .where('userId', '==', uid)
        .get()
    
    const verifiedSkills = skillsSnap.docs.filter(doc => doc.data().verified).length
    const totalSkills = skillsSnap.size

    await db.collection(Collections.USERS).doc(uid).update({
        'stats.skillCount': totalSkills,
        'stats.verifiedSkills': verifiedSkills,
        'updatedAt': new Date()
    })
}

/**
 * Add a new skill for the user
 */
export async function addSkill(
    uid: string,
    data: { name: string; category: string; level: number }
) {
    const { name, category, level } = data

    // Count actual verified endorsements for this specific skill and user
    const skillEndorsementsSnap = await db.collection(Collections.ENDORSEMENTS)
        .where('toUserId', '==', uid)
        .where('status', '==', 'verified')
        .where('skills', 'array-contains', name)
        .get()

    const endorsementCount = skillEndorsementsSnap.size
    const endorsementScore = Math.min(endorsementCount * 3, 6)

    const skillData = {
        userId: uid,
        name,
        category,
        level: Math.min(5, Math.max(0, level || 0)),
        endorsementCount,
        endorsementScore,
        fromGitHub: false,
        createdAt: new Date(),
        updatedAt: new Date(),
    }

    const result = await db.collection(Collections.SKILLS).add(skillData)

    // Update user's skill count
    await updateUserSkillStats(uid)

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

    // Update user's skill stats
    await updateUserSkillStats(uid)

    return { ok: true }
}

/**
 * Submit quiz attempt for a skill
 * Returns object with ok flag, updates to 10-point scale
 */
export async function submitSkillQuizAttempt(uid: string, skillId: string, score: number) {
    const skillDoc = await db.collection(Collections.SKILLS).doc(skillId).get()

    if (!skillDoc.exists) {
        return { ok: false, status: 404, error: 'Skill not found' }
    }

    const skillData = skillDoc.data()
    
    if (skillData?.userId !== uid) {
        return { ok: false, status: 403, error: 'Not authorized to update this skill' }
    }

    const updateData: Record<string, any> = { updatedAt: new Date(), quizScore: score }
    const quizScore = score
    const endorsementScore = skillData?.endorsementScore || 0
    
    // Calculate Level Based on shared rules
    let newLevel = 0;
    if (endorsementScore >= 5 && quizScore >= 10) newLevel = 3;
    else if (endorsementScore >= 3 && quizScore >= 7) newLevel = 2;
    else if (endorsementScore >= 1 && quizScore >= 4) newLevel = 1;
    
    if (newLevel > 0) {
        updateData.level = newLevel;
        updateData.verified = true;
        
        //Update badge
        const badgeSnap = await db.collection(Collections.BADGES)
            .where('userId', '==', uid)
            .where('skillName', '==', skillData!.name)
            .limit(1)
            .get()

        if (badgeSnap.empty) {
            await db.collection(Collections.BADGES).add({
                userId: uid,
                skillName: skillData!.name,
                level: newLevel,
                name: `${skillData!.name} Certified Expert`,
                description: `Successfully verified by Endorsements and AI Quiz for ${skillData!.name}`,
                type: 'skill_verification',
                iconUrl: 'https://cdn-icons-png.flaticon.com/512/5968/5968863.png',
                unlockedAt: new Date(),
            })
        } else {
            // Update existing badge level if it increased
            const badgeDoc = badgeSnap.docs[0];
            if ((badgeDoc.data().level || 0) < newLevel) {
                await badgeDoc.ref.update({ level: newLevel, updatedAt: new Date() });
            }
        }
    }

    await skillDoc.ref.update(updateData)
    await updateUserSkillStats(uid)
    
    return { ok: true, updated: { ...skillData, ...updateData } }
}
