"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchAPI } from "@/lib/services/api";

export default function EndorsePage() {
  const { token } = useParams() as { token: string };
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [info, setInfo] = useState<{ toUser: any; availableSkills: string[] } | null>(null);
  
  const [fromName, setFromName] = useState("");
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
    if (!fromName || !message) return alert("Please fill in your name and message.");

    setIsSubmitting(true);
    try {
      await fetchAPI(`/endorsements/submit/${token}`, {
        method: "POST",
        body: JSON.stringify({
          fromName,
          fromRole,
          message,
          skills: selectedSkills,
        }),
      });
      setSuccess(true);
    } catch (e: any) {
      alert(e.message || "Failed to submit endorsement");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#090d14] flex justify-center items-center">
        <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#090d14] text-white py-24 px-6 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-2xl mx-auto relative z-10">
        {error ? (
          <div className="text-center p-12 glass-panel rounded-3xl border border-red-500/30">
            <p className="text-red-400">{error}</p>
          </div>
        ) : success ? (
          <div className="text-center p-12 glass-panel rounded-3xl border border-green-500/30">
            <div className="text-5xl mb-4">🙌</div>
            <h2 className="text-2xl font-bold text-white mb-2">Endorsement Sent!</h2>
            <p className="text-gray-400 mb-8">Thank you for validating your colleague's skills. They will earn 6 points towards their skill verification badge.</p>
            <button
              onClick={() => router.push("/")}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-xl"
            >
              Back to Home
            </button>
          </div>
        ) : (
          <div className="glass-panel p-8 md:p-12 rounded-[2rem] border border-gray-800 relative">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-green-500 rounded-t-[2rem]" />
             
             <div className="text-center mb-10">
               <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold border-4 border-[#090d14]">
                 {info?.toUser?.displayName?.[0] || 'U'}
               </div>
               <h1 className="text-2xl font-bold text-white mb-2">
                 Endorse {info?.toUser?.displayName || "this user"}
               </h1>
               <p className="text-gray-400 text-sm">
                 Your endorsement gives them score points towards earning their verified badges.
               </p>
             </div>

             <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">1. Select Skills to Endorse</label>
                  <div className="flex flex-wrap gap-2">
                    {info?.availableSkills.map((skill) => (
                      <button
                        type="button"
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                          selectedSkills.includes(skill)
                            ? "bg-blue-600 border-blue-500 text-white"
                            : "bg-[#161b22] border-gray-700 text-gray-400 hover:border-gray-500"
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                    {info?.availableSkills.length === 0 && (
                      <p className="text-xs text-gray-500">No specific skills found.</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Your Name</label>
                    <input
                      required
                      type="text"
                      className="w-full bg-[#161b22] border border-gray-700 text-white px-4 py-3 rounded-xl outline-none focus:border-blue-500"
                      value={fromName}
                      onChange={(e) => setFromName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Your Role / Company</label>
                    <input
                      type="text"
                      className="w-full bg-[#161b22] border border-gray-700 text-white px-4 py-3 rounded-xl outline-none focus:border-blue-500"
                      value={fromRole}
                      onChange={(e) => setFromRole(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Feedback Message</label>
                  <textarea
                    required
                    className="w-full bg-[#161b22] border border-gray-700 text-white px-4 py-3 rounded-xl outline-none focus:border-blue-500 h-28 resize-none"
                    value={message}
                    placeholder="Describe your experience working with them..."
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || selectedSkills.length === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3.5 rounded-xl font-medium transition-colors shadow-lg shadow-blue-900/50"
                >
                  {isSubmitting ? "Submitting..." : "Submit Endorsement"}
                </button>
             </form>
          </div>
        )}
      </div>
    </main>
  );
}
