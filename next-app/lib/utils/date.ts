/**
 * Shared utility: Date formatting helpers
 * ย้ายมาจาก EndorsementsTab.tsx เพื่อให้ใช้ร่วมกันได้ทุก component
 */

/**
 * แปลงค่าวันที่หลายรูปแบบ (Date, Firestore Timestamp, epoch, etc.) เป็นข้อความ "...ที่แล้ว"
 * รองรับ:
 * - Date object
 * - Firestore Timestamp (.toDate(), ._seconds, .seconds)
 * - Unix timestamp (number)
 * - Date string
 */
export function timeAgo(dateVal: unknown): string {
  if (!dateVal) return 'ไม่ระบุเวลา'

  let date: Date

  if (dateVal instanceof Date) {
    date = dateVal
  } else if (typeof dateVal === 'object' && dateVal !== null && 'toDate' in dateVal && typeof (dateVal as any).toDate === 'function') {
    date = (dateVal as any).toDate()
  } else if (typeof dateVal === 'number') {
    date = new Date(dateVal)
  } else if (typeof dateVal === 'object' && dateVal !== null && '_seconds' in dateVal) {
    date = new Date((dateVal as any)._seconds * 1000)
  } else if (typeof dateVal === 'object' && dateVal !== null && 'seconds' in dateVal) {
    date = new Date((dateVal as any).seconds * 1000)
  } else {
    date = new Date(dateVal as string | number)
  }

  if (isNaN(date.getTime())) return 'วันที่ไม่ถูกต้อง'

  const diff = Math.floor((Date.now() - date.getTime()) / 1000)
  if (diff < 60) return 'เมื่อกี้'
  if (diff < 3600) return `${Math.floor(diff / 60)} นาทีที่แล้ว`
  if (diff < 86400) return `${Math.floor(diff / 3600)} ชั่วโมงที่แล้ว`
  if (diff < 2592000) return `${Math.floor(diff / 86400)} วันที่แล้ว`

  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * Format Date เป็นวันที่ภาษาไทยแบบสั้น เช่น "24 พ.ค. 2026"
 */
export function formatDateTH(dateVal: Date | string | number): string {
  const date = new Date(dateVal)
  if (isNaN(date.getTime())) return 'วันที่ไม่ถูกต้อง'
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
