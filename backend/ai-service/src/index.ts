import { Elysia, t } from 'elysia'
import { cors } from '@elysiajs/cors'
import { GoogleGenerativeAI } from "@google/generative-ai"

function cleanJsonText(rawText: string): string {
    let cleaned = rawText.trim();
    if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```(?:json)?/g, '').replace(/```$/g, '').trim();
    }
    return cleaned;
}

const app = new Elysia()
    .use(cors())
    .get('/', () => 'Hello from AI Service! This service is responsible for generating quizzes and learning roadmaps using Google Gemini API.')
    .post('/generate-quiz', async ({ body, set }) => {
        const { skillName, level } = body
        const apiKey = process.env.GEMINI_API_KEY

        if (!apiKey) {
            set.status = 500
            return { error: "GEMINI_API_KEY not configured in AI Service" }
        }

        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({
            model: "gemini-flash-lite-latest",
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
            const cleanedText = cleanJsonText(text)
            return JSON.parse(cleanedText)
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
    .post('/generate-roadmap', async ({ body, set }) => {
        const { skillName, myLevel, targetLevel } = body
        const apiKey = process.env.GEMINI_API_KEY || Bun.env.GEMINI_API_KEY

        if (!apiKey) {
            set.status = 500
            return { error: "GEMINI_API_KEY not configured in AI Service" }
        }

        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({
            model: "gemini-flash-lite-latest",
            generationConfig: { responseMimeType: "application/json" }
        })

        const prompt = `คุณคือผู้เชี่ยวชาญด้านการจัดหลักสูตรและการเรียนรู้สาย Technical (Expert Technical Learning Coach)
            จงสร้างแผนการเรียนรู้ระยะเวลา 4 สัปดาห์ (4-Week Learning Roadmap) เพื่ออุดช่องว่างทักษะและยกระดับความรู้ในเรื่อง "${skillName}"
            โดยระดับปัจจุบันของผู้เรียนคือ ${myLevel}% และระดับเป้าหมายที่ต้องการพัฒนาขึ้นไปคือ ${targetLevel}%
            แผนต้องแบ่งออกเป็นสัปดาห์ที่ 1 ถึง 4 อย่างเป็นขั้นตอน ชัดเจน ท้าทาย และเป็นไปได้จริง
            ภาษาที่ใช้: ภาษาไทย โดยทับศัพท์คำศัพท์เฉพาะทางด้าน Programming เป็นภาษาอังกฤษตามความเหมาะสม

            จงส่งคืนผลลัพธ์ในรูปแบบ Array ของ JSON objects ตามโครงสร้างนี้เท่านั้น (ห้ามมีข้อความเกริ่นนำหรือปิดท้ายใดๆ นอกเหนือจาก JSON):
            [
              {
                "week": 1,
                "title": "หัวข้อหลักประจำสัปดาห์",
                "desc": "คำอธิบายวัตถุประสงค์สั้นๆ ของสัปดาห์นี้",
                "tasks": [
                  "งานหรือหัวข้อย่อยที่ต้องศึกษาและลงมือทำข้อที่ 1",
                  "งานหรือหัวข้อย่อยที่ต้องศึกษาและลงมือทำข้อที่ 2",
                  "งานหรือหัวข้อย่อยที่ต้องศึกษาและลงมือทำข้อที่ 3"
                ],
                "resources": [
                  "ชื่อของคอร์สเรียนออนไลน์ ลิงก์เอกสาร หรือบทความแนะนำ"
                ]
              }
            ]`

        try {
            const result = await model.generateContent(prompt)
            const text = result.response.text()
            const cleanedText = cleanJsonText(text)
            return JSON.parse(cleanedText)
        } catch (error: any) {
            set.status = 500
            return { error: error.message }
        }
    }, {
        body: t.Object({
            skillName: t.String(),
            myLevel: t.Number(),
            targetLevel: t.Number()
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
    .post('/generate-project-description', async ({ body, set }) => {
        const { projectName, language, description } = body
        const apiKey = process.env.GEMINI_API_KEY || Bun.env.GEMINI_API_KEY

        if (!apiKey) {
            set.status = 500
            return { error: "GEMINI_API_KEY not configured in AI Service" }
        }

        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({
            model: "gemini-flash-lite-latest",
            generationConfig: { responseMimeType: "application/json" }
        })

        const prompt = `You are an expert Resume/CV writer.
            Generate exactly 2 or 3 short, high-impact bullet points describing accomplishments and responsibilities for a software project to be put on a professional resume.
            Each bullet point must start with a strong action verb in past tense (e.g., Designed, Developed, Implemented, Integrated, Built, Refactored, Optimized).
            The bullet points must be professional, clear, and concise.

            Project Details:
            - Project Name: "${projectName}"
            - Primary Language/Technology: "${language || 'Not specified'}"
            - Short Description: "${description || 'No description provided'}"

            You MUST return the output strictly as a JSON array of strings, containing exactly 2 to 3 bullet points. No markdown code blocks, no other text.
            Example JSON output:
            [
              "Designed and built a secure user authentication system using TypeScript and JSON Web Tokens.",
              "Implemented efficient database queries to optimize performance and reduce request latency."
            ]`

        try {
            const result = await model.generateContent(prompt)
            const text = result.response.text()
            const cleanedText = cleanJsonText(text)
            return JSON.parse(cleanedText)
        } catch (error: any) {
            set.status = 500
            return { error: error.message }
        }
    }, {
        body: t.Object({
            projectName: t.String(),
            language: t.Optional(t.String()),
            description: t.Optional(t.String())
        })
    })
    .listen(parseInt(process.env.PORT || Bun.env.PORT || '3002'))

console.log(`AI Microservice READY at http://localhost:${app.server?.port || 3002}`)
console.log(`Using GEMINI_API_KEY: ${process.env.GEMINI_API_KEY || Bun.env.GEMINI_API_KEY ? "Loaded ✅" : "Check .env ❌"}`)