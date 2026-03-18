import Elysia from "elysia";
import { verifyToken } from "../middleware/auth.middleware";
import { db, Collections, getDoc, queryDocs, incrementField } from "../services/firebase.service";
import { generatePDF } from "../services/pdf.service";

export const exportRoute = new Elysia({ prefix: '/api/export' })

    .post('/pdf', async ({ headers, body, set }) => {
        try {
            const user = await verifyToken(headers['authorization'] || null);
            const { skills, endorsements, profile } = body as {
                skills: any[];
                endorsements: any[];
                profile: any;
            };

            if (!skills || !endorsements || !profile) {
                set.status = 400;
                return { error: 'Missing skills, endorsements, or profile' };
            }

            const pdfBuffer = await generatePDF(profile, skills, endorsements);

            const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            await db.collection(Collections.EXPORT_TOKENS).doc(token).set({
                userId: user.uid,
                createdAt: new Date(),
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            });

            return { token };
        } catch (err: any) {
            set.status = err.message.includes('Unauthorized') ? 401 : 500;
            return { error: err.message };
        }
    });