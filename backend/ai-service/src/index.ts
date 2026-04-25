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
            model: "gemini-1.5-flash",
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
                "a": 0
              }
            ]`

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
    .listen(3001)

console.log(`🤖 AI Microservice running at http://localhost:3001`)
