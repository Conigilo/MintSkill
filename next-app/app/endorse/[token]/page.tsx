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
  const [info, setInfo] = useState<{ toUser: any; availableSkills: string[] } | null>(null);

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
          fromUserId: user.uid, // Add the user ID to prevent self-endorsement or multiple endorsements
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
      <main className="min-h-screen bg-slate-50 flex justify-center items-center">
        <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 py-24 px-6 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-2xl mx-auto relative z-10">
        {error ? (
          <div className="text-center p-12 glass-panel rounded-3xl border border-red-500/30">
            <p className="text-red-400">{error}</p>
          </div>
        ) : success ? (
          <div className="text-center p-12 glass-panel rounded-3xl border border-green-500/30">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Endorsement Sent!</h2>
            <p className="text-slate-500 mb-8">Thank you for validating your colleague's skills. They will earn 6 points towards their skill verification badge.</p>
            <button
              onClick={() => router.push("/")}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-xl"
            >
              Back to Home
            </button>
          </div>
        ) : (
          <div className="glass-panel p-8 md:p-12 rounded-[2rem] border border-slate-200 relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-green-500 rounded-t-[2rem]" />

            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold border-4 border-[#090d14]">
                {info?.toUser?.displayName?.[0] || 'U'}
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">
                Endorse {info?.toUser?.displayName || "this user"}
              </h1>
              <p className="text-slate-500 text-sm">
                Your endorsement gives them score points towards earning their verified badges.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">1. Select Skills to Endorse</label>
                <div className="flex flex-wrap gap-2">
                  {info?.availableSkills.map((skill) => (
                    <button
                      type="button"
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${selectedSkills.includes(skill)
                        ? "bg-blue-600 border-blue-500 text-slate-900"
                        : "bg-white border-slate-300 text-slate-500 hover:border-slate-400"
                        }`}
                    >
                      {skill}
                    </button>
                  ))}
                  {info?.availableSkills.length === 0 && (
                    <p className="text-xs text-slate-400">No specific skills found.</p>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-6">
                {user ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {user.photoURL ? (
                        <Image src={user.photoURL} alt="Avatar" width={40} height={40} className="rounded-full border border-slate-200" />
                      ) : (
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                          {user.displayName?.[0] || 'U'}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-bold text-slate-900">{user.displayName}</p>
                        <p className="text-xs text-slate-500">Authenticated via GitHub</p>
                      </div>
                    </div>
                    <button type="button" onClick={logout} className="text-xs text-slate-400 hover:text-red-500 underline">Sign Out</button>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <p className="text-sm text-slate-600 mb-3">You need to sign in with GitHub to verify your identity.</p>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await loginWithGithub();
                        } catch (e) {
                          alert("Login failed");
                        }
                      }}
                      className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm"
                    >
                      Sign in with GitHub
                    </button>
                  </div>
                )}
              </div>

              {user && (
                <label>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Your Role / Company <span className="text-slate-400 font-normal">(optional)</span></label>
                    <input
                      type="text"
                      placeholder="e.g. Senior Developer at TechCorp"
                      className="w-full bg-white border border-slate-300 text-slate-900 px-4 py-3 rounded-xl outline-none focus:border-blue-500"
                      value={fromRole}
                      onChange={(e) => setFromRole(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Feedback Message</label>
                    <textarea
                      required
                      className="w-full bg-white border border-slate-300 text-slate-900 px-4 py-3 rounded-xl outline-none focus:border-blue-500 h-28 resize-none"
                      value={message}
                      placeholder="Describe your experience working with them..."
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || selectedSkills.length === 0}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-3.5 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] mt-6"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Endorsement"}
                  </button>
                </label>
              )}
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
