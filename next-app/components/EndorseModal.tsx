"use client";

import { useState, useEffect } from "react";
import { endorsementService } from "@/lib/services/endorsements.service";

interface EndorseModalProps {
  targetUserId: string;
  targetName: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function EndorseModal({ targetUserId, targetName, onClose, onSuccess }: EndorseModalProps) {
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
      setError("Please select at least one skill.");
      return;
    }
    if (!message.trim()) {
      setError("Please write a short message.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await endorsementService.directEndorse({
        toUserId: targetUserId,
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
      const msg = (err instanceof Error ? err.message : "").toUpperCase();
      if (msg.includes("ALREADY_ENDORSED") || msg.includes("ALREADY ENDORSED")) {
        setError("คุณเคยให้การรับรองนักพัฒนาท่านนี้ไปแล้ว");
      } else if (msg.includes("CANNOT_ENDORSE_SELF") || msg.includes("CANNOT ENDORSE YOURSELF")) {
        setError("คุณไม่สามารถรับรองทักษะให้ตัวเองได้");
      } else {
        setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white border border-slate-300 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-white">
          <h3 className="font-bold text-slate-900">Endorse {targetName}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 transition-colors">✕</button>
        </div>

        <div className="p-6 space-y-5">
          {success ? (
            <div className="text-center py-6">
              <div className="text-4xl mb-3">🎉</div>
              <p className="text-green-400 font-semibold">Endorsement sent!</p>
            </div>
          ) : (
            <>
              {/* Skills */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Select Skills to Endorse
                </label>
                {isFetchingSkills ? (
                  <p className="text-slate-400 text-sm">Loading skills...</p>
                ) : skills.length === 0 ? (
                  <p className="text-slate-400 text-sm">This user has no skills listed.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <button
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${selectedSkills.includes(skill)
                          ? "bg-blue-500/20 border-blue-500/60 text-blue-300"
                          : "bg-slate-100 border-slate-300 text-slate-500 hover:border-slate-400"
                          }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Your Role (optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Your Role <span className="text-slate-400 normal-case font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Senior Engineer @ LINE"
                  value={fromRole}
                  onChange={(e) => setFromRole(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-gray-600 focus:border-blue-500 outline-none text-sm transition-colors"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Message
                </label>
                <textarea
                  rows={3}
                  placeholder={`Say something great about ${targetName}...`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-gray-600 focus:border-blue-500 outline-none text-sm transition-colors resize-none"
                />
              </div>

              {error && (
                <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
                  {error}
                </p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-500 hover:text-slate-900 hover:border-slate-400 text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || isFetchingSkills || skills.length === 0}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 text-sm font-semibold transition-colors"
                >
                  {isLoading ? "Sending..." : "Send Endorsement"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
