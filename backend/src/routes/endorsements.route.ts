import { Elysia } from 'elysia';
import * as EndorsementsController from '../controllers/endorsements.controller';

export const endorsementsRoute = new Elysia({ prefix: '/endorsements', tags: ['Endorsements'] })
    // POST /endorsements/request
    .post('/request', EndorsementsController.requestEndorsementHandler, {
        detail: {
            summary: 'Request Endorsement',
            description: 'สร้าง link สำหรับให้คนมา endorse (ต้อง login)',
            security: [{ bearerAuth: [] }],
        }
    })

    // POST /endorsements/direct — logged-in user endorses another user directly
    .post('/direct', EndorsementsController.directEndorseHandler, {
        detail: {
            summary: 'Direct Endorse',
            description: 'ผู้ใช้ที่ login แล้ว endorse user อื่นได้โดยตรง (ต้อง login)',
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

    // GET /endorsements/sent/:userId
    .get('/sent/:userId', EndorsementsController.getSentEndorsementsHandler, {
        detail: {
            summary: 'Get Sent Endorsements',
            description: 'ดึงรายการ endorsements ที่เราส่งให้คนอื่น (ต้อง login)',
            security: [{ bearerAuth: [] }],
        }
    })

    // POST /endorsements/request/direct — request endorsement from another user directly
    .post('/request/direct', EndorsementsController.createDirectRequestHandler, {
        detail: {
            summary: 'Request Direct Endorsement',
            description: 'ส่งคำขอการรับรองตรงถึงผู้ใช้อื่นในระบบ (ต้อง login)',
            security: [{ bearerAuth: [] }],
        }
    })

    // GET /endorsements/pending-requests — get pending requests sent to current user
    .get('/pending-requests', EndorsementsController.getPendingRequestsHandler, {
        detail: {
            summary: 'Get Pending Requests',
            description: 'ดึงรายการคำขอการรับรองทักษะทั้งหมดที่ค้างส่งถึงเรา (ต้อง login)',
            security: [{ bearerAuth: [] }],
        }
    })

    // POST /endorsements/approve/:requestId — approve a pending request
    .post('/approve/:requestId', EndorsementsController.approveRequestHandler, {
        detail: {
            summary: 'Approve Endorsement Request',
            description: 'กดยืนยันการรับรองให้เพื่อนจากคำขอ (ต้อง login)',
            security: [{ bearerAuth: [] }],
        }
    })

    // POST /endorsements/decline/:requestId — decline/delete a pending request
    .post('/decline/:requestId', EndorsementsController.declineRequestHandler, {
        detail: {
            summary: 'Decline Endorsement Request',
            description: 'ปฏิเสธหรือลบคำขอการรับรองทักษะออกจากระบบ (ต้อง login)',
            security: [{ bearerAuth: [] }],
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
