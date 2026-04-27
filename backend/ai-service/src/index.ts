import { Elysia, t } from 'elysia'
import { cors } from '@elysiajs/cors'
import { GoogleGenerativeAI } from "@google/generative-ai"

const app = new Elysia()
    .use(cors())
    .post('/generate-quiz', async ({ body, set }) => {
        const { skillName, level } = body
        const apiKey = process.env.GEMINI_API_KEY

        if (!apiKey) {
            set.status = 500
            return { error: "GEMINI_API_KEY not configured in AI Service" }
        }

        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({
            model: "gemini-3.1-flash-lite-preview",
            //change gemini-flash-lite-latest to gemini-3.1-flash-lite-preview when service is overloaded
            // const modelName = "gemini-flash-lite-latest";
            generationConfig: { responseMimeType: "application/json" }
        })

        let difficultyText = "Beginner (Level 1)"
        if (level === 2) difficultyText = "Intermediate (Level 2)"
        if (level === 3) difficultyText = "Advanced/Senior (Level 3)"

        const prompt = `คุณคือผู้เชี่ยวชาญด้านการสัมภาษณ์งานสาย Technical (Expert Technical Interviewer)
            จงสร้างแบบทดสอบปรนัย (Multiple-choice Quiz) เกี่ยวกับเรื่อง "${skillName}"
            กลุ่มเป้าหมาย: นักพัฒนาซอฟต์แวร์ระดับ ${difficultyText}
            จำนวนข้อ: ทั้งหมด 10 ข้อ
            ภาษาที่ใช้: ภาษาไทย โดยทับศัพท์คำศัพท์เฉพาะทางด้าน Programming เป็นภาษาอังกฤษตามความเหมาะสม

            จงส่งคืนผลลัพธ์ในรูปแบบ Array ของ JSON objects ตามโครงสร้างนี้เท่านั้น:
            [
              {
                "q": "ข้อความคำถาม?",
                "opts": ["ตัวเลือก 1", "ตัวเลือก 2", "ตัวเลือก 3", "ตัวเลือก 4"],
                "a": 0,
                "explanation": "คำอธิบายเฉลยสั้นๆ ว่าทำไมข้อนี้ถึงถูกหรือทำไมข้อนี้ถึงผิด"
              }
            ]`
        // //if server cant load we use mock data for testing
        // const mockData = [
        //     {
        //         "q": "ข้อความคำถาม?",
        //         "opts": ["ตัวเลือก 1", "ตัวเลือก 2", "ตัวเลือก 3", "ตัวเลือก 4"],
        //         "a": 0,
        //         "explanation": "คำอธิบายเฉลยสั้นๆ ว่าทำไมข้อนี้ถึงถูกหรือทำไมข้อนี้ถึงผิด"
        //     }
        // ]
        try {
            const result = await model.generateContent(prompt)
            const text = result.response.text()
            return JSON.parse(text)
        } catch (error: any) {
            set.status = 500
            return { error: error.message }
        }
    }, {
        body: t.Object({
            skillName: t.String(),
            level: t.Number()
        })
    })
    .get('/list-models', async () => {
        let apiKey = process.env.GEMINI_API_KEY || Bun.env.GEMINI_API_KEY;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (!data.models) return data;

        // ดึงมาเฉพาะชื่อ Model ที่ใช้คำสั่ง generateContent (สร้าง Quiz) ได้
        const availableModels = data.models
            .filter((m: any) => m.supportedGenerationMethods?.includes("generateContent"))
            .map((m: any) => m.name.replace('models/', '')); // ตัดคำว่า models/ ออกให้เหลือแค่ชื่อ

        return {
            total: availableModels.length,
            models: availableModels
        };
    })
    .listen(3002)

console.log(`🚀 AI Microservice READY at http://localhost:3002`)
console.log(`📌 Using GEMINI_API_KEY: ${process.env.GEMINI_API_KEY || Bun.env.GEMINI_API_KEY ? "Loaded ✅" : "Check .env ❌"}`)