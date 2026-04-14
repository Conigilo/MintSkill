import { db, Collections } from './firebase.service'
import { randomBytes } from 'crypto'

/**
 * Update skill endorsement count and auto-mint badge if threshold met
 */
async function updateSkillAndMintBadge(toUserId: string, skillName: string) {
    const skillSnap = await db.collection(Collections.SKILLS)
        .where('userId', '==', toUserId)
        .where('name', '==', skillName)
        .limit(1)
        .get()

    let endorsementScore = 6
    let quizScore = 0
    let verified = false

    if (!skillSnap.empty) {
        const skillDoc = skillSnap.docs[0]
        const docData = skillDoc.data()
        quizScore = docData.quizScore || 0
        endorsementScore = 6 // Full points for endorsement
        verified = (quizScore + endorsementScore) >= 8

        await skillDoc.ref.update({ 
            endorsementScore,
            verified
        })
    } else {
        await db.collection(Collections.SKILLS).add({
            userId: toUserId,
            name: skillName,
            category: 'Other',
            level: 1,
            endorsementScore: 6,
            quizScore: 0,
            verified: false,
            createdAt: new Date(),
        })
    }

    if (verified) {
        const badgeSnap = await db.collection(Collections.BADGES)
            .where('userId', '==', toUserId)
            .where('skillName', '==', skillName)
            .limit(1)
            .get()

        if (badgeSnap.empty) {
            await db.collection(Collections.BADGES).add({
                userId: toUserId,
                skillName,
                name: `${skillName} Certified Expert`,
                description: `Successfully verified by Endorsements and AI Quiz for ${skillName}`,
                type: 'skill_verification',
                iconUrl: 'https://cdn-icons-png.flaticon.com/512/5968/5968863.png',
                unlockedAt: new Date(),
            })
        }
    }
}

/**
 * Update user's verified endorsement count
 */
async function updateUserEndorsementCount(toUserId: string) {
    const verifiedSnap = await db.collection(Collections.ENDORSEMENTS)
        .where('toUserId', '==', toUserId)
        .where('status', '==', 'verified')
        .get()

    await db.collection(Collections.USERS).doc(toUserId).update({
        'stats.endorsementCount': verifiedSnap.size,
    })
}

/**
 * Get all endorsements received by a user
 */
export async function getEndorsementsByUser(userId: string) {
    const querySnapshot = await db.collection(Collections.ENDORSEMENTS)
        .where('toUserId', '==', userId)
        .get()

    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        token: undefined, // Don't expose token
    })).sort((a: any, b: any) => {
        const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt || 0).getTime()
        const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt || 0).getTime()
        return timeB - timeA
    })
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
    await updateUserEndorsementCount(toUserId)

    // Update skills and check for badge achievement
    await Promise.all(skills.map((skillName: string) => updateSkillAndMintBadge(toUserId, skillName)))

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
    await updateUserEndorsementCount(toUserId)

    // Update per-skill endorsement counts + auto-mint badges
    await Promise.all(skills.map((skillName: string) => updateSkillAndMintBadge(toUserId, skillName)))

    return { success: true, endorsementId: endorsementRef.id }
}
