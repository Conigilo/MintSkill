/**
 * Validation Utilities - Reusable validation functions
 * Provides consistent input validation across controllers
 */

import { ValidationError } from './errors'

/**
 * Validate required string field
 */
export function validateRequiredString(
  value: any,
  fieldName: string,
  minLength = 1,
  maxLength = 255
): string {
  if (!value || typeof value !== 'string' || value.trim().length === 0) {
    throw new ValidationError(`${fieldName} is required`)
  }

  const trimmed = value.trim()

  if (trimmed.length < minLength) {
    throw new ValidationError(
      `${fieldName} must be at least ${minLength} character${minLength !== 1 ? 's' : ''}`
    )
  }

  if (trimmed.length > maxLength) {
    throw new ValidationError(
      `${fieldName} must not exceed ${maxLength} characters`
    )
  }

  return trimmed
}

/**
 * Validate optional string field
 */
export function validateOptionalString(
  value: any,
  fieldName: string,
  maxLength = 255
): string | undefined {
  if (value === null || value === undefined || value === '') {
    return undefined
  }

  if (typeof value !== 'string') {
    throw new ValidationError(`${fieldName} must be a string`)
  }

  const trimmed = value.trim()

  if (trimmed.length > maxLength) {
    throw new ValidationError(
      `${fieldName} must not exceed ${maxLength} characters`
    )
  }

  return trimmed.length === 0 ? undefined : trimmed
}

/**
 * Validate email format
 */
export function validateEmail(email: string): string {
  const trimmed = validateRequiredString(email, 'Email')
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailRegex.test(trimmed)) {
    throw new ValidationError('Invalid email format')
  }

  return trimmed
}

/**
 * Validate enum value
 */
export function validateEnum<T extends readonly string[]>(
  value: any,
  allowedValues: T,
  fieldName: string
): T[number] {
  if (!allowedValues.includes(value as any)) {
    throw new ValidationError(
      `${fieldName} must be one of: ${allowedValues.join(', ')}`
    )
  }

  return value
}

/**
 * Validate number in range
 */
export function validateNumberRange(
  value: any,
  fieldName: string,
  min: number,
  max: number
): number {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new ValidationError(`${fieldName} must be a number`)
  }

  if (value < min || value > max) {
    throw new ValidationError(
      `${fieldName} must be between ${min} and ${max}`
    )
  }

  return value
}

/**
 * Validate skill input
 */
export function validateSkillInput(body: any): {
  name: string
  category: string
  level?: number
  verified?: boolean
} {
  const name = validateRequiredString(body.name, 'Skill name', 1, 100)
  const category = validateRequiredString(body.category, 'Category', 1, 50)
  const level = body.level
    ? validateNumberRange(body.level, 'Level', 1, 5)
    : undefined
  const verified = typeof body.verified === 'boolean' ? body.verified : undefined

  return { name, category, level, verified }
}

/**
 * Validate endorsement input
 */
export function validateEndorsementInput(body: any): {
  message: string
  skills: string[]
  fromName: string
  fromRole?: string
  fromAvatarUrl?: string
  fromUserId?: string
} {
  const message = validateRequiredString(body.message, 'Endorsement message', 1, 500)
  const fromName = validateRequiredString(body.fromName, 'Your name', 1, 100)
  const fromRole = validateOptionalString(body.fromRole, 'Your role', 100)
  const fromAvatarUrl = validateOptionalString(body.fromAvatarUrl, 'Avatar URL', 500)
  const fromUserId = validateOptionalString(body.fromUserId, 'From User ID', 100)

  if (!Array.isArray(body.skills) || body.skills.length === 0) {
    throw new ValidationError('At least one skill is required')
  }
  if (body.skills.length > 10) {
    throw new ValidationError('Cannot endorse more than 10 skills at once')
  }
  const skills = body.skills.map((s: any) => validateRequiredString(s, 'Skill name', 1, 100))

  return { message, skills, fromName, fromRole, fromAvatarUrl, fromUserId }
}

/**
 * Validate profile update input
 */
export function validateProfileUpdateInput(body: any): {
  displayName?: string
  bio?: string
  location?: string
  portfolio?: string
  headline?: string
} {
  return {
    displayName: validateOptionalString(body.displayName, 'Display name', 100),
    bio: validateOptionalString(body.bio, 'Bio', 500),
    location: validateOptionalString(body.location, 'Location', 100),
    portfolio: validateOptionalString(body.portfolio, 'Portfolio URL', 255),
    headline: validateOptionalString(body.headline, 'Headline', 200),
  }
}

/**
 * Validate job application input
 */
export function validateJobApplicationInput(body: any): {
  jobId: string
  coverLetter?: string
} {
  const jobId = validateRequiredString(body.jobId, 'Job ID', 1, 100)
  const coverLetter = validateOptionalString(
    body.coverLetter,
    'Cover letter',
    2000
  )

  return { jobId, coverLetter }
}
