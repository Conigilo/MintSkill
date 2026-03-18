import { auth } from '../services/firebase.service';

export interface AuthUser {
    uid: string;
    email?: string;
}

/**
 * Verify Firebase ID Token from Authorization header
 * Returns decoded token or throws error
 */
export async function verifyToken(authHeader: string | null): Promise<AuthUser> {
    if (!authHeader?.startsWith('Bearer ')) {
        throw new Error('Missing or invalid Authorization header');
    }

    const token = authHeader.split(' ')[1];
    const decoded = await auth.verifyIdToken(token);

    return {
        uid: decoded.uid,
        email: decoded.email,
    };
}
