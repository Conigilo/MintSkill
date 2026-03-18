import { Elysia } from 'elysia';
import * as EndorsementsController from '../controllers/endorsements.controller';

export const endorsementsRoute = new Elysia({ prefix: '/endorsements', tags: ['Endorsements'] })

    // ⚠️  Static routes (/request, /verify/:token, /submit/:token)
    // ต้องประกาศก่อน dynamic route (/:userId) เสมอ
    // ไม่งั้น Elysia จะส่ง "request" / "verify" ไปชน /:userId แทน

    // POST /endorsements/request
    .post('/request', EndorsementsController.requestEndorsementHandler, {
        detail: {
            summary: 'Request Endorsement',
            description: 'สร้าง link สำหรับให้คนมา endorse (ต้อง login)',
            security: [{ bearerAuth: [] }],
        }
    })

    // GET /endorsements/verify/:token — public
    .get('/verify/:token', EndorsementsController.verifyTokenHandler, {
        detail: {
            summary: 'Verify Endorsement Token',
            description: 'เช็คว่า token ยังใช้งานได้ไหม พร้อมดึง availableSkills (ไม่ต้อง login)',
        }
    })

    // POST /endorsements/submit/:token — public
    .post('/submit/:token', EndorsementsController.submitEndorsementHandler, {
        detail: {
            summary: 'Submit Endorsement',
            description: 'กดยืนยัน endorsement และ auto-mint badge ถ้าครบ 3 เสียง (ไม่ต้อง login)',
        }
    })

    // GET /endorsements/:userId — ต้องอยู่สุดท้ายเสมอ (dynamic param)
    .get('/:userId', EndorsementsController.getEndorsementsHandler, {
        detail: {
            summary: 'Get My Endorsements',
            description: 'ดึงรายการ endorsements ของตัวเอง (ต้อง login + เป็น owner เท่านั้น)',
            security: [{ bearerAuth: [] }],
        }
    });
