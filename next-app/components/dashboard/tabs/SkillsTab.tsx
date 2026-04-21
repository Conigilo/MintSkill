import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { skillsService } from "@/lib/services/skills.service";
import { useAuth } from "@/lib/hooks/useAuth";

export default function SkillsTab({ onNavigateToEndorse }: { onNavigateToEndorse?: () => void }) {
  const { user, loading: authLoading } = useAuth();
  const [skills, setSkills] = useState<{ id: string, name: string, cat: string, level: number, color: string, verified: boolean, quizScore: number, endorsementScore: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSkills = async () => {
    try {
      const data = await skillsService.getMySkills();
      if (data) {
        const colMap: Record<string, string> = {
          "LANGUAGES": "bg-yellow-400",
          "FRAMEWORKS & TOOLS": "bg-cyan-400",
          "DATABASE": "bg-emerald-400",
          "CLOUD": "bg-sky-400",
        };
        const formatted = data.map((s: any) => ({
          id: s.id,
          name: s.name,
          cat: s.category || "OTHER",
          level: s.level || 0,
          color: colMap[s.category?.toUpperCase()] || "bg-purple-500",
          verified: s.verified || false,
          quizScore: s.quizScore || 0,
          endorsementScore: s.endorsementScore || 0
        }));
        setSkills(formatted);
      }
    } catch (error) {
      console.error("Failed to fetch skills:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setIsLoading(false); return; }
    fetchSkills();
  }, [authLoading, user]);

  // State modals
  const [verifyModal, setVerifyModal] = useState<{ isOpen: boolean; skillId: string | null }>({ isOpen: false, skillId: null });
  const [quizMode, setQuizMode] = useState(false);
  const [quizQuestionIndex, setQuizQuestionIndex] = useState(0);
  const [quizCurrentScore, setQuizCurrentScore] = useState(0);
  const [quizStatus, setQuizStatus] = useState<"idle" | "correct" | "wrong" | "finished">("idle");
  const [badgeModal, setBadgeModal] = useState<{ isOpen: boolean; skillId: string | null }>({ isOpen: false, skillId: null });
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
  const getCurrentLevel = (quiz: number, endorse: number) => {
    if (endorse >= 5 && quiz >= 10) return { level: 3, name: "Senior", nextEndorse: null, nextQuiz: null };
    if (endorse >= 3 && quiz >= 7) return { level: 2, name: "Mid", nextEndorse: 5, nextQuiz: 10 };
    if (endorse >= 1 && quiz >= 4) return { level: 1, name: "Junior", nextEndorse: 3, nextQuiz: 7 };
    return { level: 0, name: "Beginner", nextEndorse: 1, nextQuiz: 4 };
  };

  const categories = Array.from(new Set(skills.map(s => s.cat)));

  const handleAnswer = (optionIndex: number, skillId: string) => {
    const activeSkill = skills.find(s => s.id === skillId);
    if (!activeSkill || generatedQuestions.length === 0) return;

    const correct = optionIndex === generatedQuestions[quizQuestionIndex].a;

    if (correct) {
      setQuizCurrentScore(prev => prev + 1);
      setQuizStatus("correct");
    } else {
      setQuizStatus("wrong");
    }

    setTimeout(() => {
      if (quizQuestionIndex + 1 < 10) {
        setQuizQuestionIndex(prev => prev + 1);
        setQuizStatus("idle");
      } else {
        // Finished all 10
        setQuizStatus("finished");
        // Save only if the score is higher than the previous best score
        const newScore = quizCurrentScore + (correct ? 1 : 0);
        finishQuiz(skillId, Math.max(newScore, activeSkill.quizScore));
      }
    }, 1000);
  };

  const finishQuiz = async (skillId: string, finalScore: number) => {
    await skillsService.submitQuizAttempt(skillId, finalScore);
    await fetchSkills(); // Refresh the list to get new scores & verified status
    setTimeout(() => {
      setQuizMode(false);
      const activeSkill = skills.find(s => s.id === skillId);
      // Let it return to the verify modal to see the fresh status!
      setVerifyModal({ isOpen: true, skillId });
    }, 2500);
  };

  if (isLoading) {
    return (
      <div className="glass-panel p-8 rounded-3xl flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Loading Skills...</p>
        </div>
      </div>
    );
  }

  const activeSkill = skills.find(s => s.id === verifyModal.skillId);

  return (
    <div className="glass-panel p-8 rounded-3xl animate-in fade-in duration-500 relative">
      <div className="flex justify-between items-center mb-8 border-b border-gray-800/50 pb-4">
        <h3 className="text-xl font-bold text-white">Your Skills Inventory</h3>
        <span className="text-xs bg-blue-500/10 border border-blue-500/30 px-3 py-1 rounded-full text-blue-400">
          {skills.filter(s => s.verified).length} Verified
        </span>
      </div>

      {skills.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🎯</p>
          <p className="text-gray-400 font-medium">ยังไม่มี Skills</p>
          <p className="text-gray-600 text-sm mt-1">ให้ Admin เพิ่ม Skill ให้คุณก่อนนะ</p>
        </div>
      ) : (
        <div className="space-y-8">
          {categories.map((cat, idx) => (
            <div key={idx}>
              <p className="text-xs text-gray-500 font-bold mb-4 uppercase tracking-wider">{cat}</p>
              <div className="flex flex-wrap gap-3">
                {skills.filter(s => s.cat === cat).map((skill) => (
                  <div
                    key={skill.id}
                    className={`px-4 py-2 rounded-full flex items-center gap-2 text-sm transition-all duration-300 cursor-pointer ${skill.verified
                      ? "bg-[#161b22] border border-gray-700/50 hover:border-gray-500"
                      : "bg-gray-900 border border-gray-800 border-dashed text-gray-500 hover:border-blue-500/50 hover:bg-gray-800"
                      }`}
                    onClick={() => {
                      if (!skill.verified) {
                        setVerifyModal({ isOpen: true, skillId: skill.id });
                        setQuizMode(false);
                      } else {
                        setBadgeModal({ isOpen: true, skillId: skill.id });
                      }
                    }}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${skill.verified ? skill.color : 'bg-gray-700'}`}></span>
                    <span className={skill.verified ? "text-gray-200" : "text-gray-400"}>{skill.name}</span>

                    {skill.verified ? (
                      <span className="ml-1 text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 px-1.5 py-0.5 rounded flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    ) : (
                      <span className="ml-2 text-[10px] text-blue-400 font-semibold bg-blue-500/10 px-2 py-0.5 rounded-md hover:bg-blue-500/20 transition-colors">
                        Verify
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= Verify & Quiz Modal ================= */}
      {verifyModal.isOpen && activeSkill && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
          onClick={() => { if (!quizMode) setVerifyModal({ isOpen: false, skillId: null }) }}
        >
          <div
            className="bg-[#0d1117] border border-gray-700 rounded-3xl w-full max-w-md shadow-2xl max-h-[85vh] flex flex-col animate-in slide-in-from-right-10 duration-300"
            onClick={e => e.stopPropagation()}
          >
            {/* Header Bar — ล็อกไว้บนสุดเสมอ ไม่หายไป */}
            <div className="flex items-center justify-between px-6 py-4 bg-[#161b22] border-b border-gray-800 rounded-t-3xl shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xl">{quizMode ? "🧠" : "🛡️"}</span>
                <h3 className="font-bold text-white">Verify {activeSkill.name}</h3>
              </div>
              <button
                onClick={() => {
                  if (quizMode) {
                    setQuizMode(false);
                  } else {
                    setVerifyModal({ isOpen: false, skillId: null });
                  }
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-all"
                title={quizMode ? "Back" : "Close"}
              >
                ✕
              </button>
            </div>

            {/* Modal Body — ส่วนนี้เท่านั้นที่ Scroll ได้ */}
            <div className="p-6 overflow-y-auto no-scrollbar">
              {!quizMode ? (() => {
                 const currentLvl = getCurrentLevel(activeSkill.quizScore, activeSkill.endorsementScore);
                 return (
                // --- VERIFICATION OVERVIEW ---
                <>
                  <div className="flex justify-between items-center mb-6 bg-[#161b22] border border-gray-800 p-4 rounded-xl">
                    <p className="text-sm text-gray-400">
                      Level ปัจจุบัน: <strong className="text-white text-lg ml-2">{currentLvl.name} (Level {currentLvl.level})</strong>
                    </p>
                    {currentLvl.level < 3 && (
                      <span className="text-[11px] text-blue-400 font-bold bg-blue-500/10 px-2.5 py-1.5 rounded-lg border border-blue-500/20">
                        เป้าหมาย: Level {currentLvl.level + 1}
                      </span>
                    )}
                  </div>

                  <div className="space-y-4">
                    {/* Activity 1 */}
                    <div className="bg-[#161b22] p-4 rounded-2xl border border-gray-800 flex justify-between items-center">
                      <div>
                        <h4 className="text-white font-semibold text-sm mb-1">Endorsement</h4>
                        <p className="text-xs text-gray-500">
                          {currentLvl.level === 3 ? "ระดับสูงสุดแล้ว" : `ต้องการอีก ${Math.max(0, currentLvl.nextEndorse! - activeSkill.endorsementScore)} คนเพื่ออัปเลเวล`}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="block text-lg font-bold text-green-400 mb-1">{activeSkill.endorsementScore} / {currentLvl.level === 3 ? "5" : currentLvl.nextEndorse}</span>
                         <button
                            className="bg-green-600/10 text-green-400 border border-green-500/20 px-3 py-1 rounded-lg text-xs hover:bg-green-600/20 transition"
                            onClick={() => {
                              setVerifyModal({ isOpen: false, skillId: null });
                              if (onNavigateToEndorse) onNavigateToEndorse();
                            }}
                          >
                            ขอ Endorse
                          </button>
                      </div>
                    </div>

                    {/* Activity 2 */}
                    <div className="bg-[#161b22] p-4 rounded-2xl border border-gray-800 flex justify-between items-center">
                      <div>
                        <h4 className="text-white font-semibold text-sm mb-1">Quiz</h4>
                        <p className="text-xs text-gray-500">
                          {currentLvl.level === 3 ? "ระดับสูงสุดแล้ว" : `ทำให้ได้ ${currentLvl.nextQuiz} ขึ้นไป`}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="block text-lg font-bold text-cyan-400 mb-1">{activeSkill.quizScore} / {currentLvl.level === 3 ? "10" : currentLvl.nextQuiz}</span>
                         <button
                            className={`px-3 py-1 rounded-lg text-xs transition border flex items-center justify-center min-w-[90px] ${currentLvl.level === 3 || isGeneratingQuiz ? 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed' : 'bg-cyan-600/10 text-cyan-400 border-cyan-500/20 hover:bg-cyan-600/20'}`}
                            disabled={currentLvl.level === 3 || isGeneratingQuiz}
                            onClick={async () => {
                              setIsGeneratingQuiz(true);
                              const questions = await skillsService.generateAIQuiz(activeSkill.name, currentLvl.level);
                              setIsGeneratingQuiz(false);
                              if (questions && questions.length > 0) {
                                setGeneratedQuestions(questions);
                                setQuizQuestionIndex(0);
                                setQuizCurrentScore(0);
                                setQuizStatus("idle");
                                setQuizMode(true);
                              } else {
                                alert("Failed to generate quiz. Please try again.");
                              }
                            }}
                          >
                            {isGeneratingQuiz ? (
                              <svg className="animate-spin h-3.5 w-3.5 mr-1" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : null}
                            {isGeneratingQuiz ? 'AI...' : 'เริ่มทำควิซ'}
                          </button>
                      </div>
                    </div>
                  </div>

                  {currentLvl.level > 0 && (
                    <div className="mt-8 text-center p-4 bg-green-500/10 border border-green-500/30 rounded-2xl animate-in zoom-in-95">
                      <p className="text-green-400 font-bold mb-3">🔥 คุณผ่านเงื่อนไข Level {currentLvl.level} แล้ว!</p>
                      <button
                        onClick={() => {
                          setVerifyModal({ isOpen: false, skillId: null });
                          setBadgeModal({ isOpen: true, skillId: activeSkill.id });
                        }}
                        className="w-full py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] flex items-center justify-center gap-2"
                      >
                        🏅 รับ Badge {currentLvl.name} ปัจจุบันของคุณ!
                      </button>
                    </div>
                  )}
                 </>
                 );
               })() : (
                // --- QUIZ MODE ---
                <div className="animate-in slide-in-from-right-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs text-gray-500 font-bold uppercase">Question {quizQuestionIndex + 1} of 10</span>
                    <span className="text-xs text-blue-400 font-bold">Score: {quizCurrentScore}</span>
                  </div>

                  <p className="text-white font-medium mb-4 text-base">{generatedQuestions[quizQuestionIndex]?.q}</p>

                  <div className="space-y-2.5">
                    {generatedQuestions[quizQuestionIndex]?.opts.map((option: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => handleAnswer(index, activeSkill.id)}
                        disabled={quizStatus !== "idle"}
                        className="w-full text-left px-4 py-3 rounded-lg border border-gray-800 bg-[#161b22] hover:bg-gray-800 hover:border-gray-600 text-gray-300 text-sm transition-all focus:outline-none"
                      >
                        {option}
                      </button>
                    ))}
                  </div>

                  {quizStatus === "correct" && (
                    <div className="mt-4 p-2.5 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm font-medium flex items-center justify-center gap-2">
                      ✅ Correct! (+1 Score)
                    </div>
                  )}
                  {quizStatus === "wrong" && (
                    <div className="mt-4 p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm font-medium flex items-center justify-center gap-2">
                      ❌ Fail! (0 Score)
                    </div>
                  )}
                  {quizStatus === "finished" && (
                    <div className="mt-6 p-6 bg-gradient-to-br from-blue-500/20 to-cyan-900/40 border border-blue-500/40 rounded-2xl text-center animate-in zoom-in-95 duration-300">
                      <h4 className="text-cyan-400 font-bold text-lg mb-1">Quiz Completed!</h4>
                      <p className="text-gray-300 text-sm mb-4">
                        คุณทำได้ <span className="text-white font-bold">{quizCurrentScore} / 10</span> คะแนน
                      </p>
                      <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      , document.body)}

      {/* ================= Badge Certificate Modal ================= */}
      {badgeModal.isOpen && (() => {
        const activeBadge = skills.find(s => s.id === badgeModal.skillId);
        if (!activeBadge) return null;
        const currentLvl = getCurrentLevel(activeBadge.quizScore, activeBadge.endorsementScore);
        const credId = `skw-${String(activeBadge.id).replace(/[^a-z0-9]/gi, '').substring(0, 8) || Math.random().toString(36).substring(2, 10)}`;
        return createPortal(
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
            onClick={() => setBadgeModal({ isOpen: false, skillId: null })}
          >
            <div
              className="bg-[#0d1117] border border-gray-700 rounded-3xl w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-4 bg-[#161b22] border-b border-gray-800">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Skill Certificate</span>
                <button
                  onClick={() => setBadgeModal({ isOpen: false, skillId: null })}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-all"
                >
                  ✕
                </button>
              </div>

              <div className="flex flex-col items-center pt-8 pb-4 px-6">
                <div className={`w-20 h-20 rounded-full ${activeBadge.color} flex items-center justify-center shadow-lg relative mb-4`}>
                  <span className="text-3xl">🏅</span>
                  <div className="absolute -bottom-1 -right-1 bg-green-500 border-2 border-[#0d1117] w-6 h-6 rounded-full flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight">{activeBadge.name}</h3>
                <p className="text-blue-400 text-sm font-medium mt-1">Level {currentLvl.level} ({currentLvl.name})</p>
              </div>

              <div className="px-6 pb-6">
                <div className="bg-[#090d14] rounded-2xl border border-gray-800 mb-4 overflow-hidden">
                  <div className="flex bg-[#161b22] border-b border-gray-800/50">
                    <div className="flex-1 text-center border-r border-gray-800/50 p-3">
                       <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-0.5">Total</p>
                       <p className="text-lg text-green-400 font-black">{Math.min(15, activeBadge.quizScore + activeBadge.endorsementScore)}<span className="text-xs text-gray-600">/15</span></p>
                    </div>
                    <div className="flex-1 text-center border-r border-gray-800/50 p-3">
                       <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-0.5">Endorse</p>
                       <p className="text-lg text-gray-200 font-bold">{Math.min(5, activeBadge.endorsementScore)}<span className="text-xs text-gray-600">/5</span></p>
                    </div>
                    <div className="flex-1 text-center p-3">
                       <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-0.5">Quiz</p>
                       <p className="text-lg text-gray-200 font-bold">{Math.min(10, activeBadge.quizScore)}<span className="text-xs text-gray-600">/10</span></p>
                    </div>
                  </div>
                  <div className="px-4 py-3 flex items-center justify-between bg-[#0d1117]">
                     <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Credential ID</p>
                     <p className="text-[11px] text-gray-400 font-mono bg-black border border-gray-800 px-2 py-0.5 rounded">{credId}</p>
                  </div>
                </div>
                
                {currentLvl.level < 3 && (
                  <button 
                    onClick={() => {
                        setBadgeModal({ isOpen: false, skillId: null });
                        setVerifyModal({ isOpen: true, skillId: activeBadge.id, });
                        setQuizMode(false);
                    }}
                    className="w-full mt-4 border border-blue-500/30 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-none"
                  >
                     🔼 ทำชาเลนจ์อัปเกรด Level
                  </button>
                )}
              </div>
            </div>
          </div>
        , document.body);
      })()}
    </div>
  );
}