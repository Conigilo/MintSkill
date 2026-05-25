"use client";

import { useState, useEffect } from "react";
import { endorsementService } from "@/lib/services/endorsements.service";

interface ApproveEndorseModalProps {
  requestId: string;
  targetUserId: string;
  targetName: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ApproveEndorseModal({
  requestId,
  targetUserId,
  targetName,
  onClose,
  onSuccess,
}: ApproveEndorseModalProps) {
  const [skills, setSkills] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [fromRole, setFromRole] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingSkills, setIsFetchingSkills] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadSkills = async () => {
      try {
        const data = await endorsementService.getUserSkills(targetUserId);
        setSkills(Array.from(new Set(data.map((s) => s.name))));
      } catch {
        setSkills([]);
      } finally {
        setIsFetchingSkills(false);
      }
    };
    loadSkills();
  }, [targetUserId]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleSubmit = async () => {
    if (!selectedSkills.length) {
      setError("กรุณาเลือกทักษะที่ต้องการรับรองอย่างน้อย 1 ทักษะ");
      return;
    }
    if (!message.trim()) {
      setError("กรุณากรอกข้อความรับรองหรือความเห็นสั้นๆ");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await endorsementService.approveEndorsementRequest(requestId, {
        skills: selectedSkills,
        message: message.trim(),
        fromRole: fromRole.trim() || undefined,
      });
      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      setError(msg || "เกิดข้อผิดพลาดในการอนุมัติคำขอรับรอง");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#ffffff] border border-slate-200 dark:bg-[#161b22] dark:border-[#30363d] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-[#21262d] flex justify-between items-center bg-[#ffffff] dark:bg-[#161b22]">
          <h3 className="font-bold text-slate-900 dark:text-white">
            รับรองทักษะให้ {targetName}
          </h3>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-5">
          {success ? (
            <div className="text-center py-6">
              <div className="text-4xl mb-3">🎉</div>
              <p className="text-green-500 font-semibold">อนุมัติการรับรองสำเร็จเรียบร้อย!</p>
            </div>
          ) : (
            <>
              {/* Skills Selection */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  เลือกทักษะที่ต้องการรับรอง *
                </label>
                {isFetchingSkills ? (
                  <p className="text-slate-400 text-xs">กำลังโหลดทักษะ...</p>
                ) : skills.length === 0 ? (
                  <p className="text-slate-400 text-xs">ผู้ใช้คนนี้ยังไม่มีรายการทักษะบันทึกไว้</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => {
                      const isSelected = selectedSkills.includes(skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSkill(skill)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                            isSelected
                              ? "bg-blue-600 border-blue-600 text-white"
                              : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 dark:bg-[#0d1117] dark:border-[#30363d] dark:text-slate-300 dark:hover:border-[#8b949e]"
                          }`}
                        >
                          {skill}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Approver Role */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  บทบาทของคุณ <span className="text-slate-400 dark:text-slate-500 normal-case font-normal">(ระบุหรือไม่ก็ได้)</span>
                </label>
                <input
                  type="text"
                  placeholder="เช่น Senior Frontend Dev หรือ Project Manager"
                  value={fromRole}
                  onChange={(e) => setFromRole(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-slate-200 dark:bg-[#0d1117] dark:border-[#30363d] text-slate-800 dark:text-[#f0f6fc] text-xs px-3 py-2.5 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Message */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  ข้อความรับรอง *
                </label>
                <textarea
                  rows={3}
                  placeholder={`เขียนแนะนำจุดเด่นในการทำงานร่วมกันของ ${targetName}...`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-slate-200 dark:bg-[#0d1117] dark:border-[#30363d] text-slate-800 dark:text-[#f0f6fc] text-xs px-3 py-2.5 rounded-lg focus:outline-none focus:border-blue-500 transition-colors resize-none leading-relaxed"
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 text-xs px-3 py-2 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-slate-200 dark:border-[#30363d] text-slate-600 dark:text-slate-400 text-xs font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-[#21262d]"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading || isFetchingSkills || skills.length === 0}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg transition-all"
                >
                  {isLoading ? "กำลังทำงาน..." : "ยืนยันรับรอง"}
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
