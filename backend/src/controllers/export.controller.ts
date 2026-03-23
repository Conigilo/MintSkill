import * as ExportService from '../services/pdf.service'
import { verifyToken } from '../middleware/auth.middleware'

/**
 * Generate PDF export for authenticated user
 */
export async function generatePDFHandler({ headers, body, set }: any) {
    try {
        const user = await verifyToken(headers['authorization'] || null)

        const { skills, endorsements, profile } = body as {
            skills: any[]
            endorsements: any[]
            profile: any
        }

        if (!skills || !endorsements || !profile) {
            set.status = 400
            return { error: 'Missing skills, endorsements, or profile' }
        }

        const pdfBuffer = await ExportService.generatePDF(profile, skills, endorsements)

        return { success: true, message: 'PDF generated', size: pdfBuffer.length }
    } catch (error: any) {
        if (error.message.includes('not implemented')) {
            set.status = 501
            return { error: error.message }
        }

        set.status = error.message.includes('Missing') || error.message.includes('invalid') ? 401 : 500
        return { error: error.message }
    }
}
