import { db, Collections } from './firebase.service'
import { randomBytes } from 'crypto'

export async function getChallenges() {
    const snap = await db.collection(Collections.CHALLENGES).get();
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function createChallenge(data: { title: string, description: string, relatedSkill: string, content: string }) {
    const result = await db.collection(Collections.CHALLENGES).add({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
    });
    return { id: result.id, ...data };
}

export async function submitChallengeAttempt(userId: string, data: { challengeId: string, submissionUrl: string }) {
    const token = randomBytes(16).toString('hex');
    
    const attemptData = {
        userId,
        challengeId: data.challengeId,
        submissionUrl: data.submissionUrl,
        status: 'pending_verification',
        verifyToken: token,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const result = await db.collection(Collections.CHALLENGE_ATTEMPTS).add(attemptData);
    
    return { id: result.id, verifyLinkToken: token, ...attemptData };
}

export async function getAttemptByToken(token: string) {
    const snap = await db.collection(Collections.CHALLENGE_ATTEMPTS)
        .where('verifyToken', '==', token)
        .where('status', '==', 'pending_verification')
        .limit(1)
        .get();

    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...(snap.docs[0].data() as any) };
}

export async function verifyChallengeAttempt(attemptId: string, verifiedByUserId: string, comments: string = '') {
    const attemptRef = db.collection(Collections.CHALLENGE_ATTEMPTS).doc(attemptId);
    const attemptDoc = await attemptRef.get();

    if (!attemptDoc.exists) {
        throw new Error('Attempt not found');
    }

    const data = attemptDoc.data()!;
    if (data.status !== 'pending_verification') {
        throw new Error('This attempt has already been completely verified or rejected');
    }

    // 1. Mark as verified
    await attemptRef.update({
        status: 'verified',
        verifiedBy: verifiedByUserId,
        comments,
        verifiedAt: new Date(),
        updatedAt: new Date()
    });

    // 2. Fetch challenge data to get the relatedSkill
    const challengeDoc = await db.collection(Collections.CHALLENGES).doc(data.challengeId).get();
    const challengeData = challengeDoc.data();
    
    // 3. Mint a Badge
    if (challengeData) {
        const badgeData = {
            userId: data.userId,
            name: `${challengeData.relatedSkill} Certified`,
            description: `Verified completion of challenge: ${challengeData.title}`,
            imageUrl: `/badges/${challengeData.relatedSkill.toLowerCase().replace(/\\s+/g, '-')}-badge.png`,
            category: 'skill',
            unlockedAt: new Date(),
        }

        await db.collection(Collections.BADGES).add(badgeData);

        // Also add logic to increment user's skill count or endorsement counts if needed
        // For now, granting the Badge directly satisfies the feature requirement!
    }

    return { success: true };
}
