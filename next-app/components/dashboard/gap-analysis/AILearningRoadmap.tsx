'use client'

import { useState, useEffect } from 'react'
import { roadmapService, type UserRoadmap, type RoadmapWeek } from '@/lib/services/roadmap.service'
import { useAuth } from '@/lib/hooks/useAuth'

interface AILearningRoadmapProps {
  skillName: string
  myLevel: number
  targetLevel: number
  onClose: () => void
}

interface QuizQuestion {
  q: string
  opts: string[]
  a: number
  explanation: string
}

export default function AILearningRoadmap({
  skillName,
  myLevel,
  targetLevel,
  onClose,
}: AILearningRoadmapProps) {
  const { user } = useAuth()
  const [roadmap, setRoadmap] = useState<UserRoadmap | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null)
  const [expandedWeek, setExpandedWeek] = useState<number>(1)

  // Quiz States
  const [activeQuizWeek, setActiveQuizWeek] = useState<number | null>(null)
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([])
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [showAnswerResult, setShowAnswerResult] = useState(false)
  const [quizScore, setQuizScore] = useState(0)
  const [quizFinished, setQuizFinished] = useState(false)

  // Load roadmap data
  const loadRoadmap = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await roadmapService.getRoadmap(skillName)
      if (res.success && res.data) {
        setRoadmap(res.data)
      } else {
        const genRes = await roadmapService.generateRoadmap(skillName, myLevel, targetLevel)
        if (genRes.success && genRes.data) {
          setRoadmap(genRes.data)
        } else {
          setError('ไม่สามารถสร้างแผนการเรียนรู้ได้ในขณะนี้')
        }
      }
    } catch (err: any) {
      try {
        const genRes = await roadmapService.generateRoadmap(skillName, myLevel, targetLevel)
        if (genRes.success && genRes.data) {
          setRoadmap(genRes.data)
        } else {
          setError('ระบบ AI ขัดข้องในการสร้างแผนการเรียนรู้')
        }
      } catch (genErr: any) {
        setError(genErr.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลแผนการเรียนรู้')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRoadmap()
    // Reset quiz when skill changes
    setActiveQuizWeek(null)
  }, [skillName])

  // Get quiz status from localstorage
  const isQuizPassed = (weekNum: number) => {
    if (!user) return false
    return localStorage.getItem(`roadmap_quiz_${user.uid}_${skillName}_w${weekNum}`) === "true"
  }

  // Unlocking mechanism
  const isWeekUnlocked = (weekNum: number) => {
    if (weekNum === 1) return true
    if (!roadmap) return false
    
    // Previous week must have all tasks completed and quiz passed
    const prevWeek = roadmap.weeks.find(w => w.week === weekNum - 1)
    if (!prevWeek) return false

    const prevWeekTasksDone = prevWeek.tasks.every(t => t.completed)
    const prevWeekQuizDone = isQuizPassed(weekNum - 1)

    return prevWeekTasksDone && prevWeekQuizDone
  }

  // Handle task check/uncheck
  const handleToggleTask = async (weekIdx: number, taskIdx: number, currentCompleted: boolean) => {
    if (!roadmap) return
    const taskId = `${weekIdx}-${taskIdx}`
    setUpdatingTaskId(taskId)

    // Optimistic update
    const updatedWeeks = [...roadmap.weeks]
    updatedWeeks[weekIdx].tasks[taskIdx].completed = !currentCompleted
    setRoadmap({ ...roadmap, weeks: updatedWeeks })

    try {
      await roadmapService.updateTaskStatus(skillName, weekIdx, taskIdx, !currentCompleted)
    } catch (err) {
      console.error('Failed to update task status in database:', err)
      // Rollback on error
      updatedWeeks[weekIdx].tasks[taskIdx].completed = currentCompleted
      setRoadmap({ ...roadmap, weeks: updatedWeeks })
    } finally {
      setUpdatingTaskId(null)
    }
  }

  // Local dynamically generated questions based on skillName and week title
  const generateInlineQuestions = (skill: string, weekTitle: string): QuizQuestion[] => {
    return [
      {
        q: `ในการพัฒนา ${skill} หัวข้อ "${weekTitle}" ข้อใดคือแนวปฏิบัติที่ดีที่สุด (Best Practice)?`,
        opts: [
          "เขียนโค้ดให้สั้นที่สุดโดยไม่สนใจความอ่านง่าย",
          "แยกโค้ดเป็นส่วนๆ (Modular structure) และเขียนคำอธิบายที่เข้าใจง่าย",
          "นำโค้ดทั้งหมดไปรวมกันในไฟล์เดียวเพื่อประหยัดจำนวนไฟล์",
          "ใช้ตัวแปรแบบ Global ให้ได้มากที่สุด"
        ],
        a: 1,
        explanation: "การแบ่งโมดูล (Modular) ช่วยให้โค้ดมีความเป็นระเบียบ อ่านง่าย บำรุงรักษาได้สะดวก และนำกลับมาใช้งานใหม่ได้ดีกว่า"
      },
      {
        q: `แนวคิดหลักของการจัดการระบบงานในหัวข้อ "${weekTitle}" ของทักษะ ${skill} คือข้อใด?`,
        opts: [
          "การเพิ่มความถูกต้องของข้อมูลผ่านโครงสร้างการทำงานที่เป็นระบบและชัดเจน",
          "การประมวลผลข้อมูลที่เร็วขึ้นโดยไม่มีขอบเขตจำกัด",
          "การยกเลิกการเขียนโค้ดเช็กเงื่อนไขทั้งหมดเพื่อความเร็ว",
          "การปิดกั้นไม่ให้ทีมงานคนอื่นมองเห็นโค้ดของเราได้"
        ],
        a: 0,
        explanation: "การจัดการระบบงานที่ดีช่วยยกระดับความถูกต้องของข้อมูลผ่านระบบโครงสร้างที่แข็งแรงและลดบั๊กที่อาจเกิดขึ้น"
      },
      {
        q: `ข้อใดกล่าวถึงประโยชน์หลักของการนำเทคนิค "${weekTitle}" ไปประยุกต์ใช้งานในโปรเจกต์จริงได้เหมาะสมที่สุด?`,
        opts: [
          "ช่วยลดความซับซ้อน ป้องกันข้อผิดพลาด (Technical Debt) ในระยะยาว และทำให้โค้ดเป็นมาตรฐานเดียวกัน",
          "ทำให้โปรเจกต์ไม่จำเป็นต้องเขียนโค้ดสำหรับเชื่อมต่อ API หรือคลาวด์อีกเลย",
          "ช่วยให้นักพัฒนาที่ไม่มีความรู้ในภาษา ${skill} สามารถดีบักระบบได้ทั้งหมด",
          "ทำให้เว็บไซต์ทำงานได้โดยไม่ต้องรอดาวน์โหลดไฟล์ CSS หรือ JavaScript"
        ],
        a: 0,
        explanation: "การลดความซับซ้อนของโค้ดช่วยควบคุมมาตรฐานของคุณภาพงาน ลดภาระทางเทคนิค และทำให้แก้ไขบั๊กได้ง่ายขึ้น"
      }
    ]
  }

  // Start quiz flow
  const handleStartQuiz = (weekNum: number, weekTitle: string) => {
    const questions = generateInlineQuestions(skillName, weekTitle)
    setQuizQuestions(questions)
    setCurrentQuestionIdx(0)
    setSelectedOption(null)
    setShowAnswerResult(false)
    setQuizScore(0)
    setQuizFinished(false)
    setActiveQuizWeek(weekNum)
  }

  // Submit current answer
  const handleSubmitAnswer = () => {
    if (selectedOption === null) return
    setShowAnswerResult(true)
    
    // Increment score if correct
    if (selectedOption === quizQuestions[currentQuestionIdx].a) {
      setQuizScore(prev => prev + 1)
    }
  }

  // Go to next question or finish
  const handleNextQuestion = () => {
    setSelectedOption(null)
    setShowAnswerResult(false)
    
    if (currentQuestionIdx < quizQuestions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1)
    } else {
      setQuizFinished(true)
      // Save state if passed (score >= 2 out of 3)
      const passed = (quizScore + (selectedOption === quizQuestions[currentQuestionIdx].a ? 1 : 0)) >= 2
      if (passed && user && activeQuizWeek) {
        localStorage.setItem(`roadmap_quiz_${user.uid}_${skillName}_w${activeQuizWeek}`, "true")
      }
    }
  }

  // Calculate overall progress percentage
  const getOverallProgress = () => {
    if (!roadmap) return 0
    let totalTasks = 0
    let completedTasks = 0
    
    roadmap.weeks.forEach(w => {
      w.tasks.forEach(t => {
        totalTasks++
        if (t.completed) completedTasks++
      })
    })

    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  }

  const overallProgress = getOverallProgress()

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#161b22] border border-slate-300 dark:border-[#30363d] rounded-3xl w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-[#161b22] border-b border-slate-200 dark:border-[#30363d] shrink-0">
          <div>
            <span className="text-[10px] font-black text-blue-500 dark:text-blue-400 uppercase tracking-widest">
              AI LEARNING PATHWAY
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
              แผนพัฒนาเพื่อเพิ่มระดับทักษะ: {skillName}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-[#21262d] dark:hover:bg-[#30363d] text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all focus:outline-none cursor-pointer font-bold text-xs"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest animate-pulse">
                กำลังวิเคราะห์และเรียบเรียงแผนพัฒนาทักษะโดย AI...
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-12 bg-red-500/10 border border-red-500/20 rounded-2xl">
              <span className="text-2xl">⚠️</span>
              <p className="text-xs font-bold text-red-500 dark:text-red-400 mt-2">
                {error}
              </p>
              <button
                onClick={loadRoadmap}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
              >
                ลองใหม่อีกครั้ง
              </button>
            </div>
          ) : roadmap ? (
            <>
              {/* Progress Summary Card */}
              <div className="bg-[#f8fafc] dark:bg-[#0d1117] border border-slate-200/50 dark:border-[#21262d] rounded-2xl p-5 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0 shadow-sm">
                <div className="space-y-1 text-center md:text-left">
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    เป้าหมายการยกระดับ
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                    พัฒนาจากระดับเริ่มต้น <strong className="text-slate-900 dark:text-white">{myLevel}%</strong> ไปสู่ระดับเป้าหมาย <strong className="text-blue-500 dark:text-blue-400">{targetLevel}%</strong>
                  </p>
                </div>

                {/* Progress bar */}
                <div className="w-full md:w-48 space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500">
                    <span>ความสำเร็จของหลักสูตร</span>
                    <span>{overallProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-[#21262d] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${overallProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* 4-Week List */}
              <div className="space-y-3">
                {roadmap.weeks.map((week, wIdx) => {
                  const isExpanded = expandedWeek === week.week
                  const completedTasksCount = week.tasks.filter(t => t.completed).length
                  const totalTasksCount = week.tasks.length
                  const isTasksFinished = completedTasksCount === totalTasksCount && totalTasksCount > 0
                  const isQuizDone = isQuizPassed(week.week)
                  const isWeekFinished = isTasksFinished && isQuizDone
                  const isUnlocked = isWeekUnlocked(week.week)

                  return (
                    <div
                      key={week.week}
                      className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                        !isUnlocked
                          ? 'border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-[#161b22]/10 opacity-60'
                          : isExpanded
                            ? 'border-slate-300 dark:border-slate-700 shadow-sm bg-white dark:bg-[#1c212a]/30'
                            : 'border-slate-200/80 dark:border-[#30363d] hover:bg-slate-50/50 dark:hover:bg-[#21262d]/20'
                      }`}
                    >
                      {/* Week Header */}
                      <div
                        onClick={() => {
                          if (isUnlocked) {
                            setExpandedWeek(isExpanded ? 0 : week.week)
                          }
                        }}
                        className={`px-5 py-4 flex items-center justify-between select-none ${isUnlocked ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            !isUnlocked
                              ? 'bg-slate-100 text-slate-400 border border-slate-200'
                              : isWeekFinished
                                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                          }`}>
                            {isWeekFinished ? '✓' : !isUnlocked ? '🔒' : `W${week.week}`}
                          </span>
                          <div>
                            <h4 className="text-sm font-bold text-slate-800 dark:text-white leading-tight flex items-center gap-1.5">
                              {week.title}
                              {!isUnlocked && <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">(Locked 🔒)</span>}
                            </h4>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                              {week.desc}
                            </p>
                          </div>
                        </div>

                        {/* Expand status */}
                        <div className="flex items-center gap-2">
                          {isUnlocked ? (
                            <>
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-[#21262d] text-slate-400 dark:text-[#8b949e]">
                                {isWeekFinished ? "ผ่านด่านสัปดาห์นี้แล้ว 🎉" : `ภารกิจ ${completedTasksCount}/${totalTasksCount}`}
                              </span>
                              <svg
                                className={`w-3.5 h-3.5 text-slate-400 transform transition-transform duration-300 ${
                                  isExpanded ? 'rotate-180 text-blue-500' : ''
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                              </svg>
                            </>
                          ) : (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-[#21262d] text-slate-400">
                              ต้องผ่านสัปดาห์ก่อนหน้า
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Week Tasks checklist */}
                      {isUnlocked && isExpanded && (
                        <div className="px-5 pb-5 pt-1 border-t border-slate-100 dark:border-[#21262d] space-y-4 animate-in slide-in-from-top-1 duration-200">
                          
                          {/* Checklist */}
                          <div className="space-y-2">
                            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">
                              รายการภารกิจที่ต้องทำ (Tasks)
                            </span>
                            {week.tasks.map((task, tIdx) => {
                              const isUpdating = updatingTaskId === `${wIdx}-${tIdx}`
                              return (
                                <label
                                  key={tIdx}
                                  className={`flex items-start gap-3 p-3 rounded-xl border border-slate-200/50 dark:border-[#30363d]/50 bg-slate-50/30 dark:bg-[#0d1117]/10 hover:bg-slate-50 dark:hover:bg-[#21262d]/40 transition-all cursor-pointer ${
                                    task.completed ? 'opacity-65' : ''
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={task.completed}
                                    disabled={isUpdating || isQuizDone}
                                    onChange={() => handleToggleTask(wIdx, tIdx, task.completed)}
                                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-[#30363d] cursor-pointer mt-0.5"
                                  />
                                  <span className={`text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium select-none ${
                                    task.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''
                                  }`}>
                                    {task.text}
                                  </span>
                                </label>
                              )
                            })}
                          </div>

                          {/* 🎯 Weekly Challenge Section */}
                          <div className="pt-2 border-t border-slate-100 dark:border-[#21262d]">
                            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-3">
                              ควิซผ่านด่านประจำสัปดาห์ (Weekly Challenge)
                            </span>

                            {isQuizDone ? (
                              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3">
                                <span className="text-xl">🏆</span>
                                <div>
                                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">ผ่านการประเมินประจำสัปดาห์เรียบร้อยแล้ว!</p>
                                  <p className="text-[10px] text-emerald-500/80">เนื้อหาในสัปดาห์ถัดไปได้รับการปลดล็อกแล้ว</p>
                                </div>
                              </div>
                            ) : !isTasksFinished ? (
                              <div className="p-4 bg-slate-50 dark:bg-[#161b22]/50 border border-slate-200/50 dark:border-[#30363d]/50 rounded-2xl">
                                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">🔒 กรุณาติ๊กทำภารกิจด้านบนให้ครบ 100% เพื่อเปิดสิทธิ์ในการสอบควิซผ่านด่าน</p>
                              </div>
                            ) : activeQuizWeek === week.week ? (
                              /* Active Quiz Frame */
                              <div className="p-5 bg-slate-50 dark:bg-[#0d1117]/30 border border-slate-200 dark:border-[#30363d] rounded-2xl space-y-4">
                                {quizFinished ? (
                                  <div className="text-center space-y-3">
                                    <span className="text-3xl">{(quizScore >= 2) ? '🎉' : '😢'}</span>
                                    <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                                      {(quizScore >= 2) ? 'สอบผ่านเกณฑ์!' : 'สอบไม่ผ่านเกณฑ์'}
                                    </h5>
                                    <p className="text-xs text-slate-500">คุณตอบถูก {quizScore} จาก 3 ข้อ (เกณฑ์ผ่านคือ 2 ข้อขึ้นไป)</p>
                                    <div className="flex gap-2 justify-center pt-2">
                                      {quizScore >= 2 ? (
                                        <button
                                          onClick={() => {
                                            setActiveQuizWeek(null)
                                            // Trigger state update
                                            loadRoadmap()
                                          }}
                                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl cursor-pointer"
                                        >
                                          เสร็จสิ้น & ปลดล็อก Week ถัดไป
                                        </button>
                                      ) : (
                                        <button
                                          onClick={() => handleStartQuiz(week.week, week.title)}
                                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl cursor-pointer"
                                        >
                                          ลองใหม่อีกครั้ง
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-4">
                                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                                      <span>ประเมินทักษะควิซ: {week.title}</span>
                                      <span>ข้อที่ {currentQuestionIdx + 1}/3</span>
                                    </div>
                                    <p className="text-xs font-bold text-slate-800 dark:text-white leading-relaxed">
                                      {quizQuestions[currentQuestionIdx]?.q}
                                    </p>
                                    
                                    {/* Options */}
                                    <div className="space-y-2">
                                      {quizQuestions[currentQuestionIdx]?.opts.map((opt, oIdx) => {
                                        const isSelected = selectedOption === oIdx
                                        const isCorrect = oIdx === quizQuestions[currentQuestionIdx].a
                                        return (
                                          <button
                                            key={oIdx}
                                            disabled={showAnswerResult}
                                            onClick={() => setSelectedOption(oIdx)}
                                            className={`w-full text-left p-3 rounded-xl border text-xs font-medium transition-all flex justify-between items-center cursor-pointer ${
                                              showAnswerResult
                                                ? isCorrect
                                                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600'
                                                  : isSelected
                                                    ? 'border-red-500 bg-red-500/10 text-red-600'
                                                    : 'border-slate-100 text-slate-400'
                                                : isSelected
                                                  ? 'border-indigo-600 bg-indigo-500/5 text-indigo-600'
                                                  : 'border-slate-200 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                                            }`}
                                          >
                                            <span>{opt}</span>
                                            {showAnswerResult && isCorrect && <span className="text-emerald-500">✓</span>}
                                            {showAnswerResult && isSelected && !isCorrect && <span className="text-red-500">✗</span>}
                                          </button>
                                        )
                                      })}
                                    </div>

                                    {/* Result explanation */}
                                    {showAnswerResult && (
                                      <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl text-[11px] text-slate-500 leading-relaxed font-medium">
                                        💡 <strong>คำอธิบาย:</strong> {quizQuestions[currentQuestionIdx].explanation}
                                      </div>
                                    )}

                                    {/* Action button */}
                                    <div className="flex justify-end pt-2">
                                      {!showAnswerResult ? (
                                        <button
                                          onClick={handleSubmitAnswer}
                                          disabled={selectedOption === null}
                                          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-xl cursor-pointer"
                                        >
                                          ส่งคำตอบ
                                        </button>
                                      ) : (
                                        <button
                                          onClick={handleNextQuestion}
                                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl cursor-pointer"
                                        >
                                          {currentQuestionIdx < quizQuestions.length - 1 ? "ข้อถัดไป" : "ดูผลลัพธ์"}
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <button
                                onClick={() => handleStartQuiz(week.week, week.title)}
                                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-[0.98] cursor-pointer"
                              >
                                📝 เริ่มทดสอบควิซวัดความรู้ประจำสัปดาห์
                              </button>
                            )}
                          </div>

                          {/* Resources */}
                          {week.resources && week.resources.length > 0 && (
                            <div className="bg-slate-50 dark:bg-[#0d1117]/30 border border-slate-200/60 dark:border-[#30363d]/50 rounded-xl p-3.5">
                              <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">
                                ทรัพยากรศึกษาเพิ่มเติม (Learning Resources)
                              </span>
                              <div className="space-y-1.5">
                                {week.resources.map((res, rIdx) => (
                                  <div key={rIdx} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                                    <span className="text-blue-500 font-bold">•</span>
                                    {res.startsWith('http') ? (
                                      <a
                                        href={res}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-blue-600 dark:text-blue-400 hover:underline font-medium break-all"
                                      >
                                        {res}
                                      </a>
                                    ) : (
                                      <span className="font-medium">{res}</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
