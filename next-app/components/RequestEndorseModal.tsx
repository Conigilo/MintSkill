"use client";

import { useState } from "react";
import { endorsementService } from "@/lib/services/endorsements.service";

interface RequestEndorseModalProps {
  targetUserId: string;
  targetName: string;
  targetEmail?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function RequestEndorseModal({
  targetUserId,
  targetName,
  targetEmail = "",
  onClose,
  onSuccess,
}: RequestEndorseModalProps) {
  const [message, setMessage] = useState("ช่วยรับรองทักษะการทำงานให้หน่อยสิ ว่าเราเคยทำงานร่วมกัน");
  const [recipientEmail, setRecipientEmail] = useState(targetEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successLink, setSuccessLink] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await endorsementService.requestEndorsement(
        targetName,
        recipientEmail || undefined,
        message.trim()
      );
      
      const link = res?.data?.link || res?.link;
      if (link) {
        setSuccessLink(link);
      } else {
        throw new Error("ลิงก์คำขอไม่ถูกต้อง");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      setError(msg || "เกิดข้อผิดพลาดในการสร้างคำขอคำรับรอง กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (successLink) {
      navigator.clipboard.writeText(successLink);
      alert("คัดลอกลิงก์แล้ว! ส่งต่อให้กับ " + targetName + " ได้เลย");
      onSuccess?.();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-[#21262d] flex justify-between items-center bg-white dark:bg-[#161b22]">
          <h3 className="font-bold text-slate-900 dark:text-white">
            {successLink ? "สร้างลิงก์คำขอสำเร็จ" : `ขอคำรับรองจาก ${targetName}`}
          </h3>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-400 px-4 py-3 rounded-xl mb-4 text-xs font-semibold">
              {error}
            </div>
          )}

          {successLink ? (
            <div className="space-y-4 text-center py-2">
              <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                ✓
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                สร้างลิงก์ส่งคำขอเรียบร้อยแล้ว!
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ส่งลิงก์ด้านล่างให้กับ <strong>{targetName}</strong> เพื่อเข้าสู่หน้ากรอกการยืนยันและประเมินทักษะของคุณ
              </p>

              <div className="bg-slate-50 border border-slate-200 dark:bg-[#0d1117] dark:border-[#21262d] rounded-xl p-4 text-left space-y-2 mt-4">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  ลิงก์สำหรับส่งต่อ:
                </span>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={successLink}
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                    className="bg-white border border-slate-200 dark:bg-[#161b22] dark:border-[#30363d] px-3 py-2 text-xs font-mono text-slate-600 dark:text-slate-300 w-full focus:outline-none rounded-lg"
                  />
                  <button
                    onClick={handleCopy}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all active:scale-95 whitespace-nowrap"
                  >
                    คัดลอกลิงก์
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-200 dark:border-[#30363d] text-slate-600 dark:text-slate-400 text-xs font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-[#21262d]"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  ชื่อผู้รับรอง
                </label>
                <input
                  type="text"
                  disabled
                  value={targetName}
                  className="w-full bg-slate-50 border border-slate-200 dark:bg-[#0d1117] dark:border-[#30363d] text-slate-500 dark:text-[#8b949e] text-xs px-3 py-2.5 rounded-lg cursor-not-allowed"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  อีเมลผู้รับรอง (ถ้ามี)
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="w-full bg-white border border-slate-200 dark:bg-[#0d1117] dark:border-[#30363d] text-slate-800 dark:text-[#f0f6fc] text-xs px-3 py-2.5 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  ข้อความฝากถึง {targetName}
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="เช่น ช่วยรับรองทักษะการเขียนเว็บให้หน่อย..."
                  className="w-full bg-white border border-slate-200 dark:bg-[#0d1117] dark:border-[#30363d] text-slate-800 dark:text-[#f0f6fc] text-xs px-3 py-2.5 rounded-lg focus:outline-none focus:border-blue-500 transition-colors resize-none leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-200 dark:border-[#30363d] text-slate-600 dark:text-slate-400 text-xs font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-[#21262d]"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-all active:scale-95"
                >
                  {isLoading ? "กำลังสร้างคำขอ..." : "ส่งคำขอ"}
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
