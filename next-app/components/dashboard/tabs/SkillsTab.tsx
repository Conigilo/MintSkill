/**
 * SkillsTab — Composition Component
 *
 * ก่อน refactor: 674 บรรทัด (God Component)
 * หลัง refactor: ~120 บรรทัด — แยก logic ไป useSkillsData hook, UI ไป sub-components
 */

import { useSkillsData } from '@/lib/hooks/useSkillsData'
import SkillCard from '@/components/dashboard/skills/SkillCard'
import SkillVerifyModal from '@/components/dashboard/skills/SkillVerifyModal'
import SkillQuizModal from '@/components/dashboard/skills/SkillQuizModal'
import SkillBadgeModal from '@/components/dashboard/skills/SkillBadgeModal'

export default function SkillsTab({ onNavigateToEndorse }: { onNavigateToEndorse?: () => void }) {
  const {
    skills,
    isLoading,
    categories,
    activeSkill,
    verifyModal,
    badgeModal,
    quizMode,
    quizQuestionIndex,
    quizCurrentScore,
    quizStatus,
    quizSelectedOption,
    isGeneratingQuiz,
    generatedQuestions,
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
  } = useSkillsData()

  // ── Loading State (Skeleton Shimmer) ──
  if (isLoading) {
    return (
      <div className="glass-panel p-8 rounded-3xl min-h-[400px] animate-in fade-in duration-300">
        <div className="flex justify-between items-center mb-8 border-b border-slate-200/50 dark:border-[#30363d] pb-4">
          <div className="h-6 w-48 rounded skeleton-shimmer" />
          <div className="h-6 w-20 rounded-full skeleton-shimmer" />
        </div>
        <div className="space-y-8">
          {[1, 2].map((group) => (
            <div key={group} className="space-y-4">
              <div className="h-4 w-32 rounded skeleton-shimmer" />
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((card) => (
                  <div key={card} className="border border-slate-200/60 dark:border-[#30363d] bg-white dark:bg-[#161b22] p-5 rounded-2xl space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="h-4 w-24 rounded skeleton-shimmer" />
                      <div className="h-4 w-12 rounded skeleton-shimmer" />
                    </div>
                    <div className="w-full h-1.5 rounded-full skeleton-shimmer animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── Main Render ──
  return (
    <div className="glass-panel p-8 rounded-3xl animate-in fade-in duration-500 relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 border-b border-slate-200/50 dark:border-[#30363d] pb-4">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Your Skills Inventory</h3>
        <span className="text-xs bg-blue-500/10 border border-blue-500/30 px-3 py-1 rounded-full text-blue-400 font-bold">
          {skills.filter(s => s.verified).length} Verified
        </span>
      </div>

      {/* Skill Cards Grid */}
      {skills.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-500 font-medium">ยังไม่มี Skills</p>
          <p className="text-slate-400 text-sm mt-1">ให้ Admin เพิ่ม Skill ให้คุณก่อนนะ</p>
        </div>
      ) : (
        <div className="space-y-8">
          {categories.map((cat, idx) => (
            <div key={idx}>
              <p className="text-xs text-slate-400 dark:text-[#8b949e] font-black mb-4 uppercase tracking-wider">{cat}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {skills.filter(s => s.cat === cat).map((skill) => (
                  <SkillCard
                    key={skill.id}
                    skill={skill}
                    onVerify={openVerifyModal}
                    onBadge={openBadgeModal}
                    onDelete={deleteSkill}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modals ── */}

      {/* Verify Modal (non-quiz) */}
      {verifyModal.isOpen && activeSkill && !quizMode && (
        <SkillVerifyModal
          skill={activeSkill}
          isGeneratingQuiz={isGeneratingQuiz}
          onClose={closeVerifyModal}
          onStartQuiz={startQuiz}
          onNavigateToEndorse={onNavigateToEndorse}
          onShowBadge={(id) => {
            closeVerifyModal()
            openBadgeModal(id)
          }}
        />
      )}

      {/* Quiz Modal (full-screen focus mode) */}
      {verifyModal.isOpen && activeSkill && quizMode && (
        <SkillQuizModal
          skill={activeSkill}
          questions={generatedQuestions}
          questionIndex={quizQuestionIndex}
          currentScore={quizCurrentScore}
          status={quizStatus}
          selectedOption={quizSelectedOption}
          onAnswer={handleAnswer}
          onNext={handleNextQuestion}
          onClose={() => setQuizMode(false)}
        />
      )}

      {/* Badge Certificate Modal */}
      {badgeModal.isOpen && (() => {
        const activeBadge = skills.find(s => s.id === badgeModal.skillId)
        if (!activeBadge) return null
        return (
          <SkillBadgeModal
            skill={activeBadge}
            onClose={closeBadgeModal}
            onUpgrade={openUpgradeFromBadge}
          />
        )
      })()}
    </div>
  )
}