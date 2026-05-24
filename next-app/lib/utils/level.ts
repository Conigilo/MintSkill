/**
 * Shared utility: Skill Level Calculator
 * ย้ายมาจาก SkillsTab.tsx เพื่อใช้ร่วมกันได้ทุก component
 */

export interface SkillLevel {
  level: number;
  name: string;
  nextEndorse: number | null;
  nextQuiz: number | null;
}

/**
 * คำนวณระดับทักษะจากคะแนน quiz + endorsement
 *
 * ระดับ:
 * - 0 = Beginner (เริ่มต้น)
 * - 1 = Junior   (endorse ≥ 1, quiz ≥ 4)
 * - 2 = Mid      (endorse ≥ 3, quiz ≥ 7)
 * - 3 = Senior   (endorse ≥ 5, quiz ≥ 10)
 */
export function getCurrentLevel(quizScore: number, endorseScore: number): SkillLevel {
  if (endorseScore >= 5 && quizScore >= 10) {
    return { level: 3, name: "Senior", nextEndorse: null, nextQuiz: null };
  }
  if (endorseScore >= 3 && quizScore >= 7) {
    return { level: 2, name: "Mid", nextEndorse: 5, nextQuiz: 10 };
  }
  if (endorseScore >= 1 && quizScore >= 4) {
    return { level: 1, name: "Junior", nextEndorse: 3, nextQuiz: 7 };
  }
  return { level: 0, name: "Beginner", nextEndorse: 1, nextQuiz: 4 };
}
