import { db, Collections } from '../services/firebase.service'

/**
 * Seed script to create a mock user for testing
 * Run with: bun run src/scripts/seed.ts
 */
async function seed() {
    console.log('🌱 Seeding mock data...')

    const mockUid = 'mock-user-123'
    const mockUsername = 'testuser'

    try {
        // 1. Create Mock User
        const userRef = db.collection(Collections.USERS).doc(mockUid)
        await userRef.set({
            username: mockUsername,
            displayName: 'Test User',
            title: 'Senior Mock Developer',
            bio: 'This is a mock user for API testing. I love writing clean code and testing endpoints!',
            location: 'Bangkok, Thailand',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=testuser',
            github: {
                connected: true,
                login: 'testuser-github',
                repoCount: 5,
                totalStars: 10,
                totalContributions: 150,
                lastSynced: new Date()
            },
            stats: {
                profileViews: 42,
                endorsementCount: 2,
                skillCount: 3
            },
            createdAt: new Date(),
            updatedAt: new Date()
        })
        console.log(`✅ Created user: ${mockUsername} (${mockUid})`)

        // 2. Add Mock Skills
        const skills = [
            { name: 'TypeScript', level: 4, category: 'language', endorsementCount: 5 },
            { name: 'Node.js', level: 3, category: 'backend', endorsementCount: 2 },
            { name: 'React', level: 4, category: 'frontend', endorsementCount: 8 }
        ]

        for (const skill of skills) {
            await db.collection(Collections.SKILLS).add({
                ...skill,
                userId: mockUid,
                fromGitHub: false,
                createdAt: new Date(),
                updatedAt: new Date()
            })
        }
        console.log('✅ Added mock skills')

        // 3. Add Mock Repos
        const repos = [
            { name: 'awesome-project', stars: 5, language: 'TypeScript', url: 'https://github.com/testuser/awesome-project' },
            { name: 'learning-elysia', stars: 2, language: 'JavaScript', url: 'https://github.com/testuser/learning-elysia' }
        ]

        for (const repo of repos) {
            await db.collection(Collections.GITHUB_REPOS).doc(`${mockUid}_${repo.name}`).set({
                ...repo,
                userId: mockUid,
                description: 'A mock repository for testing',
                forks: 0,
                isPrivate: false,
                updatedAt: new Date(),
                syncedAt: new Date()
            })
        }
        console.log('✅ Added mock repositories')

        console.log('\n✨ Seeding complete! You can now test:')
        console.log(`👉 http://localhost:8000/users/${mockUsername}`)
        console.log(`👉 http://localhost:8000/users/${mockUsername}/portfolio`)

    } catch (error) {
        console.error('❌ Seeding failed:', error)
    } finally {
        process.exit()
    }
}

seed()
