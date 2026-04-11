import { db, Collections } from './firebase.service'

const GITHUB_API_URL = 'https://api.github.com'

/**
 * Make authenticated request to GitHub API
 */
async function fetchFromGitHub(path: string, accessToken: string) {
    const response = await fetch(`${GITHUB_API_URL}${path}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/vnd.github+json',
        },
    })

    if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`)
    }

    return response.json()
}

/**
 * Get authenticated user's GitHub access token from database
 */
async function getGitHubAccessToken(uid: string): Promise<string> {
    const userDoc = await db.collection(Collections.USERS).doc(uid).get()
    const accessToken = userDoc.data()?.github?.accessToken

    if (!accessToken) {
        throw new Error('GitHub not connected')
    }

    return accessToken
}

/**
 * Save GitHub access token for a user
 */
export async function saveGitHubToken(uid: string, accessToken: string) {
    await db.collection(Collections.USERS).doc(uid).update({
        'github.accessToken': accessToken,
        'github.connected': true,
        'github.lastConnected': new Date()
    })
    return { success: true }
}

/**
 * Sync GitHub repositories and auto-detect skills
 * Fetches all repos, calculates stats, and adds language skills
 */
export async function syncGitHub(uid: string) {
    const accessToken = await getGitHubAccessToken(uid)

    // Fetch GitHub user information
    const githubUser = await fetchFromGitHub('/user', accessToken) as any

    // Fetch all repositories sorted by recent updates
    const repositories = await fetchFromGitHub(
        `/users/${githubUser.login}/repos?per_page=100&sort=updated`,
        accessToken
    ) as any[]

    const syncTimestamp = new Date()
    const batch = db.batch()

    // Save repositories to database
    for (const repo of repositories) {
        const repoRef = db.collection(Collections.GITHUB_REPOS)
            .doc(`${uid}_${repo.id}`)

        batch.set(repoRef, {
            userId: uid,
            repoId: repo.id,
            name: repo.name,
            description: repo.description ?? '',
            url: repo.html_url,
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            language: repo.language ?? null,
            topics: repo.topics ?? [],
            isPrivate: repo.private,
            updatedAt: new Date(repo.updated_at),
            syncedAt: syncTimestamp,
        }, { merge: true })
    }

    await batch.commit()

    // Calculate stats
    const totalStars = repositories.reduce((sum, repo) => sum + repo.stargazers_count, 0)
    const languages = [
        ...new Set(repositories.map((repo: any) => repo.language).filter(Boolean))
    ] as string[]

    // Fetch contributions via GitHub GraphQL
    const totalContributions = await fetchTotalContributions(accessToken, githubUser.login)

    // Update user's GitHub stats
    await db.collection(Collections.USERS).doc(uid).update({
        'github.repoCount': repositories.length,
        'github.totalStars': totalStars,
        'github.totalContributions': totalContributions,
        'github.lastSynced': syncTimestamp,
        'github.connected': true,
    })

    // Auto-add programming language skills detected from repos
    const newSkills = await autoAddLanguageSkills(uid, languages, syncTimestamp)

    return {
        synced: {
            repos: repositories.length,
            totalStars,
            totalContributions,
            newSkillsDetected: newSkills,
        }
    }
}

/**
 * Get top repositories for a user
 */
export async function getRepos(uid: string) {
    const querySnapshot = await db.collection(Collections.GITHUB_REPOS)
        .where('userId', '==', uid)
        .orderBy('stars', 'desc')
        .limit(20)
        .get()

    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

/**
 * Get comprehensive dashboard summary for a user
 * Includes profile, GitHub stats, skills, endorsements, and repos
 */
export async function getDashboard(uid: string) {
    // Fetch data in parallel
    const [
        userSnapshot,
        skillsSnapshot,
        endorsementsSnapshot,
        reposSnapshot
    ] = await Promise.all([
        db.collection(Collections.USERS).doc(uid).get(),
        db.collection(Collections.SKILLS).where('userId', '==', uid).get(),
        db.collection(Collections.ENDORSEMENTS)
            .where('toUserId', '==', uid)
            .where('status', '==', 'verified')
            .get(),
        db.collection(Collections.GITHUB_REPOS)
            .where('userId', '==', uid)
            .orderBy('stars', 'desc')
            .limit(6)
            .get(),
    ])

    const userData = userSnapshot.data() as any
    const gitHubData = userData?.github

    // Get contribution grid for visualization
    const contributionGrid = await getContributionGrid(uid)

    // Sort endorsements by most recent
    const recentEndorsements = endorsementsSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a: any, b: any) =>
            new Date(b.verifiedAt?.toDate?.() ?? b.verifiedAt).getTime() -
            new Date(a.verifiedAt?.toDate?.() ?? a.verifiedAt).getTime()
        )
        .slice(0, 3)

    return {
        profile: {
            uid,
            displayName: userData?.displayName,
            username: userData?.username,
            avatarUrl: userData?.avatarUrl,
            title: userData?.title,
            bio: userData?.bio,
            location: userData?.location,
            linkedinUrl: userData?.linkedinUrl,
        },
        github: gitHubData ? {
            connected: gitHubData.connected,
            login: gitHubData.login,
            repoCount: gitHubData.repoCount ?? 0,
            totalStars: gitHubData.totalStars ?? 0,
            totalContributions: gitHubData.totalContributions ?? 0,
            lastSynced: gitHubData.lastSynced,
            contributionGrid,
        } : null,
        stats: {
            skillCount: skillsSnapshot.size,
            endorsementCount: endorsementsSnapshot.size,
            contributions: gitHubData?.totalContributions ?? 0,
            projectCount: reposSnapshot.size,
        },
        skills: skillsSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .sort((a: any, b: any) => b.endorsementCount - a.endorsementCount)
            .slice(0, 12),
        recentRepos: reposSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
        recentEndorsements,
    }
}

/**
 * Generate contribution grid (5x26 cells for visualization)
 * TODO: Replace with real GitHub contribution data
 */
async function getContributionGrid(uid: string): Promise<number[]> {
    const userDoc = await db.collection(Collections.USERS).doc(uid).get()
    const totalContributions = userDoc.data()?.github?.totalContributions ?? 0

    const grid: number[] = []
    let remaining = totalContributions

    // Generate 130 cells (5 weeks × 26 days) with contribution levels
    for (let i = 0; i < 130; i++) {
        if (remaining <= 0) {
            grid.push(0)
            continue
        }

        const randomValue = Math.random()
        const level = randomValue > 0.65 ? Math.min(Math.floor(Math.random() * 4) + 1, remaining) : 0
        grid.push(level)
        remaining -= level
    }

    return grid
}

/**
 * Fetch total contributions via GitHub GraphQL API
 */
async function fetchTotalContributions(accessToken: string, login: string): Promise<number> {
    try {
        const query = `
            query($login:String!) {
                user(login:$login) {
                    contributionsCollection {
                        contributionCalendar {
                            totalContributions
                        }
                    }
                }
            }
        `

        const response = await fetch('https://api.github.com/graphql', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query, variables: { login } }),
        })

        const data = await response.json() as any

        return data?.data?.user?.contributionsCollection?.contributionCalendar?.totalContributions ?? 0
    } catch {
        // Gracefully handle GraphQL errors
        return 0
    }
}

/**
 * Auto-add programming language skills from detected GitHub languages
 */
async function autoAddLanguageSkills(
    uid: string,
    languages: string[],
    timestamp: Date
): Promise<string[]> {
    // Get existing skills for the user
    const existingSkillsSnapshot = await db.collection(Collections.SKILLS)
        .where('userId', '==', uid)
        .get()

    const existingSkillNames = existingSkillsSnapshot.docs
        .map(doc => (doc.data().name as string).toLowerCase())

    const newSkills: string[] = []

    // Add new language skills that don't already exist
    for (const language of languages) {
        if (existingSkillNames.includes(language.toLowerCase())) {
            continue
        }

        await db.collection(Collections.SKILLS).add({
            userId: uid,
            name: language,
            category: 'language',
            level: 1,
            endorsementCount: 0,
            fromGitHub: true,
            createdAt: timestamp,
            updatedAt: timestamp,
        })

        newSkills.push(language)
    }

    // Update user's skill count if new skills were added
    if (newSkills.length > 0) {
        await db.collection(Collections.USERS).doc(uid).update({
            'stats.skillCount': existingSkillsSnapshot.size + newSkills.length,
        })
    }

    return newSkills
}