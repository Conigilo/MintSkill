import { Elysia, t } from 'elysia'
import * as ExportController from '../controllers/export.controller'

export const exportRoute = new Elysia({ prefix: '/export', tags: ['Export'] })

    // POST /export/pdf — generate PDF from portfolio data
    .post('/pdf', ExportController.generatePDFHandler, {
        body: t.Object({
            profile: t.Any(),
            skills: t.Array(t.Any()),
            endorsements: t.Array(t.Any()),
        }),
        detail: {
            summary: 'Generate PDF Resume',
            description: 'สร้าง PDF จากข้อมูล portfolio (ต้อง login)',
            security: [{ bearerAuth: [] }],
        },
    })
