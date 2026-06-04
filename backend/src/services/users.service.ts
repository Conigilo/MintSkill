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
 * Helper: deduplicate users by email, keeping the account with the most data.
 * Filters out empty ghost accounts (GitHub OAuth accounts with @skillwallet.dev email).
 */
function deduplicateUsers(users: any[], limit: number): any[] {
    const emailMap = new Map<string, any>()
    const noEmailAccounts: any[] = []

    for (const user of users) {
        const email = user.email
        // Skip ghost emails generated for GitHub OAuth accounts (format: gh_xxx@skillwallet.dev)
        const isGhostEmail = !email || email.includes('@skillwallet.dev')

        if (isGhostEmail) {
            // Only include ghost accounts if they have actual data
            const skillCount = user.stats?.skillCount || 0
            if (skillCount > 0) noEmailAccounts.push(user)
            // Otherwise silently skip empty ghost accounts
            continue
        }

        const existing = emailMap.get(email)
        if (!existing) {
            emailMap.set(email, user)
        } else {
            // Keep the account with more skills/data
            const existingScore = (existing.stats?.skillCount || 0) + (existing.stats?.endorsementCount || 0)
            const newScore = (user.stats?.skillCount || 0) + (user.stats?.endorsementCount || 0)
            if (newScore > existingScore) emailMap.set(email, user)
        }
    }

    return [...emailMap.values(), ...noEmailAccounts].slice(0, limit)
}

/**
 * Search for users by basic filters
 */
export async function searchUsers(query?: string, filters?: any) {
    const requestedLimit = filters?.limit || 20

    try {
        let usersQuery: any = db.collection(Collections.USERS)
        if (filters?.location) {
            usersQuery = usersQuery.where('location', '==', filters.location)
        }

        // Fetch up to 150 users to search/filter in memory
        const snapshot = await usersQuery.limit(150).get()
        let allUsers = snapshot.docs.map((doc: any) => {
            const data = { id: doc.id, ...doc.data() }
            // Mask sensitive data before returning
            if (data.github?.accessToken) {
                data.github = { ...data.github, accessToken: undefined }
            }
            return data
        })

        // Apply case-insensitive query filter in memory (searches display name & username)
        if (query) {
            const lowerQuery = query.trim().toLowerCase()
            allUsers = allUsers.filter((u: any) => 
                (u.displayName && String(u.displayName).toLowerCase().includes(lowerQuery)) || 
                (u.username && String(u.username).toLowerCase().includes(lowerQuery))
            )
        }

        return deduplicateUsers(allUsers, requestedLimit)
    } catch (error: any) {
        console.error('searchUsers failed, returning empty array fallback:', error.message)
        return []
    }
}

/**
 * Get recommended developers for discovery
 */
export async function getRecommendations(limit = 10) {
    try {
        const querySnapshot = await db.collection(Collections.USERS)
            .orderBy('stats.verifiedSkills', 'desc')
            .limit(limit * 3)
            .get()

        const users = querySnapshot.docs.map(doc => {
            const data = { id: doc.id, ...doc.data() }
            if ((data as any).github?.accessToken) {
                (data as any).github = { ...(data as any).github, accessToken: undefined }
            }
            return data
        })
        return deduplicateUsers(users, limit)
    } catch (error: any) {
        // Fallback: if the Firestore index is missing, just return latest users
        console.warn('getRecommendations orderBy failed (index missing?), falling back to latest users:', error.message)
        const fallbackSnapshot = await db.collection(Collections.USERS)
            .limit(limit * 3)
            .get()
        const users = fallbackSnapshot.docs.map(doc => {
            const data = { id: doc.id, ...doc.data() }
            if ((data as any).github?.accessToken) {
                (data as any).github = { ...(data as any).github, accessToken: undefined }
            }
            return data
        })
        return deduplicateUsers(users, limit)
    }
}
