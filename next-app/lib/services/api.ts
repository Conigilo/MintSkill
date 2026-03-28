import { auth } from '../utils/firebase'; 

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
    const user = auth.currentUser;
    let token = "";

    if (user) {
        token = await user.getIdToken();
    }

    const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        const message = data?.message || `API Error: ${response.status}`;
        const errorMessage = String(message) as string;
        throw new Error(errorMessage);
    }

    return data;
};