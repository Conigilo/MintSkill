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

/**
 * Login with Email (Simplified for Development)
 * ในระบบจริงควรเช็ค Password ผ่าน Firebase Auth REST API
 */
export async function loginWithEmail(email: string) {
    try {
        // 1. หา User จาก Email
        const userRecord = await auth.getUserByEmail(email)
        const userId = userRecord.uid

        // 2. สร้าง Custom Token
        const customToken = await auth.createCustomToken(userId)

        // 3. แลก Custom Token เป็น ID Token (เพื่อให้ใช้เทส API ได้ทันที)
        // ต้องมี FIREBASE_WEB_API_KEY ใน .env
        const apiKey = process.env.FIREBASE_WEB_API_KEY
        let idToken = customToken // fallback เป็น custom token ถ้าไม่มี key

        if (apiKey) {
            const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: customToken,
                    returnSecureToken: true
                })
            })
            const data = await response.json() as any
            if (data.idToken) {
                idToken = data.idToken
            }
        }

        // 4. อัปเดตเวลา Login ล่าสุด
        await db.collection(Collections.USERS).doc(userId).update({
            lastLoginAt: new Date(),
        })

        return {
            token: idToken,
            uid: userId,
            displayName: userRecord.displayName,
            isIdToken: !!apiKey // บอกให้รู้ว่านี่คือ ID Token จริงๆ แล้วนะ
        }
    } catch (error: any) {
        throw new Error('ไม่พบผู้ใช้งานด้วย Email นี้ หรือระบบแลก Token ขัดข้อง: ' + error.message)
    }
}
