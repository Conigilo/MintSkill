import { GoogleGenerativeAI } from "@google/generative-ai";

export class AiService {

    private genAI: GoogleGenerativeAI;

    constructor() {
        const apiKey = (process.env.GEMINI_API_KEY || "") as string;

        if (apiKey) {
            console.log(`AI Service: API Key detected (Starts with: ${apiKey.substring(0, 5)}...)`);
        } else {
            console.error("AI Service: GEMINI_API_KEY is EMPTY in .env!");
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
    }

    async generateQuizForSkill(skillName: string, level: number): Promise<any[]> {
        const maxRetries = 5;
        let attempt = 0;

        const model = this.genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
            }
        });

        let difficultyText = "Beginner (Level 1)";
        if (level === 2) difficultyText = "Intermediate (Level 2)";
        if (level === 3) difficultyText = "Advanced/Senior (Level 3)";

        const prompt = `คุณคือผู้เชี่ยวชาญด้านการสัมภาษณ์งานสาย Technical (Expert Technical Interviewer)
            จงสร้างแบบทดสอบปรนัย (Multiple-choice Quiz) เกี่ยวกับเรื่อง "${skillName}"
            กลุ่มเป้าหมาย: นักพัฒนาซอฟต์แวร์ระดับ ${difficultyText}
            จำนวนข้อ: ทั้งหมด 10 ข้อ
            ภาษาที่ใช้: ภาษาไทย โดยทับศัพท์คำศัพท์เฉพาะทางด้าน Programming เป็นภาษาอังกฤษตามความเหมาะสม

            ข้อกำหนดเนื้อหา:
            - คำถามต้องมีความเป็นมืออาชีพ วัดความเข้าใจเชิงลึก (Conceptual & Practical) ไม่ใช่แค่การจำนิยาม
            - ตัวเลือก (Options) ต้องมีความใกล้เคียงกันเพื่อทดสอบความแม่นยำ

            จงส่งคืนผลลัพธ์ในรูปแบบ Array ของ JSON objects ตามโครงสร้างนี้เท่านั้น (ห้ามมีคำเกริ่นนำ):
            [
            {
                "q": "ข้อความคำถาม?",
                "opts": ["ตัวเลือก 1", "ตัวเลือก 2", "ตัวเลือก 3", "ตัวเลือก 4"],
                "a": 0 // Index ของคำตอบที่ถูกต้อง (0-3)
            }
            ]`;

        while (attempt < maxRetries) {
            try {
                const result = await model.generateContent(prompt);
                const response = result.response;
                const text = response.text();

                // แปลง String โค้ด JSON ให้กกลายเป็น Object
                return JSON.parse(text);

            } catch (error: any) {
                attempt++;
                console.error(`AI Generation Error (Attempt ${attempt}/${maxRetries}):`, error?.message || error);

                if (attempt >= maxRetries) {
                    throw new Error("Failed to generate quiz from AI after multiple attempts.");
                }

                // รอเวลาแบบ Exponential backoff: 1000ms, 2000ms, 4000ms...
                const delayMs = Math.pow(2, attempt - 1) * 1000;
                console.log(`Waiting ${delayMs}ms before retrying...`);
                await new Promise(resolve => setTimeout(resolve, delayMs));
            }
        }

        return [];
    }
}

export const aiService = new AiService();
