/**
 * Custom Error Classes for API responses
 * Provides standardized error handling across the backend
 */

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message)
    this.name = 'AppError'
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, code = 'VALIDATION_ERROR') {
    super(400, message, code)
    this.name = 'ValidationError'
    Object.setPrototypeOf(this, ValidationError.prototype)
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed', code = 'AUTH_ERROR') {
    super(401, message, code)
    this.name = 'AuthenticationError'
    Object.setPrototypeOf(this, AuthenticationError.prototype)
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Not authorized', code = 'AUTHZ_ERROR') {
    super(403, message, code)
    this.name = 'AuthorizationError'
    Object.setPrototypeOf(this, AuthorizationError.prototype)
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource', code = 'NOT_FOUND') {
    super(404, `${resource} not found`, code)
    this.name = 'NotFoundError'
    Object.setPrototypeOf(this, NotFoundError.prototype)
  }
}

export class ConflictError extends AppError {
  constructor(message: string, code = 'CONFLICT') {
    super(409, message, code)
    this.name = 'ConflictError'
    Object.setPrototypeOf(this, ConflictError.prototype)
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error', code = 'INTERNAL_ERROR') {
    super(500, message, code)
    this.name = 'InternalServerError'
    Object.setPrototypeOf(this, InternalServerError.prototype)
  }
}

/**
 * Standard API Response Format
 */
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  code?: string
  meta?: {
    total?: number
    page?: number
    limit?: number
  }
}

/**
 * Helper to create standard success response
 */
export function successResponse<T>(data: T, meta?: any): ApiResponse<T> {
  return {
    success: true,
    data,
    ...(meta && { meta }),
  }
}

/**
 * Helper to create standard error response
 */
export function errorResponse(error: AppError | Error, message?: string): ApiResponse {
  if (error instanceof AppError) {
    return {
      success: false,
      error: error.message,
      code: error.code,
    }
  }

  return {
    success: false,
    error: message || error.message || 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
  }
}
