import { fetchAPI } from './api';

export interface Challenge {
    id: string;
    title: string;
    description: string;
    relatedSkill: string;
    content: string;
    createdAt?: any;
    updatedAt?: any;
}

export interface ChallengeAttempt {
    id?: string;
    challengeId: string;
    submissionUrl: string;
    status?: string;
    verifyToken?: string;
}

export const getChallenges = async (): Promise<{ success: boolean; data?: Challenge[]; error?: string }> => {
    return fetchAPI('/challenges');
};

export const createChallenge = async (data: Omit<Challenge, 'id'>): Promise<{ success: boolean; data?: Challenge; error?: string }> => {
    return fetchAPI('/challenges', {
        method: 'POST',
        body: JSON.stringify(data),
    });
};

export const submitChallengeAttempt = async (challengeId: string, submissionUrl: string): Promise<{ success: boolean; data?: ChallengeAttempt; error?: string }> => {
    return fetchAPI('/challenges/submit', {
        method: 'POST',
        body: JSON.stringify({ challengeId, submissionUrl }),
    });
};

export const verifyAttemptInfo = async (token: string): Promise<{ success: boolean; data?: any; error?: string }> => {
    return fetchAPI(`/challenges/verify-info/${token}`);
};

export const verifyAttempt = async (token: string, comments: string): Promise<{ success: boolean; error?: string }> => {
    return fetchAPI(`/challenges/verify/${token}`, {
        method: 'POST',
        body: JSON.stringify({ comments }),
    });
};
