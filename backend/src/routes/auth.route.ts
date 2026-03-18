import { Elysia, t } from 'elysia';
import * as AuthController from '../controllers/auth.controller';

export const authRoute = new Elysia({ prefix: '/auth', tags: ['Auth'] })

    // POST /auth/github/callback
    // รับ code จาก GitHub OAuth → แลก access token → คืน Firebase custom token
    .post('/github/callback', AuthController.githubCallbackHandler, {
        body: t.Object({ code: t.String() }),
        detail: {
            summary: 'GitHub OAuth Callback',
            description: 'รับ code จาก GitHub OAuth → แลก access token → คืน Firebase custom token',
        },
    })

    // POST /auth/verify
    // ตรวจสอบ Bearer token ว่า valid ไหม
    .post('/verify', AuthController.verifyTokenHandler, {
        detail: {
            summary: 'Verify Token',
            description: 'ตรวจสอบว่า Firebase ID token ยังใช้งานได้อยู่ (ส่ง Bearer token ใน Authorization header)',
        },
    })

    // DELETE /auth/logout
    // Revoke Firebase refresh tokens
    .delete('/logout', AuthController.logoutHandler, {
        detail: {
            summary: 'Logout',
            description: 'Revoke Firebase refresh tokens ของ user ที่ login อยู่',
            security: [{ bearerAuth: [] }],
        },
    });