import { Elysia, t } from 'elysia'
import * as GitHubController from '../controllers/github.controller'

export const githubRoute = new Elysia({ prefix: '/github', tags: ['GitHub'] })

    // POST /github/connect — Save GitHub access token
    .post('/connect', GitHubController.connectGitHubHandler, {
        body: t.Object({
            token: t.String()
        }),
        detail: {
            summary: 'Connect GitHub Account',
            description: 'บันทึก GitHub access token ของ user (ต้อง login)',
            security: [{ bearerAuth: [] }],
        },
    })

    // POST /github/sync — sync repos + contributions + auto-detect skills
    .post('/sync', GitHubController.syncGitHubHandler, {
        detail: {
            summary: 'Sync GitHub Data',
            description: 'ดึง repos + contributions จาก GitHub แล้ว auto-detect skills จาก languages',
            security: [{ bearerAuth: [] }],
        },
    })

    // GET /github/repos — list synced repos
    .get('/repos', GitHubController.getReposHandler, {
        detail: {
            summary: 'Get GitHub Repos',
            description: 'ดึง repos ที่ sync ไว้แล้ว เรียงตาม stars',
            security: [{ bearerAuth: [] }],
        },
    })

    // GET /github/dashboard — ข้อมูลทั้งหมดสำหรับ dashboard
    .get('/dashboard', GitHubController.getDashboardHandler, {
        detail: {
            summary: 'Get Dashboard Data',
            description: 'ดึงข้อมูลครบในครั้งเดียว: profile + github stats + skills + repos + endorsements',
            security: [{ bearerAuth: [] }],
        },
    })