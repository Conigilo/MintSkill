import { db, Collections } from './firebase.service'
import { randomBytes } from 'crypto'

/**
 * Get all endorsements received by a user
 */
export async function getEndorsementsByUser(userId: string) {
    const querySnapshot = await db.collection(Collections.ENDORSEMENTS)
        .where('toUserId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get()

    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        token: undefined, // Don't expose token
    }))
}

/**
 * Create an endorsement request for a user
 * Generates a unique token and creates pending endorsement
 */
export async function createEndorsementRequest(
    uid: string,
    recipientName: string,
    recipientEmail?: string
) {
    if (!recipientName) {
        throw new Error('EMPTY_NAME')
    }

    // Generate unique token for endorsement link
    const token = randomBytes(32).toString('hex')

    await db.collection(Collections.ENDORSEMENTS).add({
        toUserId: uid,
        fromUserId: null,
        fromName: recipientName,
        fromRole: '',
        fromAvatarUrl: '',
        message: '',
        skills: [],
        status: 'pending',
        token,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    })

    // TODO: Send email with endorsement link
    const endorseLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/endorse/${token}`

    return { success: true, link: endorseLink }
}

/**
 * Verify endorsement token and get target user info
 */
export async function verifyEndorsementToken(token: string) {
    const endorsementSnapshot = await db.collection(Collections.ENDORSEMENTS)
        .where('token', '==', token)
        .where('status', '==', 'pending')
        .limit(1)
        .get()

    if (endorsementSnapshot.empty) {
        return { valid: false }
    }

    const endorsementDoc = endorsementSnapshot.docs[0]
    const endorsementData = endorsementDoc.data()

    // Check if token has expired
    if (endorsementData.expiresAt && new Date(endorsementData.expiresAt.toDate ? endorsementData.expiresAt.toDate() : endorsementData.expiresAt) < new Date()) {
        return { valid: false }
    }

    // Get target user information
    const userDoc = await db.collection(Collections.USERS)
        .doc(endorsementData.toUserId)
        .get()

    const userData = userDoc.data()

    // Get available skills for the target user
    const skillsSnapshot = await db.collection(Collections.SKILLS)
        .where('userId', '==', endorsementData.toUserId)
        .get()

    const skills = skillsSnapshot.docs.map(doc => doc.data().name)

    return {
        valid: true,
        toUser: {
            displayName: userData?.displayName,
            avatarUrl: userData?.avatarUrl,
            username: userData?.username,
        },
        availableSkills: skills,
    }
}

/**
 * Submit endorsement and auto-mint badge if earned
 */
export async function submitEndorsement(token: string, body: any) {
    const { message, skills, fromName, fromRole, fromAvatarUrl } = body

    // Validate required fields
    if (!message || !skills?.length || !fromName) {
        throw new Error('MISSING_FIELDS')
    }

    // Find pending endorsement by token
    const endorsementSnapshot = await db.collection(Collections.ENDORSEMENTS)
        .where('token', '==', token)
        .where('status', '==', 'pending')
        .limit(1)
        .get()

    if (endorsementSnapshot.empty) {
        throw new Error('INVALID_TOKEN')
    }

    const endorsementDoc = endorsementSnapshot.docs[0]

    // Update endorsement with submission details
    await endorsementDoc.ref.update({
        fromName,
        fromRole: fromRole || '',
        fromAvatarUrl: fromAvatarUrl || '',
        message,
        skills,
        status: 'verified',
        verifiedAt: new Date(),
    })

    const toUserId = endorsementDoc.data().toUserId

    // Update user's endorsement count
    const verifiedEndorsementsSnapshot = await db.collection(Collections.ENDORSEMENTS)
        .where('toUserId', '==', toUserId)
        .where('status', '==', 'verified')
        .get()

    await db.collection(Collections.USERS).doc(toUserId).update({
        'stats.endorsementCount': verifiedEndorsementsSnapshot.size,
    })

    // Update skills and check for badge achievement (parallelized)
    await Promise.all(skills.map(async (skillName: string) => {
        const skillSnapshot = await db.collection(Collections.SKILLS)
            .where('userId', '==', toUserId)
            .where('name', '==', skillName)
            .limit(1)
            .get()

        let endorsementCount = 1

        if (!skillSnapshot.empty) {
            // Skill มีอยู่แล้ว — เพิ่ม endorsementCount
            const skillDoc = skillSnapshot.docs[0]
            endorsementCount = (skillDoc.data().endorsementCount || 0) + 1
            await skillDoc.ref.update({ endorsementCount })
        } else {
            // Skill ยังไม่มี — auto-create พร้อม endorsementCount = 1
            await db.collection(Collections.SKILLS).add({
                userId: toUserId,
                name: skillName,
                category: 'Other',
                level: 1,
                endorsementCount: 1,
                verified: false,
                createdAt: new Date(),
            })
        }

        // Auto-mint badge เมื่อ endorse ครบ 3 ครั้ง (ใช้ >= เผื่อ count ข้าม)
        if (endorsementCount >= 3) {
            const badgeSnapshot = await db.collection(Collections.BADGES)
                .where('userId', '==', toUserId)
                .where('skillName', '==', skillName)
                .limit(1)
                .get()

            // Only mint if badge doesn't already exist
            if (badgeSnapshot.empty) {
                await db.collection(Collections.BADGES).add({
                    userId: toUserId,
                    skillName,
                    name: `${skillName} Expert`,
                    description: `Verified by 3+ colleagues for ${skillName}`,
                    type: 'endorsement',
                    iconUrl: 'https://cdn-icons-png.flaticon.com/512/5968/5968863.png',
                    unlockedAt: new Date(),
                })
            }
        }
    }))

    return { success: true }
}

/**
 * Direct endorsement: logged-in user endorses another user immediately (no token link required)
 */
export async function directEndorse(fromUserId: string, body: any) {
    const { toUserId, skills, message, fromRole } = body

    if (!toUserId || !skills?.length || !message) {
        throw new Error('MISSING_FIELDS')
    }

    if (fromUserId === toUserId) {
        throw new Error('CANNOT_ENDORSE_SELF')
    }

    // Prevent duplicate direct endorsement from the same user within 30 days
    const recentSnap = await db.collection(Collections.ENDORSEMENTS)
        .where('toUserId', '==', toUserId)
        .where('fromUserId', '==', fromUserId)
        .where('status', '==', 'verified')
        .limit(1)
        .get()

    if (!recentSnap.empty) {
        throw new Error('ALREADY_ENDORSED')
    }

    // Get from-user info
    const fromUserDoc = await db.collection(Collections.USERS).doc(fromUserId).get()
    const fromUserData = fromUserDoc.data()

    const endorsementRef = await db.collection(Collections.ENDORSEMENTS).add({
        toUserId,
        fromUserId,
        fromName: fromUserData?.displayName || 'Anonymous',
        fromRole: fromRole || fromUserData?.title || '',
        fromAvatarUrl: fromUserData?.avatarUrl || '',
        message,
        skills,
        status: 'verified',
        verifiedAt: new Date(),
        createdAt: new Date(),
    })

    // Update toUser's endorsement count
    const verifiedSnap = await db.collection(Collections.ENDORSEMENTS)
        .where('toUserId', '==', toUserId)
        .where('status', '==', 'verified')
        .get()

    await db.collection(Collections.USERS).doc(toUserId).update({
        'stats.endorsementCount': verifiedSnap.size,
    })

    // Update per-skill endorsement counts + auto-mint badges
    await Promise.all(skills.map(async (skillName: string) => {
        const skillSnap = await db.collection(Collections.SKILLS)
            .where('userId', '==', toUserId)
            .where('name', '==', skillName)
            .limit(1)
            .get()

        let endorsementCount = 1

        if (!skillSnap.empty) {
            // Skill มีอยู่แล้ว — เพิ่ม endorsementCount
            const skillDoc = skillSnap.docs[0]
            endorsementCount = (skillDoc.data().endorsementCount || 0) + 1
            await skillDoc.ref.update({ endorsementCount })
        } else {
            // Skill ยังไม่มี — auto-create พร้อม endorsementCount = 1
            await db.collection(Collections.SKILLS).add({
                userId: toUserId,
                name: skillName,
                category: 'Other',
                level: 1,
                endorsementCount: 1,
                verified: false,
                createdAt: new Date(),
            })
        }

        // Auto-mint badge เมื่อ endorse ครบ 3 ครั้ง (ใช้ >= เผื่อ count ข้าม)
        if (endorsementCount >= 3) {
            const badgeSnap = await db.collection(Collections.BADGES)
                .where('userId', '==', toUserId)
                .where('skillName', '==', skillName)
                .limit(1)
                .get()

            if (badgeSnap.empty) {
                await db.collection(Collections.BADGES).add({
                    userId: toUserId,
                    skillName,
                    name: `${skillName} Expert`,
                    description: `Verified by 3+ colleagues for ${skillName}`,
                    type: 'endorsement',
                    iconUrl: 'https://cdn-icons-png.flaticon.com/512/5968/5968863.png',
                    unlockedAt: new Date(),
                })
            }
        }
    }))

    return { success: true, endorsementId: endorsementRef.id }
}
