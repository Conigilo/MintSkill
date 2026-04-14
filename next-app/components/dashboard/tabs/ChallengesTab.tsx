"use client";

import { useState, useEffect } from "react";
import { getChallenges, createChallenge, submitChallengeAttempt } from "@/lib/services/challenges.service";

export default function ChallengesTab() {
  const [challenges, setChallenges] = useState<{id: string, title: string, description: string, relatedSkill: string, content?: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [submissionResult, setSubmissionResult] = useState<any | null>(null);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    setIsLoading(true);
    try {
      const res = await getChallenges();
      if (res.success && res.data) {
        setChallenges(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChallengeId || !submissionUrl) return;

    try {
      const res = await submitChallengeAttempt(selectedChallengeId, submissionUrl);
      if (res.success && res.data) {
        setSubmissionResult(res.data);
      }
    } catch (error) {
      console.error(error);
      alert("Error submitting challenge");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-white">Coding Challenges</h3>
      </div>

      <p className="text-sm text-gray-400 mb-6">
        Complete challenges to certify your skills. Once submitted, share your verification link with peers or mentors. When verified, a badge will be automatically minted!
      </p>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
        </div>
      ) : challenges.length === 0 ? (
        <div className="text-center p-8 glass-panel rounded-2xl border border-gray-800">
          <p className="text-gray-400">No challenges available yet. Check back later!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {challenges.map((c) => (
            <div key={c.id} className="p-5 glass-panel rounded-2xl border border-gray-800 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-lg text-white">{c.title}</h4>
                  <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full border border-blue-500/30">
                    {c.relatedSkill}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mb-4">{c.description}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedChallengeId(c.id);
                  setShowSubmitModal(true);
                  setSubmissionResult(null);
                  setSubmissionUrl("");
                }}
                className="w-full bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 py-2 rounded-xl border border-blue-500/30 transition-colors text-sm font-medium"
              >
                Submit Attempt
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#161b22] border border-gray-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
            <button
              onClick={() => setShowSubmitModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white"
            >
              ✕
            </button>
            
            {submissionResult ? (
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
                  ✓
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Submitted Successfully!</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Share this secret verification link with a peer or mentor to get your submission verified and your badge minted.
                </p>
                <div className="bg-gray-900 border border-gray-800 p-3 rounded-xl mb-4 font-mono text-xs text-blue-400 overflow-x-auto">
                  {`${window.location.origin}/verify-challenge/${submissionResult.verifyToken}`}
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/verify-challenge/${submissionResult.verifyToken}`);
                    alert("Copied to clipboard!");
                  }}
                  className="w-full bg-[#111110] hover:bg-[#1a1a19] text-white py-2 rounded-xl transition-colors text-sm font-medium border border-gray-800"
                >
                  Copy Link
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold text-white mb-1">Submit Challenge</h3>
                <p className="text-sm text-gray-400 mb-6">Enter the URL to your project repository or live site.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Submission URL
                    </label>
                    <input
                      type="url"
                      required
                      value={submissionUrl}
                      onChange={(e) => setSubmissionUrl(e.target.value)}
                      placeholder="https://github.com/..."
                      className="w-full bg-[#0d1117] border border-gray-800 text-white px-4 py-3 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl transition-colors font-medium text-sm disabled:opacity-50"
                  >
                    Submit for Verification
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
