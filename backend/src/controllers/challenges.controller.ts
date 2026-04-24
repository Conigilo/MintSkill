// import { verifyToken } from '../middleware/auth.middleware'
// import { validateRequiredString } from '../utils/validators'
// import { AuthenticationError } from '../utils/errors'

// export async function getChallengesHandler({ set }: any) {
//     try {
//         const data = await ChallengesService.getChallenges();
//         return { success: true, data }
//     } catch (error: any) {
//         set.status = 500
//         return { success: false, error: error.message }
//     }
// }

// export async function createChallengeHandler({ headers, body, set }: any) {
//     try {
//         await verifyToken(headers['authorization'] || null)
//         const title = validateRequiredString(body.title, 'Title');
//         const description = validateRequiredString(body.description, 'Description');
//         const relatedSkill = validateRequiredString(body.relatedSkill, 'Related Skill');
//         const content = body.content || '';

//         const data = await ChallengesService.createChallenge({ title, description, relatedSkill, content });
//         set.status = 201;
//         return { success: true, data }
//     } catch (error: any) {
//         set.status = error instanceof AuthenticationError ? 401 : 400
//         return { success: false, error: error.message }
//     }
// }

// export async function submitChallengeHandler({ headers, body, set }: any) {
//     try {
//         const user = await verifyToken(headers['authorization'] || null)
//         const challengeId = validateRequiredString(body.challengeId, 'Challenge ID');
//         const submissionUrl = validateRequiredString(body.submissionUrl, 'Submission URL');

//         const data = await ChallengesService.submitChallengeAttempt(user.uid, { challengeId, submissionUrl });
//         set.status = 201;
//         return { success: true, data }
//     } catch (error: any) {
//         set.status = error instanceof AuthenticationError ? 401 : 400
//         return { success: false, error: error.message }
//     }
// }

// export async function verifyTokenInfoHandler({ params, set }: any) {
//     try {
//         const data = await ChallengesService.getAttemptByToken(params.token);
//         if (!data) {
//             set.status = 404;
//             return { success: false, error: 'Invalid or expired token' }
//         }
//         return { success: true, data }
//     } catch (error: any) {
//         set.status = 500
//         return { success: false, error: error.message }
//     }
// }

// export async function verifyAttemptHandler({ headers, params, body, set }: any) {
//     try {
//         const user = await verifyToken(headers['authorization'] || null)
        
//         // Find attempt by token first
//         const attempt = await ChallengesService.getAttemptByToken(params.token);
//         if (!attempt) {
//             set.status = 404;
//             return { success: false, error: 'Invalid or expired token' }
//         }

//         // Must not be self-verifying, optionally check
//         if (attempt.userId === user.uid) {
//              set.status = 403;
//              return { success: false, error: 'Cannot verify your own challenge' }
//         }

//         await ChallengesService.verifyChallengeAttempt(attempt.id, user.uid, body.comments || '');
//         return { success: true }
//     } catch (error: any) {
//         set.status = error instanceof AuthenticationError ? 401 : 500
//         return { success: false, error: error.message }
//     }
// }
