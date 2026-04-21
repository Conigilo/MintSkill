import { GoogleGenerativeAI } from "@google/generative-ai";

export class AiService {

    private genAI: GoogleGenerativeAI;

    constructor() {
        const apiKey = (process.env.GEMINI_API_KEY || "") as string;

        // เพิ่ม Log เพื่อเช็กว่าอ่านคีย์ได้จริงไหม (โชว์แค่ 5 ตัวแรกเพื่อความปลอดภัย)
        if (apiKey) {
            console.log(`AI Service: API Key detected (Starts with: ${apiKey.substring(0, 5)}...)`);
        } else {
            console.error("AI Service: GEMINI_API_KEY is EMPTY in .env!");
        }

        if (!apiKey) {
            console.warn("GEMINI_API_KEY is missing in .env file");
        }

        this.genAI = new GoogleGenerativeAI(apiKey);
    }

    async generateQuizForSkill(skillName: string, level: number): Promise<any[]> {
        try {
            // ใช้โมเดล gemini-2.5-flash ซึ่งเป็นรุ่นมาตรฐานของปี 2026
            const model = this.genAI.getGenerativeModel({
                model: "gemini-2.5-flash",
                generationConfig: {
                    responseMimeType: "application/json",
                }
            });

            let difficultyText = "Beginner (Level 1)";
            if (level === 2) difficultyText = "Intermediate (Level 2)";
            if (level === 3) difficultyText = "Advanced/Senior (Level 3)";

            const prompt = `
        You are an expert technical interviewer.
        Generate a multiple-choice quiz about "${skillName}".
        Target Audience: ${difficultyText} level developer.
        Amount: Exactly 10 questions.
        Language: Thai with English programming terms.

        Return an array of JSON objects strictly in this format:
        [
          {
            "q": "The question text?",
            "opts": ["Option 1", "Option 2", "Option 3", "Option 4"],
            "a": 0 // The index of the correct option (0-3)
          }
        ]
      `;

            const result = await model.generateContent(prompt);
            const response = result.response;
            const text = response.text();

            // แปลง String โค้ด JSON ให้กกลายเป็น Object
            return JSON.parse(text);

        } catch (error) {
            console.error("AI Generation Error:", error);
            throw new Error("Failed to generate quiz from AI.");
        }
    }
}

export const aiService = new AiService();
