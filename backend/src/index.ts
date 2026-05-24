import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { swagger } from '@elysiajs/swagger'
import { authRoute } from './routes/auth.route'
import { usersRoute } from './routes/users.route'
import { skillsRoute } from './routes/skills.route'
import { endorsementsRoute } from './routes/endorsements.route'
import { githubRoute } from './routes/github.route'
import { badgesRoute } from './routes/badges.route'
import { exportRoute } from './routes/export.route'
import { jobsRoute } from './routes/jobs.route'
import { aiRoute } from './routes/ai.route'

const requiredEnvVars = ['GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET']
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.warn(`Missing environment variable: ${envVar}`)
    }
}

const FRONTEND_URL = process.env.FRONTEND_URL
if (!FRONTEND_URL && process.env.NODE_ENV === 'production') {
    throw new Error('FRONTEND_URL environment variable is required in production')
}

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_WINDOW = 60_000 // 1 minute
const RATE_LIMIT_MAX = 100 // requests per window

// Cleanup expired entries every 5 minutes to prevent memory leak
setInterval(() => {
    const now = Date.now()
    for (const [ip, entry] of rateLimitMap) {
        if (now > entry.resetAt) {
            rateLimitMap.delete(ip)
        }
    }
}, 5 * 60_000)

const app = new Elysia()
    .use(cors({ origin: FRONTEND_URL ?? 'http://localhost:3000', credentials: true }))
    .onBeforeHandle(({ request, set }) => {
        const isDev = process.env.NODE_ENV !== 'production'
        const ip = request.headers.get('x-forwarded-for') || 'unknown'
        const now = Date.now()
        const entry = rateLimitMap.get(ip)
        
        // ขยายขีดจำกัดในสภาพแวดล้อม Development เพื่อให้สะดวกต่อการทดสอบและ Hot Reload
        const currentLimit = isDev ? 1000 : RATE_LIMIT_MAX

        if (!entry || now > entry.resetAt) {
            rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
        } else {
            entry.count++
            if (entry.count > currentLimit) {
                set.status = 429
                return { success: false, error: 'Too many requests. Please try again later.' }
            }
        }
    })
    .use(swagger({
        path: '/swagger',
        documentation: {
            info: {
                title: 'Skill Wallet API Test For Web Programming II',
                version: '1.0.0'
            },
            tags: [
                { name: 'Auth', description: 'Authentication routes' },
                { name: 'Users', description: 'User management routes' },
                { name: 'GitHub', description: 'GitHub integration routes' },
                { name: 'Skills', description: 'Skills management routes' },
                { name: 'Endorsements', description: 'Endorsement request and submit flow' },
                { name: 'Badges', description: 'Automatically minted skill badges' },
                { name: 'Export', description: 'Export portfolio as PDF' },
                { name: 'Jobs', description: 'Job board and recommendations' }
            ],
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT',
                    },
                }
            }
        }
    }))

    // Health check
    .get('/health', () => ({ status: 'ok', timestamp: new Date().toISOString() }), {
        detail: {
            tags: ['Health'],
        }
    })
    // ------------------ Routes ------------------
    .use(authRoute)
    .use(usersRoute)
    .use(skillsRoute)
    .use(endorsementsRoute)
    .use(githubRoute)
    .use(badgesRoute)
    .use(exportRoute)
    .use(jobsRoute)
    .use(aiRoute)
    .listen(process.env.PORT ?? 3000)

console.log(`Skill Wallet API running at http://localhost:${app.server?.port}`)
console.log(`Swagger UI is available at http://localhost:${app.server?.port}/swagger`)