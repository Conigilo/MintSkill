import { aiService } from '../services/ai.service';
import { roadmapService } from '../services/roadmap.service';
import { verifyToken } from '../middleware/auth.middleware';

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

export async function generateRoadmapHandler({ body, headers, set }: any) {
  try {
    const user = await verifyToken(headers['authorization'] || null);
    const { skillName, myLevel, targetLevel } = body;

    if (!skillName) {
      set.status = 400;
      return { success: false, error: 'Skill Name is required.' };
    }

    // Check if roadmap already exists
    const existing = await roadmapService.getRoadmap(user.uid, skillName);
    if (existing) {
      return {
        success: true,
        data: existing,
        message: 'Loaded existing learning roadmap.'
      };
    }

    // Otherwise generate new via AI-Service
    const rawWeeks = await aiService.generateRoadmapForSkill(skillName, myLevel || 0, targetLevel || 100);
    const saved = await roadmapService.saveRoadmap(user.uid, skillName, myLevel || 0, targetLevel || 100, rawWeeks);

    return {
      success: true,
      data: saved,
      message: 'Generated new AI learning roadmap.'
    };
  } catch (error: any) {
    console.error('AI Roadmap Generation Error:', error.message);
    set.status = 500;
    return {
      success: false,
      error: 'Failed to generate learning roadmap.',
      details: error.message
    };
  }
}

export async function getRoadmapHandler({ params, headers, set }: any) {
  try {
    const user = await verifyToken(headers['authorization'] || null);
    const skillName = params.skillName;

    if (!skillName) {
      set.status = 400;
      return { success: false, error: 'Skill Name parameter is required.' };
    }

    const roadmap = await roadmapService.getRoadmap(user.uid, skillName);
    if (!roadmap) {
      set.status = 404;
      return { success: false, error: 'No learning roadmap found for this skill.' };
    }

    return {
      success: true,
      data: roadmap
    };
  } catch (error: any) {
    set.status = 500;
    return { success: false, error: error.message };
  }
}

export async function updateRoadmapTaskHandler({ params, body, headers, set }: any) {
  try {
    const user = await verifyToken(headers['authorization'] || null);
    const skillName = params.skillName;
    const { weekIndex, taskIndex, completed } = body;

    if (weekIndex === undefined || taskIndex === undefined || completed === undefined) {
      set.status = 400;
      return { success: false, error: 'weekIndex, taskIndex, and completed are required in body.' };
    }

    const success = await roadmapService.updateTaskStatus(user.uid, skillName, weekIndex, taskIndex, completed);
    if (!success) {
      set.status = 404;
      return { success: false, error: 'Roadmap or Task not found.' };
    }

    return {
      success: true,
      message: 'Task status updated successfully.'
    };
  } catch (error: any) {
    set.status = 500;
    return { success: false, error: error.message };
  }
}