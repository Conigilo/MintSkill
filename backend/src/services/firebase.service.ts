import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'
import * as path from 'path'

/**
 * Initialize Firebase Admin SDK with service account credentials
 * Uses environment variable FIREBASE_SERVICE_ACCOUNT_PATH
 */
if (!getApps().length) {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH

    let serviceAccount: any

    if (serviceAccountJson) {
        try {
            serviceAccount = JSON.parse(serviceAccountJson)
            console.log('✓ Firebase Admin using service account JSON from environment variable')
        } catch (e: any) {
            throw new Error(`Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON environment variable: ${e.message}`)
        }
    } else if (serviceAccountPath) {
        // Resolve to absolute path
        const absolutePath = path.resolve(process.cwd(), serviceAccountPath)

        // Read JSON file using Bun.file() for better performance
        const serviceAccountFile = Bun.file(absolutePath)

        if (!await serviceAccountFile.exists()) {
            throw new Error(`Service account file not found at: ${absolutePath}`)
        }

        serviceAccount = await serviceAccountFile.json()
    } else {
        throw new Error(
            'Neither FIREBASE_SERVICE_ACCOUNT_JSON nor FIREBASE_SERVICE_ACCOUNT_PATH environment variables are set.\n' +
            'Please configure Firebase Admin credentials.'
        )
    }

    initializeApp({ credential: cert(serviceAccount) })
    console.log('✓ Firebase Admin initialized successfully')
}

export const db = getFirestore()
export const auth = getAuth()
export { FieldValue }

/**
 * Firestore collection name constants
 */
export const Collections = {
    USERS: 'users',
    SKILLS: 'skills',
    ENDORSEMENTS: 'endorsements',
    GITHUB_REPOS: 'github_repos',
    EXPORT_TOKENS: 'export_tokens',
    BADGES: 'badges',
    JOBS: 'jobs',
    CHALLENGES: 'challenges',
    CHALLENGE_ATTEMPTS: 'challenge_attempts',
    APPLICATIONS: 'applications',
} as const

/**
 * Get document by ID from collection
 * Returns null if document doesn't exist
 */
export async function getDoc<T>(collection: string, id: string): Promise<T | null> {
    const snapshot = await db.collection(collection).doc(id).get()

    if (!snapshot.exists) {
        return null
    }

    return { id: snapshot.id, ...snapshot.data() } as T
}

/**
 * Query documents with multiple where clauses
 */
export async function queryDocs<T>(
    collection: string,
    filters: [string, FirebaseFirestore.WhereFilterOp, any][]
): Promise<T[]> {
    let query: FirebaseFirestore.Query = db.collection(collection)

    for (const [field, operator, value] of filters) {
        query = query.where(field, operator, value)
    }

    const snapshot = await query.get()

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as T)
}

/**
 * Increment a numeric field by the specified amount
 */
export async function incrementField(collection: string, id: string, field: string, by = 1) {
    await db.collection(collection).doc(id).update({
        [field]: FieldValue.increment(by),
    })
}