import { db, Collections } from './firebase.service'

export async function getBadgesByUser(userId: string) {
    const snap = await db.collection(Collections.BADGES)
        .where('userId', '==', userId)
        .get();

    return snap.docs
        .map(doc => ({ id: doc.id, ...doc.data() as Record<string, any> }))
        .sort((a: any, b: any) => {
            const getMs = (val: any) => {
                if (!val) return 0;
                if (typeof val.toMillis === 'function') return val.toMillis();
                if (typeof val.getTime === 'function') return val.getTime();
                if (typeof val.toDate === 'function') return val.toDate().getTime();
                if (val.seconds !== undefined) return val.seconds * 1000;
                if (val._seconds !== undefined) return val._seconds * 1000;
                const date = new Date(val);
                return isNaN(date.getTime()) ? 0 : date.getTime();
            }
            return getMs(b.unlockedAt) - getMs(a.unlockedAt);
        });
}
