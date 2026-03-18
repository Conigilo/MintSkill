import { Elysia } from 'elysia';
import * as BadgesController from '../controllers/badges.controller';

export const badgesRoute = new Elysia({ prefix: '/badges', tags: ['Badges'] })
    
    // GET /badges/:userId
    .get('/:userId', BadgesController.getBadgesHandler, {
        detail: {
            summary: 'Get User Badges',
            description: 'ดึงรายการเหรียญตรา (Badges) ที่ผู้ใช้นั้นได้รับ (ไม่ต้อง login)',
        }
    });
