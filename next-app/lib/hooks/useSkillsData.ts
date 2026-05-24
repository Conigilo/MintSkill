import { useState, useEffect, useCallback } from 'react'
import { skillsService } from '@/lib/services/skills.service'
import { useAuth } from '@/lib/hooks/useAuth'
import { getCurrentLevel } from '@/lib/utils/level'
import type { SkillWithScore, QuizStatus } from '@/lib/types'
import { CATEGORY_COLOR_MAP } from '@/lib/types'

/**
 * Custom hook จัดการข้อมูล skills ทั้งหมด
 * รวม: fetch, delete, quiz state, modals
 * 
 * ย้ายจาก SkillsTab.tsx เพื่อแยก business logic ออกจาก UI
 */
export function useSkillsData() {
  const { user, loading: authLoading } = useAuth()
  const [skills, setSkills] = useState<SkillWithScore[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Modal states
  const [verifyModal, setVerifyModal] = useState<{ isOpen: boolean; skillId: string | null }>({ isOpen: false, skillId: null })
  const [badgeModal, setBadgeModal] = useState<{ isOpen: boolean; skillId: string | null }>({ isOpen: false, skillId: null })

  // Quiz states
  const [quizMode, setQuizMode] = useState(false)
  const [quizQuestionIndex, setQuizQuestionIndex] = useState(0)
  const [quizCurrentScore, setQuizCurrentScore] = useState(0)
  const [quizStatus, setQuizStatus] = useState<QuizStatus>("idle")
  const [quizSelectedOption, setQuizSelectedOption] = useState<number | null>(null)
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false)
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([])

  const fetchSkills = useCallback(async () => {
    try {
      const data = await skillsService.getMySkills()
      if (data) {
        const formatted: SkillWithScore[] = data.map((s: any) => ({
          id: s.id,
          name: s.name,
          cat: s.category || "OTHER",
          level: s.level || 0,
          color: CATEGORY_COLOR_MAP[s.category?.toUpperCase()] || "bg-purple-500",
          verified: s.verified || false,
          quizScore: s.quizScore || 0,
          endorsementScore: s.endorsementScore || 0,
        }))
        setSkills(formatted)
      }
    } catch (error) {
      console.error("Failed to fetch skills:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authLoading) return
    if (!user) { setIsLoading(false); return }
    fetchSkills()
  }, [authLoading, user?.uid, fetchSkills])

  // Derived data
  const categories = Array.from(new Set(skills.map(s => s.cat)))
  const activeSkill = skills.find(s => s.id === verifyModal.skillId) || null

  // Quiz handlers
  const handleAnswer = useCallback((optionIndex: number) => {
    if (!activeSkill || generatedQuestions.length === 0) return
    setQuizSelectedOption(optionIndex)
    const correct = optionIndex === generatedQuestions[quizQuestionIndex].a
    if (correct) {
      setQuizCurrentScore(prev => prev + 1)
      setQuizStatus("correct")
    } else {
      setQuizStatus("wrong")
    }
  }, [activeSkill, generatedQuestions, quizQuestionIndex])

  const handleNextQuestion = useCallback(() => {
    if (!activeSkill) return
    if (quizQuestionIndex + 1 < generatedQuestions.length) {
      setQuizQuestionIndex(prev => prev + 1)
      setQuizStatus("idle")
      setQuizSelectedOption(null)
    } else {
      setQuizStatus("finished")
      finishQuiz(activeSkill.id, Math.max(quizCurrentScore, activeSkill.quizScore))
    }
  }, [activeSkill, quizQuestionIndex, generatedQuestions, quizCurrentScore])

  const finishQuiz = async (skillId: string, finalScore: number) => {
    const activeSkillBefore = skills.find(s => s.id === skillId)
    const oldLevel = activeSkillBefore ? getCurrentLevel(activeSkillBefore.quizScore, activeSkillBefore.endorsementScore).level : 0

    await skillsService.submitQuizAttempt(skillId, finalScore)
    await fetchSkills()

    const newLevel = activeSkillBefore ? getCurrentLevel(finalScore, activeSkillBefore.endorsementScore).level : 0

    setTimeout(() => {
      setQuizMode(false)
      if (newLevel > oldLevel) {
        setVerifyModal({ isOpen: false, skillId: null })
        setBadgeModal({ isOpen: true, skillId })
      } else {
        setVerifyModal({ isOpen: true, skillId })
      }
    }, 2500)
  }

  const startQuiz = async () => {
    if (!activeSkill) return
    const currentLvl = getCurrentLevel(activeSkill.quizScore, activeSkill.endorsementScore)
    setIsGeneratingQuiz(true)
    const questions = await skillsService.generateAIQuiz(activeSkill.name, currentLvl.level)
    setIsGeneratingQuiz(false)
    if (questions && questions.length > 0) {
      setGeneratedQuestions(questions)
      setQuizQuestionIndex(0)
      setQuizCurrentScore(0)
      setQuizStatus("idle")
      setQuizSelectedOption(null)
      setQuizMode(true)
    } else {
      alert("Failed to generate quiz. Please try again.")
    }
  }

  const deleteSkill = async (skillId: string) => {
    await skillsService.deleteSkill(skillId)
    fetchSkills()
  }

  const openVerifyModal = (skillId: string) => {
    setVerifyModal({ isOpen: true, skillId })
    setQuizMode(false)
  }

  const closeVerifyModal = () => {
    setVerifyModal({ isOpen: false, skillId: null })
  }

  const openBadgeModal = (skillId: string) => {
    setBadgeModal({ isOpen: true, skillId })
  }

  const closeBadgeModal = () => {
    setBadgeModal({ isOpen: false, skillId: null })
  }

  const openUpgradeFromBadge = (skillId: string) => {
    setBadgeModal({ isOpen: false, skillId: null })
    setVerifyModal({ isOpen: true, skillId })
    setQuizMode(false)
  }

  return {
    // Data
    skills,
    isLoading,
    categories,
    activeSkill,

    // Modal states
    verifyModal,
    badgeModal,
    quizMode,

    // Quiz states
    quizQuestionIndex,
    quizCurrentScore,
    quizStatus,
    quizSelectedOption,
    isGeneratingQuiz,
    generatedQuestions,

    // Actions
    handleAnswer,
    handleNextQuestion,
    startQuiz,
    deleteSkill,
    openVerifyModal,
    closeVerifyModal,
    openBadgeModal,
    closeBadgeModal,
    openUpgradeFromBadge,
    setQuizMode,
  }
}
