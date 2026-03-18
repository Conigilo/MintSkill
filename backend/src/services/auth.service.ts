import { auth, db, Collections } from './firebase.service'

const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token'
const GITHUB_USER_URL = 'https://api.github.com/user'

/**
 * Exchange GitHub OAuth code for an access token
 */
async function exchangeGitHubCode(code: string): Promise<string> {
    const response = await fetch(GITHUB_TOKEN_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: JSON.stringify({
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code,
        }),
    })
    
    const data = await response.json() as any
    
    if (data.error) {
        throw new Error(data.error)
    }
    
    if (!data.access_token) {
        throw new Error('No access token returned')
    }
    
    return data.access_token
}

/**
 * Fetch user profile information from GitHub API
 */
async function fetchGitHubUserProfile(token: string) {
    const response = await fetch(GITHUB_USER_URL, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
        },
    })
    
    if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`)
    }
    
    return response.json() as Promise<any>
}


/**
 * Handle GitHub OAuth callback
 * Creates or updates Firebase user and syncs GitHub data
 */
export async function githubCallback(code: string) {
    if (!code) {
        throw new Error('Missing OAuth code')
    }

    // Step 1: Exchange code for GitHub access token
    const gitHubToken = await exchangeGitHubCode(code)

    // Step 2: Fetch user profile from GitHub
    const gitHubUser = await fetchGitHubUserProfile(gitHubToken)
    const userId = `gh_${gitHubUser.id}`
    const userEmail = `gh_${gitHubUser.id}@skillwallet.dev`

    // Step 3: Create Firebase Auth user if doesn't exist
    try {
        await auth.getUser(userId)
    } catch {
        // User doesn't exist, create new
        await auth.createUser({
            uid: userId,
            displayName: gitHubUser.name || gitHubUser.login,
            photoURL: gitHubUser.avatar_url,
            email: userEmail,
        })

        // Create user document in Firestore
        await db.collection(Collections.USERS).doc(userId).set({
            uid: userId,
            username: gitHubUser.login,
            displayName: gitHubUser.name || gitHubUser.login,
            email: userEmail,
            avatarUrl: gitHubUser.avatar_url,
            title: '',
            bio: gitHubUser.bio || '',
            location: gitHubUser.location || '',
            linkedinUrl: '',
            github: {
                connected: true,
                login: gitHubUser.login,
                accessToken: gitHubToken,
                avatarUrl: gitHubUser.avatar_url,
                repoCount: gitHubUser.public_repos ?? 0,
                totalStars: 0,
                totalContributions: 0,
                lastSynced: null,
            },
            stats: {
                skillCount: 0,
                endorsementCount: 0,
                profileViews: 0,
            },
            createdAt: new Date(),
        })
    }

    // Step 4: Update GitHub token and connection info
    await db.collection(Collections.USERS).doc(userId).update({
        'github.accessToken': gitHubToken,
        'github.connected': true,
        'github.avatarUrl': gitHubUser.avatar_url,
        lastLoginAt: new Date(),
    })

    // Step 5: Create Firebase custom token for frontend
    const customToken = await auth.createCustomToken(userId)
    
    return { token: customToken, uid: userId }
}

/**
 * Verify Firebase ID token from Authorization header
 */
export async function verifyFirebaseToken(authHeader: string | undefined) {
    if (!authHeader?.startsWith('Bearer ')) {
        return { valid: false }
    }

    try {
        const decoded = await auth.verifyIdToken(authHeader.split(' ')[1])
        return { valid: true, uid: decoded.uid }
    } catch {
        return { valid: false }
    }
}

/**
 * Logout by revoking all refresh tokens
 */
export async function logout(authHeader: string | undefined) {
    if (authHeader?.startsWith('Bearer ')) {
        try {
            const decoded = await auth.verifyIdToken(authHeader.split(' ')[1])
            await auth.revokeRefreshTokens(decoded.uid)
        } catch {
            // Token already expired, that's fine
        }
    }
    
    return { success: true }
}
