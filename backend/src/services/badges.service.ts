import { db, Collections } from './firebase.service'

export async function getBadgesByUser(userId: string) {
    const snap = await db.collection(Collections.BADGES)
        .where('userId', '==', userId)
        .orderBy('unlockedAt', 'desc')
        .get();

    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
