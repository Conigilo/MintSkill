import * as ExportService from '../services/pdf.service'
import { verifyToken } from '../middleware/auth.middleware'
import { ValidationError, AuthenticationError } from '../utils/errors'

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
        
        if (!skills || !Array.isArray(skills)) {
            throw new ValidationError('skills must be an array')
        }
        if (!endorsements || !Array.isArray(endorsements)) {
            throw new ValidationError('endorsements must be an array')
        }
        if (!profile || typeof profile !== 'object') {
            throw new ValidationError('profile is required and must be an object')
        }

        const pdfBuffer = await ExportService.generatePDF(profile, skills, endorsements)

        return { 
            success: true,
            data: { 
                message: 'PDF generated successfully',
                size: pdfBuffer.length
            }
        }
    } catch (error: any) {
        if (error instanceof ValidationError) {
            set.status = 400
            return { 
                success: false,
                error: error.message,
                code: error.code
            }
        }
        if (error instanceof AuthenticationError) {
            set.status = 401
            return { 
                success: false,
                error: error.message,
                code: error.code
            }
        }
        if (error.message.includes('not implemented')) {
            set.status = 501
            return { 
                success: false,
                error: error.message,
                code: 'NOT_IMPLEMENTED'
            }
        }

        set.status = 500
        return { 
            success: false,
            error: error.message,
            code: 'INTERNAL_ERROR'
        }
    }
}
