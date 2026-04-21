import { Elysia, t } from 'elysia'
import * as JobsController from '../controllers/jobs.controller'

export const jobsRoute = new Elysia({ prefix: '/jobs', tags: ['Jobs'] })

    // GET /jobs — List all available jobs
    .get('/', JobsController.getAllJobsHandler, {
        query: t.Object({
            location: t.Optional(t.String()),
            limit: t.Optional(t.String()),
        }),
        detail: {
            summary: 'Get All Jobs',
            description: 'ดึงรายการประกาศรับสมัครงานทั้งหมด (ไม่ต้อง login)',
        },
    })

    // GET /jobs/recommendations — Get skill-matched recommendations
    .get('/recommendations', JobsController.getRecommendationsHandler, {
        detail: {
            summary: 'Get Job Recommendations',
            description: 'ดึงรายการงานที่เหมาะสมกับสกิลที่มี (ต้อง login)',
            security: [{ bearerAuth: [] }],
        },
    })

    // GET /jobs/:id — Detailed information for a single job
    .get('/:id', JobsController.getJobByIdHandler, {
        params: t.Object({ id: t.String() }),
        detail: {
            summary: 'Get Job Detail',
            description: 'ดึงข้อมูลรายละเอียดงานรายชิ้น (ไม่ต้อง login)',
        },
    })

    // POST /jobs/:id/apply — Apply for a job
    .post('/:id/apply', JobsController.applyForJobHandler, {
        params: t.Object({ id: t.String() }),
        body: t.Object({
            coverLetter: t.Optional(t.String()),
        }),
        detail: {
            summary: 'Apply for Job',
            description: 'สมัครงาน (ต้อง login)',
            security: [{ bearerAuth: [] }],
        },
    })
