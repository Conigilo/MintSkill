import { Elysia, t } from 'elysia';
import * as AiController from '../controllers/ai.controller';

export const aiRoute = new Elysia({ prefix: '/ai', tags: ['AI'] })
    .post('/genQuiz', AiController.generateQuizHandler, {
        body: t.Object({
            skillName: t.String(),
            level: t.Optional(t.Number({ minimum: 0, maximum: 5 })),
        }),
        detail: {
            summary: 'Generate Quiz by AI',
            description: 'สร้างข้อสอบแบบสุ่มจาก Gemini AI ตามทักษะและระดับ',
        },
    })
    .get('/models', async () => {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const data = await response.json();
        return data;
    }, {
        detail: {
            summary: 'Get AI Models',
            description: 'ดึงรายการ AI Models ที่ใช้งานได้',
        },
    })
    .post('/roadmap', AiController.generateRoadmapHandler, {
        body: t.Object({
            skillName: t.String(),
            myLevel: t.Number(),
            targetLevel: t.Number()
        }),
        detail: {
            summary: 'Generate Learning Roadmap by AI',
            description: 'สร้างแผนการเรียนรู้ 4 สัปดาห์จาก AI ตามระดับปัจจุบันและเป้าหมาย',
        }
    })
    .get('/roadmap/:skillName', AiController.getRoadmapHandler, {
        detail: {
            summary: 'Get Saved Learning Roadmap',
            description: 'ดึงแผนการเรียนรู้ที่บันทึกไว้ในระบบ',
        }
    })
    .patch('/roadmap/:skillName/task', AiController.updateRoadmapTaskHandler, {
        body: t.Object({
            weekIndex: t.Number(),
            taskIndex: t.Number(),
            completed: t.Boolean()
        }),
        detail: {
            summary: 'Update Task Completion Status',
            description: 'อัปเดตความคืบหน้าของภารกิจเรียนรู้ในโรดแมป',
        }
    })

