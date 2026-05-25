"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchAPI } from "@/lib/services/api";
import { useAuth } from "@/lib/hooks/useAuth";
import Image from "next/image";

export default function EndorsePage() {
  const { token } = useParams() as { token: string };
  const router = useRouter();
  const { user, loginWithGithub, logout, loading: authLoading } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [info, setInfo] = useState<{ toUserId: string; toUser: any; availableSkills: string[] } | null>(null);

  const [fromRole, setFromRole] = useState("");
  const [message, setMessage] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetchAPI(`/endorsements/verify/${token}`)
      .then((res: any) => {
        const payload = res.data || res;
        if (payload.valid) {
          setInfo(payload);
        } else {
          setError("This endorsement link is invalid or has expired.");
        }
      })
      .catch((e) => setError("Failed to load endorsement link info."))
      .finally(() => setIsLoading(false));
  }, [token]);

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSkills.length === 0) return alert("Please select at least one skill to endorse.");
    if (!message) return alert("Please write a message.");
    if (!user) return alert("You must be logged in to endorse.");

    setIsSubmitting(true);
    try {
      await fetchAPI(`/endorsements/submit/${token}`, {
        method: "POST",
        body: JSON.stringify({
          fromName: user.displayName || user.email?.split('@')[0] || "Anonymous Developer",
          fromRole,
          message,
          skills: selectedSkills,
          fromUserId: user.uid,
        }),
      });
      setSuccess(true);
    } catch (e: any) {
      alert(e.message || "Failed to submit endorsement");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || authLoading) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-[#0d1117] flex justify-center items-center">
        <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
      </main>
    );
  }

  const isSelf = user && info && user.uid === info.toUserId;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0d1117] text-slate-900 dark:text-[#f0f6fc] py-24 px-6 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-2xl mx-auto relative z-10">
        {error ? (
          <div className="text-center p-12 bg-white dark:bg-[#161b22] rounded-3xl border border-red-500/30">
            <p className="text-red-400">{error}</p>
          </div>
        ) : success ? (
          <div className="text-center p-12 bg-white dark:bg-[#161b22] rounded-3xl border border-green-500/30">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Endorsement Sent!</h2>
            <p className="text-slate-500 dark:text-[#8b949e] mb-8 text-sm">Thank you for validating your colleague's skills. They will earn 6 points towards their skill verification badge.</p>
            <button
              onClick={() => router.push("/dashboard")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold cursor-pointer"
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#161b22] p-8 md:p-12 rounded-[2rem] border border-slate-200 dark:border-[#30363d] relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-green-500 rounded-t-[2rem]" />

            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold border-4 border-slate-100 dark:border-[#090d14]">
                {info?.toUser?.displayName?.[0] || 'U'}
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Endorse {info?.toUser?.displayName || "this user"}
              </h1>
              <p className="text-slate-500 dark:text-[#8b949e] text-sm">
                Your endorsement gives them score points towards earning their verified badges.
              </p>
            </div>

            {isSelf ? (
              <div className="bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-400 p-6 rounded-2xl text-center space-y-4">
                <span className="text-2xl">💡</span>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">คุณไม่สามารถรับรองทักษะให้ตัวเองได้</h3>
                <p className="text-xs text-slate-500 dark:text-[#8b949e] leading-relaxed max-w-md mx-auto">
                  ลิงก์นี้ใช้สำหรับส่งต่อให้ผู้อื่น เช่น เพื่อนร่วมงานหรือหัวหน้างานเพื่อการประเมินและรับรองทักษะต่างๆ ของคุณ
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert("คัดลอกลิงก์เรียบร้อยแล้ว! ส่งลิงก์นี้ให้ผู้อื่นเพื่อรับรองคุณ");
                    }}
                    className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 px-4 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    คัดลอกลิงก์สำหรับแชร์ (Copy Share Link)
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-[#8b949e] mb-2.5">1. Select Skills to Endorse</label>
                  <div className="flex flex-wrap gap-2">
                    {info?.availableSkills.map((skill) => (
                      <button
                        type="button"
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        className={`px-4 py-2 rounded-full text-xs font-medium transition-colors border cursor-pointer ${selectedSkills.includes(skill)
                          ? "bg-blue-600 border-blue-500 text-white"
                          : "bg-white dark:bg-[#0d1117] border-slate-300 dark:border-[#30363d] text-slate-500 dark:text-[#8b949e] hover:border-slate-400 dark:hover:border-[#484f58]"
                          }`}
                      >
                        {skill}
                      </button>
                    ))}
                    {info?.availableSkills.length === 0 && (
                      <p className="text-xs text-slate-400 dark:text-[#8b949e]/60">No specific skills found.</p>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-[#30363d] rounded-2xl p-6 mb-6">
                  {user ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {user.photoURL ? (
                          <Image src={user.photoURL} alt="Avatar" width={40} height={40} className="rounded-full border border-slate-200 dark:border-[#30363d]" />
                        ) : (
                          <div className="w-10 h-10 bg-blue-100 dark:bg-[#21262d] text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold">
                            {user.displayName?.[0] || 'U'}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{user.displayName}</p>
                          <p className="text-xs text-slate-500 dark:text-[#8b949e]">Authenticated via GitHub</p>
                        </div>
                      </div>
                      <button type="button" onClick={logout} className="text-xs text-slate-400 hover:text-red-500 underline cursor-pointer">Sign Out</button>
                    </div>
                  ) : (
                    <div className="text-center py-2">
                      <p className="text-sm text-slate-600 dark:text-[#8b949e] mb-3">You need to sign in with GitHub to verify your identity.</p>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await loginWithGithub();
                          } catch (e) {
                            alert("Login failed");
                          }
                        }}
                        className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 px-6 py-2.5 rounded-xl text-xs font-semibold transition-colors shadow-sm cursor-pointer"
                      >
                        Sign in with GitHub
                      </button>
                    </div>
                  )}
                </div>

                {user && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-[#8b949e] mb-2">Your Role / Company <span className="text-slate-400 dark:text-slate-500 font-normal">(optional)</span></label>
                      <input
                        type="text"
                        placeholder="e.g. Senior Developer at TechCorp"
                        className="w-full bg-white dark:bg-[#0d1117] border border-slate-350 dark:border-[#30363d] text-slate-900 dark:text-white px-4 py-3 rounded-xl outline-none focus:border-blue-500 dark:focus:border-blue-400 text-sm transition-colors"
                        value={fromRole}
                        onChange={(e) => setFromRole(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-[#8b949e] mb-2">Feedback Message</label>
                      <textarea
                        required
                        className="w-full bg-white dark:bg-[#0d1117] border border-slate-350 dark:border-[#30363d] text-slate-900 dark:text-white px-4 py-3 rounded-xl outline-none focus:border-blue-500 dark:focus:border-blue-400 h-28 resize-none text-sm transition-colors leading-relaxed"
                        value={message}
                        placeholder="Describe your experience working with them..."
                        onChange={(e) => setMessage(e.target.value)}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || selectedSkills.length === 0}
                      className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-3.5 rounded-xl font-semibold transition-colors cursor-pointer text-xs uppercase tracking-wider mt-6"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Endorsement"}
                    </button>
                  </div>
                )}
              </form>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
