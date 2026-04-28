import * as AuthService from '../services/auth.service'
import { validateRequiredString } from '../utils/validators'
import { ValidationError } from '../utils/errors'

/**
 * Handle GitHub OAuth callback
 */
export async function githubCallbackHandler({ body, set }: any) {
    try {
        const code = validateRequiredString(body.code, 'Authorization code')
        const result = await AuthService.githubCallback(code)
        
        return { 
            success: true,
            data: result 
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
        set.status = 500
        return { 
            success: false,
            error: error.message,
            code: 'OAUTH_ERROR'
        }
    }
}

/**
 * Verify Firebase token from Authorization header
 */
export async function verifyTokenHandler({ headers, set }: any) {
    try {
        const authHeader = headers['authorization'] || ''
        const result = await AuthService.verifyFirebaseToken(authHeader)
        
        if (!result.valid) {
            set.status = 401
        }
        
        return { 
            success: result.valid,
            data: result 
        }
    } catch (error: any) {
        set.status = 401
        return { 
            success: false,
            error: 'Invalid token',
            code: 'TOKEN_INVALID'
        }
    }
}

/**
 * Handle user logout and token revocation
 */
export async function logoutHandler({ headers, set }: any) {
    try {
        const result = await AuthService.logout(headers['authorization'])
        return { 
            success: true,
            data: result 
        }
    } catch (error: any) {
        set.status = 500
        return { 
            success: false,
            error: error.message,
            code: 'LOGOUT_ERROR'
        }
    }
}

/**
 * Handle Email Login
 */
export async function loginHandler({ body, set }: any) {
    try {
        const { email } = body
        
        if (!email) {
            set.status = 400
            return { success: false, error: 'กรุณากรอก Email' }
        }

        const result = await AuthService.loginWithEmail(email)
        
        return { 
            success: true,
            data: result 
        }
    } catch (error: any) {
        set.status = 401
        return { 
            success: false, 
            error: error.message 
        }
    }
}
