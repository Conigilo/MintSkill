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

const app = new Elysia()
    .use(cors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:8000', credentials: true }))
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
                { name: 'Export', description: 'Export portfolio as PDF' }
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

    .listen(process.env.PORT ?? 3000)

console.log(`Skill Wallet API running at http://localhost:${app.server?.port}`)
console.log(`Swagger UI is available at http://localhost:${app.server?.port}/swagger`)