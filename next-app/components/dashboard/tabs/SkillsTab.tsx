import { useState, useEffect } from "react";
import { skillsService } from "@/lib/services/skills.service";
import { useAuth } from "@/lib/hooks/useAuth";

export default function SkillsTab({ onNavigateToEndorse }: { onNavigateToEndorse?: () => void }) {
  const { user, loading: authLoading } = useAuth();
  const [skills, setSkills] = useState<{id: string, name: string, cat: string, level: number, color: string, verified: boolean, quizScore: number, endorsementScore: number}[]>([]);
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

  // Mock quiz: 4 questions per skill (generic fallback used for simplicity)
  const mockQuizzes: Record<string, any[]> = {
    "Python": [
      { q: "What is the output of print(2 ** 3)?", opts: ["6", "8", "9", "Error"], a: 1 },
      { q: "Which of the following is mutable?", opts: ["Tuple", "String", "List", "Integer"], a: 2 },
      { q: "What does len() do?", opts: ["Returns length", "Adds item", "Loops array", "Deletes item"], a: 0 },
      { q: "How to define a function in Python?", opts: ["function", "def", "func", "=>"], a: 1 },
    ],
    "Node.js": [
      { q: "Which core module is for filesystem?", opts: ["path", "fs", "http", "os"], a: 1 },
      { q: "Node.js runs on which engine?", opts: ["V8", "SpiderMonkey", "Chakra", "WebKit"], a: 0 },
      { q: "What is npm?", opts: ["Node Package Manager", "New Project Module", "Network Protocol", "None"], a: 0 },
      { q: "Which method is used to read a file async?", opts: ["readFileSync", "read", "readFile", "getFile"], a: 2 },
    ]
  };

  const getQuestions = (skillName: string) => {
    return mockQuizzes[skillName] || [
      { q: `What is the primary use case of ${skillName}?`, opts: ["Web Design", "Backend logic", "Data structure", "Depends on context"], a: 3 },
      { q: `Is ${skillName} statically or dynamically typed (usually)?`, opts: ["Static", "Dynamic", "Both", "Neither"], a: 1 },
      { q: `Which symbol usually represents a block in ${skillName}?`, opts: ["{ }", "[ ]", "( )", "< >"], a: 0 },
      { q: `How do you output a log in ${skillName}?`, opts: ["print", "console.log", "echo", "Can be any"], a: 3 },
    ];
  };

  const categories = Array.from(new Set(skills.map(s => s.cat)));

  const handleAnswer = (optionIndex: number, skillId: string) => {
    const activeSkill = skills.find(s => s.id === skillId);
    if (!activeSkill) return;

    const questions = getQuestions(activeSkill.name);
    const correct = optionIndex === questions[quizQuestionIndex].a;
    
    if (correct) {
      setQuizCurrentScore(prev => prev + 1);
      setQuizStatus("correct");
    } else {
      setQuizStatus("wrong");
    }

    setTimeout(() => {
      if (quizQuestionIndex + 1 < 4) {
        setQuizQuestionIndex(prev => prev + 1);
        setQuizStatus("idle");
      } else {
        // Finished all 4
        setQuizStatus("finished");
        finishQuiz(skillId, quizCurrentScore + (correct ? 1 : 0));
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
                    className={`px-4 py-2 rounded-full flex items-center gap-2 text-sm transition-all duration-300 cursor-pointer ${
                      skill.verified
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
      {verifyModal.isOpen && activeSkill && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => { if(!quizMode) setVerifyModal({ isOpen: false, skillId: null }) }}
        >
          <div
            className="bg-[#0d1117] border border-gray-700 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Header Bar */}
            <div className="flex items-center justify-between px-6 py-4 bg-[#161b22] border-b border-gray-800">
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

            {/* Modal Body */}
            <div className="p-6">
              {!quizMode ? (
                // --- VERIFICATION OVERVIEW ---
                <>
                  <p className="text-sm text-gray-400 mb-6">
                    ต้องมีคะแนนอย่างน้อย <strong className="text-white">8 เต็ม 10</strong> ถึงจะได้รับการ Verify ให้ทำ 2 กิจกรรมด้านล่างเพื่อสะสมคะแนน:
                  </p>

                  {/* Progress */}
                  <div className="mb-8">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-xs font-bold text-gray-500 uppercase">Verification Progress</span>
                      <span className="text-sm font-bold text-blue-400">{activeSkill.quizScore + activeSkill.endorsementScore} / 10</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, ((activeSkill.quizScore + activeSkill.endorsementScore) / 10) * 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Activity 1 */}
                    <div className="bg-[#161b22] p-4 rounded-2xl border border-gray-800 flex justify-between items-center">
                      <div>
                        <h4 className="text-white font-semibold text-sm mb-1">1. Peer Endorsement (Max: 6)</h4>
                        <p className="text-xs text-gray-500">ให้เพื่อนรับรองสกิลนี้ของคุณ</p>
                      </div>
                      <div className="text-right">
                        <span className="block text-lg font-bold text-green-400 mb-1">{activeSkill.endorsementScore}/6</span>
                        {activeSkill.endorsementScore === 0 && (
                          <button 
                            className="bg-green-600/10 text-green-400 border border-green-500/20 px-3 py-1 rounded-lg text-xs hover:bg-green-600/20 transition"
                            onClick={() => { 
                              setVerifyModal({isOpen: false, skillId: null}); 
                              if (onNavigateToEndorse) onNavigateToEndorse(); 
                            }}
                          >
                            ขอ Endorse
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Activity 2 */}
                    <div className="bg-[#161b22] p-4 rounded-2xl border border-gray-800 flex justify-between items-center">
                      <div>
                        <h4 className="text-white font-semibold text-sm mb-1">2. AI Quiz (Max: 4)</h4>
                        <p className="text-xs text-gray-500">ตอบ 4 คำถามพื้นฐานสั้นๆ</p>
                      </div>
                      <div className="text-right">
                        <span className="block text-lg font-bold text-cyan-400 mb-1">{activeSkill.quizScore}/4</span>
                        {activeSkill.quizScore < 4 && (
                          <button 
                            className="bg-cyan-600/10 text-cyan-400 border border-cyan-500/20 px-3 py-1 rounded-lg text-xs hover:bg-cyan-600/20 transition"
                            onClick={() => {
                              setQuizQuestionIndex(0);
                              setQuizCurrentScore(0);
                              setQuizStatus("idle");
                              setQuizMode(true);
                            }}
                          >
                            Take Quiz
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {(activeSkill.quizScore + activeSkill.endorsementScore) >= 8 && (
                    <div className="mt-8 text-center p-4 bg-green-500/10 border border-green-500/30 rounded-2xl animate-pulse">
                      <p className="text-green-400 font-bold mb-1">🎉 You passed the requirements!</p>
                      <p className="text-green-500/80 text-xs text-center">รอเซิร์ฟเวอร์ระบบอัปเดตสักครู่ แล้วคุณจะได้รับ Badge</p>
                    </div>
                  )}
                  {(activeSkill.quizScore + activeSkill.endorsementScore) < 8 && activeSkill.endorsementScore === 6 && activeSkill.quizScore > 0 && (
                     <div className="mt-8 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-400 text-xs text-center font-medium">
                      ⚠️ คะแนนยังไม่ถึง 8 ลองทำ Test ทวนซ้ำหรือขอ Endorse เพิ่มเติม!
                     </div>
                  )}

                </>
              ) : (
                // --- QUIZ MODE ---
                <div className="animate-in slide-in-from-right-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs text-gray-500 font-bold uppercase">Question {quizQuestionIndex + 1} of 4</span>
                    <span className="text-xs text-blue-400 font-bold">Score: {quizCurrentScore}</span>
                  </div>
                  
                  <p className="text-white font-medium mb-4 text-base">{getQuestions(activeSkill.name)[quizQuestionIndex].q}</p>

                  <div className="space-y-2.5">
                    {getQuestions(activeSkill.name)[quizQuestionIndex].opts.map((option: string, index: number) => (
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
                      ✅ ถูกต้อง! (+1 Score)
                    </div>
                  )}
                  {quizStatus === "wrong" && (
                    <div className="mt-4 p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm font-medium flex items-center justify-center gap-2">
                      ❌ ผิดจ้า (0 Score)
                    </div>
                  )}
                  {quizStatus === "finished" && (
                     <div className="mt-6 p-6 bg-gradient-to-br from-blue-500/20 to-cyan-900/40 border border-blue-500/40 rounded-2xl text-center animate-in zoom-in-95 duration-300">
                       <h4 className="text-cyan-400 font-bold text-lg mb-1">Quiz Completed!</h4>
                       <p className="text-gray-300 text-sm mb-4">
                         คุณทำได้ <span className="text-white font-bold">{quizCurrentScore} / 4</span> คะแนน
                       </p>
                       <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                     </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= Badge Certificate Modal ================= */}
      {badgeModal.isOpen && (() => {
        const activeBadge = skills.find(s => s.id === badgeModal.skillId);
        if (!activeBadge) return null;
        const credId = `skw-${String(activeBadge.id).replace(/[^a-z0-9]/gi, '').substring(0, 8) || Math.random().toString(36).substring(2, 10)}`;
        return (
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
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
                <p className="text-blue-400 text-sm font-medium mt-1">Verified Expert</p>
              </div>

              <div className="px-6 pb-6 space-y-3">
                <div className="bg-[#090d14] rounded-2xl p-4 border border-gray-800 space-y-3 text-left">
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Score Report</p>
                    <p className="text-sm text-green-400 font-medium">
                      Total: {activeBadge.quizScore + activeBadge.endorsementScore}/10
                    </p>
                    <p className="text-[10px] text-gray-500 mt-1">Endorsements: {activeBadge.endorsementScore}/6 | Quiz: {activeBadge.quizScore}/4</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Credential ID</p>
                    <p className="text-xs text-gray-400 font-mono bg-[#161b22] px-2 py-1 rounded">{credId}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}