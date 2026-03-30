import { useState, useEffect } from "react";
import { skillsService } from "@/lib/services/skills.service";
import { useAuth } from "@/lib/hooks/useAuth";

export default function SkillsTab() {
  const { user, loading: authLoading } = useAuth();
  const [skills, setSkills] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ดึงข้อมูลจริงจาก Backend — รอ auth โหลดเสร็จก่อน
  useEffect(() => {
    if (authLoading) return;
    if (!user) { setIsLoading(false); return; }

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
          }));
          setSkills(formatted);
        }
      } catch (error) {
        console.error("Failed to fetch skills:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSkills();
  }, [authLoading, user]);

  // State modals
  const [quizModal, setQuizModal] = useState<{ isOpen: boolean; skillId: any }>({ isOpen: false, skillId: null });
  const [quizStatus, setQuizStatus] = useState<"idle" | "correct" | "wrong">("idle");
  const [badgeModal, setBadgeModal] = useState<{ isOpen: boolean; skillId: any }>({ isOpen: false, skillId: null });

  // Mock quiz ข้อมูล
  const mockQuiz: Record<string, any> = {
    "Python": {
      code: "def add_item(item, lst=[]):\n    lst.append(item)\n    return lst\n\nprint(add_item(1))\nprint(add_item(2))",
      question: "What is the output of the second print statement?",
      options: ["[2]", "[1, 2]", "Error", "None"],
      answer: 1
    },
    "Node.js": {
      code: "const fs = require('fs');\nfs.readFile('data.txt', () => console.log('1'));\nsetImmediate(() => console.log('2'));\nconsole.log('3');",
      question: "What is the order of console logs?",
      options: ["1, 2, 3", "3, 1, 2", "3, 2, 1", "Error"],
      answer: 2
    },
    "Default": {
      code: "console.log(typeof null);",
      question: "What does this code output?",
      options: ["null", "undefined", "object", "string"],
      answer: 2
    }
  };

  const categories = Array.from(new Set(skills.map(s => s.cat)));

  const handleAnswer = (optionIndex: number, skillName: string, skillId: any) => {
    const quizData = mockQuiz[skillName] || mockQuiz["Default"];
    if (optionIndex === quizData.answer) {
      setQuizStatus("correct");
      setTimeout(() => {
        setSkills(prev => prev.map(s => s.id === skillId ? { ...s, verified: true } : s));
        setQuizModal({ isOpen: false, skillId: null });
        setQuizStatus("idle");
      }, 2500);
    } else {
      setQuizStatus("wrong");
      setTimeout(() => setQuizStatus("idle"), 1500);
    }
  };

  const activeSkill = skills.find(s => s.id === quizModal.skillId);
  const activeQuiz = activeSkill ? (mockQuiz[activeSkill.name] || mockQuiz["Default"]) : null;

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
                        setQuizModal({ isOpen: true, skillId: skill.id });
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

      {/* ================= AI Quiz Modal ================= */}
      {quizModal.isOpen && activeSkill && activeQuiz && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 pt-20"
          onClick={() => setQuizModal({ isOpen: false, skillId: null })}
        >
          <div
            className="bg-[#0d1117] border border-gray-700 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Header Bar */}
            <div className="flex items-center justify-between px-6 py-4 bg-[#161b22] border-b border-gray-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">🤖</span>
                <h3 className="font-bold text-white">Verify {activeSkill.name} Skill</h3>
              </div>
              <button
                onClick={() => setQuizModal({ isOpen: false, skillId: null })}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-all"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <p className="text-sm text-gray-400 mb-3">Analyze the following code snippet generated by AI:</p>

              <div className="bg-[#090d14] p-4 rounded-xl border border-gray-800 mb-5 overflow-x-auto">
                <pre className="text-sm font-mono text-blue-300">
                  <code>{activeQuiz.code}</code>
                </pre>
              </div>

              <p className="text-white font-medium mb-4">{activeQuiz.question}</p>

              <div className="space-y-2">
                {activeQuiz.options.map((option: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index, activeSkill.name, activeSkill.id)}
                    disabled={quizStatus === "correct"}
                    className="w-full text-left px-4 py-3 rounded-xl border border-gray-800 bg-[#161b22] hover:bg-gray-800 hover:border-gray-600 text-gray-300 text-sm transition-all focus:outline-none"
                  >
                    {option}
                  </button>
                ))}
              </div>

              {quizStatus === "correct" && (
                <div className="mt-6 p-6 bg-gradient-to-br from-green-500/20 to-emerald-900/40 border border-green-500/40 rounded-2xl text-center animate-in zoom-in-95 duration-300">
                  <div className="text-5xl mb-3 animate-bounce">🏅</div>
                  <h4 className="text-green-400 font-bold text-lg mb-1">Congratulations!</h4>
                  <p className="text-gray-300 text-sm">
                    คุณผ่านการทดสอบและได้รับ Badge <br />
                    <span className="text-white font-bold px-2 py-0.5 bg-[#161b22] rounded mt-2 inline-block border border-gray-700">
                      {activeSkill.name}
                    </span>
                  </p>
                </div>
              )}

              {quizStatus === "wrong" && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center font-medium animate-pulse">
                  ❌ Incorrect. Analyze the logic and try again.
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
              {/* ── Header Bar ── ปุ่มปิดอยู่บนสุดเสมอ */}
              <div className="flex items-center justify-between px-5 py-4 bg-[#161b22] border-b border-gray-800">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Skill Certificate</span>
                <button
                  onClick={() => setBadgeModal({ isOpen: false, skillId: null })}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-all"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              {/* ── Badge Icon ── */}
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
                <p className="text-blue-400 text-sm font-medium mt-1">Verified Skill</p>
              </div>

              {/* ── รายละเอียด ── */}
              <div className="px-6 pb-6 space-y-3">
                <div className="bg-[#090d14] rounded-2xl p-4 border border-gray-800 space-y-3 text-left">
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Verification Method</p>
                    <p className="text-sm text-green-400 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      AI-Powered Assessment
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Issue Date</p>
                    <p className="text-sm text-gray-300">
                      {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Credential ID</p>
                    <p className="text-xs text-gray-400 font-mono bg-[#161b22] px-2 py-1 rounded">{credId}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => { navigator.clipboard.writeText(credId); }}
                    className="bg-[#161b22] hover:bg-gray-800 border border-gray-700 text-gray-300 py-2.5 rounded-xl text-sm font-medium transition-colors flex justify-center items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy ID
                  </button>
                  <button className="bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl text-sm font-medium transition-colors flex justify-center items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}