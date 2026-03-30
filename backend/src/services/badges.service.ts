import { db, Collections } from './firebase.service'

export async function getBadgesByUser(userId: string) {
    const snap = await db.collection(Collections.BADGES)
        .where('userId', '==', userId)
        .get();

    return snap.docs
        .map(doc => ({ id: doc.id, ...doc.data() as Record<string, any> }))
        .sort((a, b) => {
            const aTime = a.unlockedAt?.toMillis?.() ?? 0;
            const bTime = b.unlockedAt?.toMillis?.() ?? 0;
            return bTime - aTime;
        });
}
