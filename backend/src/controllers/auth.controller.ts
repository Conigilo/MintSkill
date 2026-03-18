import * as AuthService from '../services/auth.service'

/**
 * Handle GitHub OAuth callback
 */
export async function githubCallbackHandler({ body, set }: any) {
    try {
        const result = await AuthService.githubCallback(body.code)
        return result
    } catch (error: any) {
        set.status = 500
        return { error: error.message }
    }
}

/**
 * Verify Firebase token from Authorization header
 */
export async function verifyTokenHandler({ headers, set }: any) {
    try {
        const result = await AuthService.verifyFirebaseToken(headers['authorization'])
        
        if (!result.valid) {
            set.status = 401
        }
        
        return result
    } catch {
        set.status = 401
        return { valid: false }
    }
}

/**
 * Handle user logout and token revocation
 */
export async function logoutHandler({ headers }: any) {
    return await AuthService.logout(headers['authorization'])
}
