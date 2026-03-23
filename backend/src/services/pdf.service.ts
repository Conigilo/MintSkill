/**
 * PDF Generation Service
 * TODO: Implement with a PDF library (e.g. puppeteer, @react-pdf/renderer, jsPDF)
 */

/**
 * Generate PDF buffer from portfolio data
 * Currently a placeholder — returns error until a PDF library is integrated
 */
export async function generatePDF(
    profile: any,
    skills: any[],
    endorsements: any[]
): Promise<Buffer> {
    // TODO: เลือก library แล้ว implement จริง
    // ตัวเลือก:
    //   1. puppeteer — render HTML → PDF (สวย แต่หนัก)
    //   2. jsPDF — lightweight, ใช้ได้เลย
    //   3. @react-pdf/renderer — ถ้าอยากใช้ React components

    throw new Error('PDF generation not implemented yet — coming soon!')
}
