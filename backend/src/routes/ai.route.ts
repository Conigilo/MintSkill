import { Elysia, t } from 'elysia';
import * as AiController from '../controllers/ai.controller';

export const aiRoute = new Elysia({ prefix: '/ai', tags: ['AI'] })
    .post('/genQuiz', AiController.generateQuizHandler, {
        body: t.Object({
            skillName: t.String(),
            level: t.Optional(t.Number({ minimum: 1, maximum: 3 })),
        }),
        detail: {
            summary: 'Generate Quiz by AI',
            description: 'สร้างข้อสอบแบบสุ่มจาก Gemini AI ตามทักษะและระดับ',
        },
    });
