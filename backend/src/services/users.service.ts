import { db, Collections } from './firebase.service'

/**
 * Retrieve authenticated user's profile
 * Excludes sensitive data like access tokens
 */
export async function getMyProfile(uid: string) {
    const userDoc = await db.collection(Collections.USERS).doc(uid).get()
    
    if (!userDoc.exists) {
        return null
    }

    const userData = { ...userDoc.data()! }
    
    // Mask sensitive data
    if (userData.github?.accessToken) {
        userData.github = { ...userData.github, accessToken: '***' }
    }
    
    return { id: userDoc.id, ...userData }
}

/**
 * Update user's profile with allowed fields
 */
export async function updateMyProfile(uid: string, body: Record<string, any>) {
    const allowedFields = ['displayName', 'title', 'bio', 'location', 'linkedinUrl'] as const
    const updateData: Record<string, any> = { updatedAt: new Date() }

    for (const field of allowedFields) {
        if (body[field] !== undefined) {
            updateData[field] = body[field]
        }
    }

    await db.collection(Collections.USERS).doc(uid).update(updateData)
    
    return updateData
}

/**
 * Get public profile information for a user by username
 * Increments profile view count
 */
export async function getPublicProfile(username: string) {
    const querySnapshot = await db.collection(Collections.USERS)
        .where('username', '==', username)
        .limit(1)
        .get()

    if (querySnapshot.empty) {
        return null
    }

    const userDoc = querySnapshot.docs[0]
    const userData = { ...userDoc.data() }

    // Mask sensitive data
    if (userData.github?.accessToken) {
        userData.github = { ...userData.github, accessToken: undefined }
    }

    // Increment profile view counter
    await userDoc.ref.update({
        'stats.profileViews': (userData.stats?.profileViews || 0) + 1,
    })

    return { id: userDoc.id, ...userData }
}

/**
 * Get complete portfolio data for a user including all related information
 * Used for resume/CV generation
 */
export async function getPortfolio(username: string) {
    // Step 1: Find user by username
    const userQuerySnapshot = await db.collection(Collections.USERS)
        .where('username', '==', username)
        .limit(1)
        .get()

    if (userQuerySnapshot.empty) {
        return null
    }

    const userDoc = userQuerySnapshot.docs[0]
    const userData = { ...userDoc.data() }
    const userId = userDoc.id

    // Mask sensitive data
    if (userData.github?.accessToken) {
        userData.github = { ...userData.github, accessToken: undefined }
    }

    // Step 2: Fetch all skills
    const skillsQuerySnapshot = await db.collection(Collections.SKILLS)
        .where('userId', '==', userId)
        .get()
    const skills = skillsQuerySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    // Step 3: Fetch all badges
    const badgesQuerySnapshot = await db.collection(Collections.BADGES)
        .where('userId', '==', userId)
        .get()
    const badges = badgesQuerySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    // Step 4: Fetch verified endorsements
    const endorsementsQuerySnapshot = await db.collection(Collections.ENDORSEMENTS)
        .where('toUserId', '==', userId)
        .where('status', '==', 'verified')
        .get()
    const endorsements = endorsementsQuerySnapshot.docs.map(doc => {
        const data = doc.data()
        return { id: doc.id, ...data, token: undefined }
    })

    // Step 5: Fetch GitHub repositories
    const reposQuerySnapshot = await db.collection(Collections.GITHUB_REPOS)
        .where('userId', '==', userId)
        .get()
    const repositories = reposQuerySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    return {
        profile: { id: userId, ...userData },
        skills,
        badges,
        endorsements,
        repositories,
    }
}
