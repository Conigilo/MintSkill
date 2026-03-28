import { Elysia, t } from 'elysia';
import * as SkillsController from '../controllers/skills.controller';

export const skillsRoute = new Elysia({ prefix: '/skills', tags: ['Skills'] })

    // GET /skills/me
    .get('/me', SkillsController.getMySkillsHandler, {
        detail: {
            summary: 'Get My Skills',
            description: 'ดึง skills ของ user ที่กําลัง login อยู่ (ต้องส่ง Bearer token)',
            security: [{ bearerAuth: [] }],
        },
    })

    // GET /skills/:userId
    .get('/:userId', SkillsController.getSkillsHandler, {
        detail: {
            summary: 'Get User Skills',
            description: 'ดึง skills ทั้งหมดของ user (ไม่ต้อง login)',
        },
    })

    // POST /skills 
    .post('/', SkillsController.addSkillHandler, {
        body: t.Object({
            name: t.String(),
            category: t.String(),
            level: t.Optional(t.Number({ minimum: 1, maximum: 5 })),
        }),
        detail: {
            summary: 'Add Skill',
            description: 'เพิ่ม skill ใหม่ (ต้อง login)',
            security: [{ bearerAuth: [] }],
        },
    })

    // PUT /skills/:skillId
    .put('/:skillId', SkillsController.updateSkillHandler, {
        body: t.Object({
            name: t.Optional(t.String()),
            category: t.Optional(t.String()),
            level: t.Optional(t.Number({ minimum: 1, maximum: 5 })),
        }),
        detail: {
            summary: 'Update Skill',
            description: 'แก้ไข skill (ต้อง login + เป็นเจ้าของ)',
            security: [{ bearerAuth: [] }],
        },
    })

    // DELETE /skills/:skillId
    .delete('/:skillId', SkillsController.deleteSkillHandler, {
        detail: {
            summary: 'Delete Skill',
            description: 'ลบ skill (ต้อง login + เป็นเจ้าของ)',
            security: [{ bearerAuth: [] }],
        },
    });
