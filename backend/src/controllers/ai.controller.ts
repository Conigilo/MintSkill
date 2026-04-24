import { aiService } from '../services/ai.service';

export async function generateQuizHandler({ body, set }: any) {
  try {
    const { skillName, level } = body;
    
    if (!skillName) {
      set.status = 400;
      return { success: false, error: 'Skill Name is required.' };
    }

    const quizLevel = level || 1; // Default to Beginner

    const generatedQuestions = await aiService.generateQuizForSkill(skillName, quizLevel);

    return {
      success: true,
      data: generatedQuestions
    };

  } catch (error: any) {
    console.error('AI Quiz Generation Error:', error.message);
    set.status = 500;
    return {
      success: false,
      error: 'Failed to generate quiz questions.',
      details: error.message
    };
  }
}