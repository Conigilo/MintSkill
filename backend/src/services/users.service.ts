import { db, Collections, FieldValue } from './firebase.service'

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
 * Sync user profile from Firebase auth data
 * Creates a new user if not exists, otherwise updates existing
 */
export async function syncProfile(uid: string, userData: any) {
    const userRef = db.collection(Collections.USERS).doc(uid)
    const doc = await userRef.get()
    
    if (!doc.exists) {
        const newUser = {
            ...userData,
            username: userData.email?.split('@')[0] || uid.substring(0, 8),
            createdAt: new Date(),
            updatedAt: new Date(),
            stats: {
                verifiedSkills: 0,
                endorsementCount: 0,
                skillCount: 0,
                profileViews: 0
            }
        }
        await userRef.set(newUser)
        return newUser
    } else {
        const updates = {
            updatedAt: new Date(),
            displayName: userData.displayName || doc.data()?.displayName,
            photoURL: userData.photoURL || doc.data()?.photoURL
        }
        await userRef.update(updates)
        return { ...doc.data(), ...updates }
    }
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

    // Increment profile view counter (atomic operation)
    await userDoc.ref.update({
        'stats.profileViews': FieldValue.increment(1),
    })

    return { id: userDoc.id, ...userData }
}

/**
 * Get complete portfolio data for a user including all related information
 * Used for resume/CV generation
 */
export async function getPortfolio(identifier: string) {
    // Step 1: Find user by ID or username
    let userDoc: any = null;

    const docRef = await db.collection(Collections.USERS).doc(identifier).get()
    if (docRef.exists) {
        userDoc = docRef
    } else {
        const userQuerySnapshot = await db.collection(Collections.USERS)
            .where('username', '==', identifier)
            .limit(1)
            .get()
        if (!userQuerySnapshot.empty) {
            userDoc = userQuerySnapshot.docs[0]
        }
    }

    if (!userDoc) {
        return null
    }
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

/**
 * Search for users by basic filters
 */
export async function searchUsers(query?: string, filters?: any) {
    let usersQuery: any = db.collection(Collections.USERS)

    // Simplified search logic for Firestore
    if (query) {
        // Firestore doesn't support full-text search out of the box
        // We do a simple prefix search on display name
        usersQuery = usersQuery
            .where('displayName', '>=', query)
            .where('displayName', '<=', query + '\uf8ff')
    }

    if (filters?.location) {
        usersQuery = usersQuery.where('location', '==', filters.location)
    }

    const snapshot = await usersQuery.limit(filters?.limit || 20).get()
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
}

/**
 * Get recommended developers for discovery
 */
export async function getRecommendations(limit = 10) {
    const querySnapshot = await db.collection(Collections.USERS)
        .orderBy('stats.verifiedSkills', 'desc')
        .limit(limit)
        .get()

    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}
