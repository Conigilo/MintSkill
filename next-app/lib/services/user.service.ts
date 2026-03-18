// next-app/lib/services/user.service.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

/**
 * 1. ฟังก์ชันดึงข้อมูลโปรไฟล์ผู้ใช้
 * @param token - Firebase ID Token ที่ได้จาก auth.currentUser.getIdToken()
 */
export async function getUserProfile(token: string) {
    try {
        const response = await fetch(`${API_URL}/users/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'ดึงข้อมูลโปรไฟล์ไม่สำเร็จ');
        }

        return await response.json(); // จะได้ข้อมูล { name, email, skills, ... }
    } catch (error) {
        console.error("Error in getUserProfile:", error);
        throw error;
    }
}

/**
 * 2. ฟังก์ชันดึงข้อมูลโปรเจกต์ (หรือ Skill Badges) ของผู้ใช้
 */
export async function getUserProjects(token: string) {
    const response = await fetch(`${API_URL}/users/projects`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) throw new Error('ไม่สามารถโหลดโปรเจกต์ได้');
    return await response.json();
}
