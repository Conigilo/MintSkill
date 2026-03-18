import { Elysia, t } from 'elysia';
import * as UsersController from '../controllers/users.controller';

export const usersRoute = new Elysia({ prefix: '/users', tags: ['Users'] })

    // GET /users/me
    .get('/me', UsersController.getMyProfileHandler, {
        detail: {
            summary: 'Get My Profile',
            description: 'ดึงโปรไฟล์ของ user ที่ login อยู่ (ต้องส่ง Bearer token)',
            security: [{ bearerAuth: [] }],
        },
    })

    // PUT /users/me
    .put('/me', UsersController.updateMyProfileHandler, {
        body: t.Object({
            displayName: t.Optional(t.String()),
            title: t.Optional(t.String()),
            bio: t.Optional(t.String()),
            location: t.Optional(t.String()),
            linkedinUrl: t.Optional(t.String()),
        }),
        detail: {
            summary: 'Update My Profile',
            description: 'แก้ไขโปรไฟล์ (ส่งเฉพาะ field ที่ต้องการแก้)',
            security: [{ bearerAuth: [] }],
        },
    })

    // ⚠️ ต้องประกาศ /:username/portfolio ก่อน /:username เสมอ
    // ไม่งั้น Elysia จะ match "portfolio" เป็น :username แทน
    // GET /users/:username/portfolio — ดึงข้อมูลทั้งหมดสำหรับ Resume/CV
    .get('/:username/portfolio', UsersController.getPortfolioHandler, {
        detail: {
            summary: 'Get User Portfolio (CV/Resume data)',
            description: 'ดึงข้อมูลครบทุกอย่างใน 1 request: Profile + Skills + Badges + GitHub Repos + Endorsements',
        }
    })

    // GET /users/:username — ดูโปรไฟล์สาธารณะ (ต้องอยู่หลัง /portfolio เสมอ)
    .get('/:username', UsersController.getPublicProfileHandler, {
        params: t.Object({ username: t.String() }),
        detail: {
            summary: 'Get User Profile (Public)',
            description: 'ดูโปรไฟล์ user ตาม username (ไม่ต้อง login)',
        },
    });
