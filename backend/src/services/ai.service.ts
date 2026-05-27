export class AiService {
    private MICROSERVICE_URL = "http://localhost:3001";

    async generateQuizForSkill(skillName: string, level: number): Promise<any[]> {
        try {
            console.log(`[Microservice Call] Requesting quiz from AI Service for: ${skillName}`);
            
            const response = await fetch(`${this.MICROSERVICE_URL}/generate-quiz`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ skillName, level })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || "Failed to fetch from AI Microservice");
            }

            return await response.json();
        } catch (error: any) {
            console.error("AI Service Error (via Microservice):", error.message);
            throw new Error("ระบบ AI ขัดข้องชั่วคราว กรุณาลองใหม่อีกครั้ง");
        }
    }

    async generateRoadmapForSkill(skillName: string, myLevel: number, targetLevel: number): Promise<any[]> {
        try {
            console.log(`[Microservice Call] Requesting roadmap from AI Service for: ${skillName}`);
            
            const response = await fetch(`${this.MICROSERVICE_URL}/generate-roadmap`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ skillName, myLevel, targetLevel })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || "Failed to fetch roadmap from AI Microservice");
            }

            return await response.json();
        } catch (error: any) {
            console.error("AI Service Error (Roadmap via Microservice):", error.message);
            throw new Error("ระบบ AI ขัดข้องชั่วคราว ไม่สามารถสร้างโรดแมปได้ในขณะนี้");
        }
    }

    async generateProjectDescription(projectName: string, language?: string, description?: string): Promise<string[]> {
        try {
            console.log(`[Microservice Call] Requesting project description from AI Service for: ${projectName}`);
            
            const response = await fetch(`${this.MICROSERVICE_URL}/generate-project-description`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectName, language, description })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || "Failed to fetch project description from AI Microservice");
            }

            return await response.json();
        } catch (error: any) {
            console.error("AI Service Error (Project Description via Microservice):", error.message);
            throw new Error("ระบบ AI ขัดข้องชั่วคราว ไม่สามารถสร้างรายละเอียดโปรเจกต์ได้ในขณะนี้");
        }
    }
}

export const aiService = new AiService();
