import { useState, useEffect } from "react";
import { skillsService, type Skill } from "@/lib/services/skills.service";

export default function SkillsTab() {
  const [skills, setSkills] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ดึงข้อมูลจริงจาก Backend
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const data = await skillsService.getMySkills();
        if (data) {
          // แปลงข้อมูลจาก Backend ให้เข้ากับ UI
          const formatted = data.map((s: any) => ({
            id: s.id,
            name: s.name,
            cat: s.category || "OTHER",
            level: s.level || 0,
            color: s.category === "LANGUAGES" ? "bg-yellow-400" : 
                   s.category === "FRAMEWORKS & TOOLS" ? "bg-cyan-400" : "bg-purple-500",
            verified: s.verified || false
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
  }, []);


  // 2. State สำหรับควบคุมหน้าต่างข้อสอบ (Modal)
  const [quizModal, setQuizModal] = useState<{ isOpen: boolean; skillId: number | null }>({ isOpen: false, skillId: null });
  const [quizStatus, setQuizStatus] = useState<"idle" | "correct" | "wrong">("idle");
  const [badgeModal, setBadgeModal] = useState<{ isOpen: boolean; skillId: number | null }>({ isOpen: false, skillId: null });

  // 3. Mockup ข้อมูลโจทย์ AI (ถ้าต่อ API จริง ก็ให้ Gemini เจนข้อมูลโครงสร้างนี้ส่งมา)
  const mockQuiz: Record<string, any> = {
    "Python": {
      code: "def add_item(item, lst=[]):\n    lst.append(item)\n    return lst\n\nprint(add_item(1))\nprint(add_item(2))",
      question: "What is the output of the second print statement?",
      options: ["[2]", "[1, 2]", "Error", "None"],
      answer: 1 // Index ที่ถูกต้องคือ [1, 2] (Mutable default argument)
    },
    "Node.js": {
      code: "const fs = require('fs');\nfs.readFile('data.txt', () => console.log('1'));\nsetImmediate(() => console.log('2'));\nconsole.log('3');",
      question: "What is the order of console logs?",
      options: ["1, 2, 3", "3, 1, 2", "3, 2, 1", "Error"],
      answer: 2
    },
    // สกิลอื่นๆ ใส่ Default ไว้
    "Default": {
      code: "console.log(typeof null);",
      question: "What does this code output?",
      options: ["null", "undefined", "object", "string"],
      answer: 2
    }
  };

  // ฟังก์ชันจัดกลุ่มทักษะตาม Category
  const categories = Array.from(new Set(skills.map(s => s.cat)));

  // ฟังก์ชันตรวจคำตอบ
  const handleAnswer = (optionIndex: number, skillName: string, skillId: number) => {
    const quizData = mockQuiz[skillName] || mockQuiz["Default"];

    if (optionIndex === quizData.answer) {
      setQuizStatus("correct");
      // หน่วงเวลา 2.5 วินาที เพื่อให้อ่านคำยินดีทัน
      setTimeout(() => {
        setSkills(prev => {
          const next = prev.map(s => s.id === skillId ? { ...s, verified: true } : s);
          // อัปเดตเก็บเข้า localStorage ไว้เลย จะได้อมตะ
          const verifiedIds = next.filter(s => s.verified).map(s => s.id);
          localStorage.setItem("verified_skills", JSON.stringify(verifiedIds));
          return next;
        });
        setQuizModal({ isOpen: false, skillId: null });
        setQuizStatus("idle");
      }, 2500);
    } else {
      setQuizStatus("wrong");
      setTimeout(() => setQuizStatus("idle"), 1500);
    }
  };

  // ดึงข้อมูลสกิลที่กำลังสอบอยู่
  const activeSkill = skills.find(s => s.id === quizModal.skillId);
  const activeQuiz = activeSkill ? (mockQuiz[activeSkill.name] || mockQuiz["Default"]) : null;

  if (isLoading) {
    return (
      <div className="glass-panel p-8 rounded-3xl animate-pulse flex items-center justify-center min-h-[400px]">
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

      <div className="space-y-8">
        {categories.map((cat, idx) => (
          <div key={idx}>
            <p className="text-xs text-gray-500 font-bold mb-4 uppercase tracking-wider">{cat}</p>
            <div className="flex flex-wrap gap-3">
              {skills.filter(s => s.cat === cat).map((skill) => (
                // UI ของ Skill Badge (แยกสไตล์ระหว่าง Verified กับ Unverified)
                <div
                  key={skill.id}
                  className={`px-4 py-2 rounded-full flex items-center gap-2 text-sm transition-all duration-300 cursor-pointer ${skill.verified
                    ? "bg-[#161b22] border border-gray-700/50 shadow-[0_0_10px_rgba(255,255,255,0.05)] hover:border-gray-500"
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
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
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

      {/* ================= AI Quiz Modal ================= */}
      {quizModal.isOpen && activeSkill && activeQuiz && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0d1117] border border-gray-700 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center bg-[#161b22]">
              <div className="flex items-center gap-2">
                <span className="text-xl">🤖</span>
                <h3 className="font-bold text-white">Verify {activeSkill.name} Skill</h3>
              </div>
              <button
                onClick={() => setQuizModal({ isOpen: false, skillId: null })}
                className="text-gray-500 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <p className="text-sm text-gray-400 mb-3">Analyze the following code snippet generated by AI:</p>

              {/* Code Snippet Box */}
              <div className="bg-[#090d14] p-4 rounded-xl border border-gray-800 mb-5 overflow-x-auto">
                <pre className="text-sm font-mono text-blue-300">
                  <code>{activeQuiz.code}</code>
                </pre>
              </div>

              <p className="text-white font-medium mb-4">{activeQuiz.question}</p>

              {/* Multiple Choice Options */}
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

              {/* Status Indicator: ถ้าตอบถูก จะขึ้นการ์ดยินดีด้วย */}
              {quizStatus === "correct" && activeSkill && (
                <div className="mt-6 p-6 bg-gradient-to-br from-green-500/20 to-emerald-900/40 border border-green-500/40 rounded-2xl text-center animate-in zoom-in-95 duration-300 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
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

              {/* ถ้าตอบผิด ให้โชว์แบบเดิม */}
              {quizStatus === "wrong" && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center font-medium animate-pulse">
                  ❌ Incorrect. Analyze the logic and try again.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* ================= Badge Modal ================= */}
      {badgeModal.isOpen && (
        (() => {
          const activeBadge = skills.find(s => s.id === badgeModal.skillId);
          if (!activeBadge) return null;
          return (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="bg-[#0d1117] border border-gray-700 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header สีสวยๆ ตามสีของสกิล */}
                <div className="relative h-24 bg-[#161b22] flex justify-center items-end pb-0 border-b border-gray-800">
                  <div className="absolute top-4 right-4">
                    <button onClick={() => setBadgeModal({ isOpen: false, skillId: null })} className="text-gray-500 hover:text-white bg-black/50 rounded-full w-8 h-8 flex items-center justify-center transition-colors">✕</button>
                  </div>
                  {/* ไอคอนเหรียญตรา */}
                  <div className={`w-20 h-20 rounded-full border-4 border-[#0d1117] flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.1)] translate-y-1/2 bg-[#161b22] relative`}>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center bg-opacity-20 ${activeBadge.color.replace('bg-', 'bg-')}`}>
                      <span className={`w-8 h-8 rounded-full ${activeBadge.color}`}></span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-green-500 border-2 border-[#0d1117] text-white w-6 h-6 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                  </div>
                </div>

                {/* Body ข้อมูลใบรับรอง */}
                <div className="px-6 pt-14 pb-8 text-center space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white tracking-tight">{activeBadge.name}</h3>
                    <p className="text-blue-400 text-sm font-medium mt-1">Verified Skill</p>
                  </div>

                  <div className="bg-[#090d14] rounded-2xl p-4 border border-gray-800 text-left space-y-3 mt-4">
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Issued To</p>
                      <p className="text-sm text-gray-200">Sarit Sridit (@fiu_dev)</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Verification Method</p>
                      <p className="text-sm text-green-400 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
                        AI-Powered Assessment
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Issue Date</p>
                      <p className="text-sm text-gray-300">March 27, 2026</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Credential ID</p>
                      <p className="text-xs text-gray-400 font-mono bg-[#161b22] px-2 py-1 rounded">skw-{Math.random().toString(36).substring(2, 10)}</p>
                    </div>
                  </div>

                  <button className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white py-2.5 rounded-xl text-sm font-medium transition-colors flex justify-center items-center gap-2 mt-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                    Share Credential
                  </button>
                </div>
              </div>
            </div>
          );
        })()
      )}
    </div>
  );
}