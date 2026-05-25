import { db, Collections } from './firebase.service'
import { randomBytes } from 'crypto'
import { updateUserSkillStats } from './skills.service'

/**
 * Update skill endorsement count and auto-mint badge if threshold met
 */
async function updateSkillAndMintBadge(toUserId: string, skillName: string) {
    const skillSnap = await db.collection(Collections.SKILLS)
        .where('userId', '==', toUserId)
        .where('name', '==', skillName)
        .limit(1)
        .get()

    // Count actual endorsements for this specific skill
    const skillEndorsementsSnap = await db.collection(Collections.ENDORSEMENTS)
        .where('toUserId', '==', toUserId)
        .where('status', '==', 'verified')
        .where('skills', 'array-contains', skillName)
        .get()
    
    const endorsementCount = skillEndorsementsSnap.size
    
    let endorsementScore = Math.min(endorsementCount * 3, 6) // Max 6 points from endorsements (2 people)
    let quizScore = 0
    let verified = false

    if (!skillSnap.empty) {
        const skillDoc = skillSnap.docs[0]
        const docData = skillDoc.data()
        quizScore = docData.quizScore || 0
        
        // Calculate Level Based on shared rules
        let newLevel = 0;
        if (endorsementScore >= 5 && quizScore >= 10) newLevel = 3;
        else if (endorsementScore >= 3 && quizScore >= 7) newLevel = 2;
        else if (endorsementScore >= 1 && quizScore >= 4) newLevel = 1;

        const updateData: any = { 
            endorsementScore,
            endorsementCount,
            verified: newLevel > 0
        }
        
        if (newLevel > 0) {
            updateData.level = newLevel;
            
            // Auto-mint or update badge
            const badgeSnap = await db.collection(Collections.BADGES)
                .where('userId', '==', toUserId)
                .where('skillName', '==', skillName)
                .limit(1)
                .get()

            if (badgeSnap.empty) {
                await db.collection(Collections.BADGES).add({
                    userId: toUserId,
                    skillName,
                    level: newLevel,
                    name: `${skillName} Certified Expert`,
                    description: `Successfully verified by Endorsements and AI Quiz for ${skillName}`,
                    type: 'skill_verification',
                    iconUrl: 'https://cdn-icons-png.flaticon.com/512/5968/5968863.png',
                    unlockedAt: new Date(),
                })
            } else {
                const badgeDoc = badgeSnap.docs[0];
                if ((badgeDoc.data().level || 0) < newLevel) {
                    await badgeDoc.ref.update({ level: newLevel, updatedAt: new Date() });
                }
            }
        }

        await skillDoc.ref.update(updateData)
        
        // After updating the skill, sync the user's aggregate stats
        await updateUserEndorsementCount(toUserId)
        await updateUserSkillStats(toUserId)
    } else {
        await db.collection(Collections.SKILLS).add({
            userId: toUserId,
            name: skillName,
            category: 'Other',
            level: 0, // Starts at Level 0 (Beginner)
            endorsementScore,
            endorsementCount,
            quizScore: 0,
            verified: false, // Must pass AI quiz to be verified
            createdAt: new Date(),
        })

        // Sync the user's aggregate stats
        await updateUserEndorsementCount(toUserId)
        await updateUserSkillStats(toUserId)
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
        link: doc.data().token ? `${process.env.FRONTEND_URL || 'http://localhost:3000'}/endorse/${doc.data().token}` : undefined,
    })).sort((a: any, b: any) => {
        const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt || 0).getTime()
        const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt || 0).getTime()
        return timeB - timeA
    })
}

/**
 * Get all endorsements sent by a user
 */
export async function getSentEndorsementsByUser(userId: string) {
    const querySnapshot = await db.collection(Collections.ENDORSEMENTS)
        .where('fromUserId', '==', userId)
        .get()

    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        token: undefined,
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
    recipientEmail: string | undefined,
    body: { message?: string }
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
        message: body.message || '', // ข้อความจากผู้ขอก่อนเพื่อนกดให้
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

    const skills = Array.from(new Set(skillsSnapshot.docs.map(doc => doc.data().name)))

    return {
        valid: true,
        toUserId: endorsementData.toUserId,
        toUser: {
            displayName: userData?.displayName,
            avatarUrl: userData?.avatarUrl,
            username: userData?.username,
        },
        requestMessage: endorsementData.message || '',
        availableSkills: skills,
    }
}

/**
 * Submit endorsement and auto-mint badge if earned
 */
export async function submitEndorsement(token: string, body: any) {
    const { message, skills, fromName, fromRole, fromAvatarUrl, fromUserId } = body

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

    // Optional: Check if fromUserId == toUserId to prevent self-endorsement
    if (fromUserId && fromUserId === endorsementDoc.data().toUserId) {
        throw new Error('CANNOT_ENDORSE_SELF')
    }

    // Update endorsement with submission details
    await endorsementDoc.ref.update({
        fromUserId: fromUserId || null,
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

/**
 * Create a direct endorsement request from one logged-in user to another user in the system
 */
export async function createDirectRequest(toUserId: string, fromUserId: string, body: any) {
    const { message } = body

    if (!toUserId || !fromUserId) {
        throw new Error('MISSING_FIELDS')
    }

    if (toUserId === fromUserId) {
        throw new Error('CANNOT_REQUEST_SELF')
    }

    // Check if there is already a pending request from this user to that user to prevent spam
    const existingSnap = await db.collection(Collections.ENDORSEMENTS)
        .where('toUserId', '==', toUserId)
        .where('fromUserId', '==', fromUserId)
        .where('status', '==', 'pending')
        .limit(1)
        .get()

    if (!existingSnap.empty) {
        throw new Error('DUPLICATE_PENDING_REQUEST')
    }

    // Also check if they have endorsed in the last 30 days
    const recentSnap = await db.collection(Collections.ENDORSEMENTS)
        .where('toUserId', '==', toUserId)
        .where('fromUserId', '==', fromUserId)
        .where('status', '==', 'verified')
        .limit(1)
        .get()

    if (!recentSnap.empty) {
        throw new Error('ALREADY_ENDORSED')
    }

    // Get to-user (requestor) info to cache on the endorsement for easy viewing
    const toUserDoc = await db.collection(Collections.USERS).doc(toUserId).get()
    const toUserData = toUserDoc.data()

    const requestRef = await db.collection(Collections.ENDORSEMENTS).add({
        toUserId,
        toUserName: toUserData?.displayName || toUserData?.username || 'Anonymous Developer',
        toUserAvatarUrl: toUserData?.avatarUrl || '',
        fromUserId, // targeted endorser
        fromName: '', // will be populated on approval
        fromRole: '', // will be populated on approval
        fromAvatarUrl: '', // will be populated on approval
        message: message || 'ช่วยรับรองทักษะให้ฉันหน่อยครับ',
        skills: [], // will be populated on approval
        status: 'pending',
        createdAt: new Date(),
    })

    return { success: true, requestId: requestRef.id }
}

/**
 * Get all pending requests sent to a user (requests waiting for this user to endorse someone else)
 */
export async function getPendingRequestsForUser(userId: string) {
    const querySnapshot = await db.collection(Collections.ENDORSEMENTS)
        .where('fromUserId', '==', userId)
        .where('status', '==', 'pending')
        .get()

    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    })).sort((a: any, b: any) => {
        const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt || 0).getTime()
        const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt || 0).getTime()
        return timeB - timeA
    })
}

/**
 * Approve a pending direct endorsement request
 */
export async function approveEndorsementRequest(requestId: string, fromUserId: string, body: any) {
    const { skills, message, fromRole } = body

    if (!skills?.length || !message) {
        throw new Error('MISSING_FIELDS')
    }

    const docRef = db.collection(Collections.ENDORSEMENTS).doc(requestId)
    const doc = await docRef.get()

    if (!doc.exists) {
        throw new Error('REQUEST_NOT_FOUND')
    }

    const data = doc.data()
    if (!data) {
        throw new Error('REQUEST_NOT_FOUND')
    }

    if (data.status !== 'pending') {
        throw new Error('ALREADY_PROCESSED')
    }

    // Ensure the approving user is indeed the requested target
    if (data.fromUserId !== fromUserId) {
        throw new Error('UNAUTHORIZED')
    }

    // Get approver's user profile to cache their details
    const fromUserDoc = await db.collection(Collections.USERS).doc(fromUserId).get()
    const fromUserData = fromUserDoc.data()

    await docRef.update({
        fromName: fromUserData?.displayName || 'Anonymous Colleague',
        fromRole: fromRole || fromUserData?.title || 'Developer',
        fromAvatarUrl: fromUserData?.avatarUrl || '',
        message: message.trim(),
        skills,
        status: 'verified',
        verifiedAt: new Date()
    })

    const toUserId = data.toUserId

    // Update target user's endorsement count
    await updateUserEndorsementCount(toUserId)

    // Update per-skill counts and auto-mint badges
    await Promise.all(skills.map((skillName: string) => updateSkillAndMintBadge(toUserId, skillName)))

    return { success: true }
}

/**
 * Decline/Dismiss a pending endorsement request (delete or mark as declined)
 */
export async function declineEndorsementRequest(requestId: string, fromUserId: string) {
    const docRef = db.collection(Collections.ENDORSEMENTS).doc(requestId)
    const doc = await docRef.get()

    if (!doc.exists) {
        throw new Error('REQUEST_NOT_FOUND')
    }

    const data = doc.data()
    if (!data) {
        throw new Error('REQUEST_NOT_FOUND')
    }

    // If it's a link request (fromUserId is null), we allow the recipient (toUserId) to delete it
    // If it's a direct request (fromUserId is set), we allow the designated endorser (fromUserId) to decline/delete it
    const isDirectRequest = data.fromUserId !== null && data.fromUserId !== undefined;
    const isAuthorized = isDirectRequest 
        ? data.fromUserId === fromUserId 
        : data.toUserId === fromUserId; // For link requests, owner can delete it from history

    if (!isAuthorized) {
        throw new Error('UNAUTHORIZED')
    }

    // Deleting the document is cleaner to avoid storing rejected requests indefinitely
    await docRef.delete()

    return { success: true }
}
