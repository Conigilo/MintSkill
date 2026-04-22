// "use client";

// import { useState, useEffect } from "react";
// import { useParams, useRouter } from "next/navigation";
// import { verifyAttemptInfo, verifyAttempt } from "@/lib/services/challenges.service";


// export default function VerifyChallengePage() {
//   const { token } = useParams() as { token: string };
//   const router = useRouter();

//   const [attempt, setAttempt] = useState<{submissionUrl: string, createdAt: {_seconds: number}}|null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [comments, setComments] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [success, setSuccess] = useState(false);

//   useEffect(() => {
//     if (!token) return;
//     fetchAttemptInfo();
//   }, [token]);

//   const fetchAttemptInfo = async () => {
//     try {
//       const res = await verifyAttemptInfo(token);
//       if (res.success && res.data) {
//         setAttempt(res.data);
//       } else {
//         setError(res.error || "Invalid or expired verification link");
//       }
//     } catch (e: unknown) {
//       setError((e as Error).message || "Failed to load attempt info");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleVerify = async () => {
//     setIsSubmitting(true);
//     try {
//       const res = await verifyAttempt(token, comments);
//       if (res.success) {
//         setSuccess(true);
//       } else {
//         alert(res.error || "Verification failed");
//       }
//     } catch (e: unknown) {
//       alert((e as Error).message || "Verification failed");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   if (isLoading) {
//     return (
//       <main className="min-h-screen bg-slate-50 text-slate-900">
//         <div className="flex justify-center items-center h-[60vh]">
//           <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
//         </div>
//       </main>
//     );
//   }

//   return (
//     <main className="min-h-screen bg-slate-50 text-slate-900">
      
//       <div className="max-w-2xl mx-auto pt-24 px-6">
//         {error ? (
//           <div className="text-center p-12 glass-panel rounded-3xl border border-red-500/30">
//             <h2 className="text-2xl font-bold text-slate-900 mb-4">Error</h2>
//             <p className="text-red-400">{error}</p>
//             <button
//               onClick={() => router.push("/")}
//               className="mt-6 bg-slate-100 hover:bg-slate-200 px-6 py-2 rounded-xl text-slate-900 transition-colors"
//             >
//               Back to Home
//             </button>
//           </div>
//         ) : success ? (
//           <div className="text-center p-12 glass-panel rounded-3xl border border-green-500/30">
//             <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30 text-2xl">
//               ✓
//             </div>
//             <h2 className="text-3xl font-bold text-slate-900 mb-4">Verification Complete!</h2>
//             <p className="text-slate-500 mb-8">
//               Thank you for verifying this challenge attempt. A badge has been automatically minted for the developer.
//             </p>
//             <button
//               onClick={() => router.push("/")}
//               className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-xl text-slate-900 transition-colors font-medium shadow-lg shadow-blue-900/50"
//             >
//               Go to Home
//             </button>
//           </div>
//         ) : (
//           <div className="glass-panel p-8 rounded-3xl border border-slate-200 relative overflow-hidden">
//             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600" />
            
//             <div className="mb-8">
//               <h1 className="text-2xl font-bold text-slate-900 mb-2">Verify Challenge Attempt</h1>
//               <p className="text-slate-500 text-sm">
//                 A developer wants you to review their submission. If you approve, they will earn a certified badge.
//               </p>
//             </div>

//             <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-8">
//               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Submission Details</h3>
              
//               <div className="space-y-4">
//                 <div>
//                   <p className="text-xs text-slate-400 mb-1">Challenge URL / Project Link</p>
//                   <a 
//                     href={attempt?.submissionUrl} 
//                     target="_blank" 
//                     rel="noopener noreferrer"
//                     className="text-blue-400 hover:text-blue-300 break-all bg-blue-500/10 px-3 py-2 rounded-lg inline-block border border-blue-500/20"
//                   >
//                     {attempt?.submissionUrl}
//                   </a>
//                 </div>
//                 <div>
//                   <p className="text-xs text-slate-400 mb-1">Submitted at</p>
//                   <p className="text-slate-700">{new Date((attempt?.createdAt?._seconds || 0) * 1000 || Date.now()).toLocaleDateString()}</p>
//                 </div>
//               </div>
//             </div>

//             <div className="space-y-6">
//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-2">
//                   Feedback / Comments (Optional)
//                 </label>
//                 <textarea
//                   value={comments}
//                   onChange={(e) => setComments(e.target.value)}
//                   placeholder="Great job on..."
//                   className="w-full bg-white border border-slate-300 text-slate-900 px-4 py-3 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none h-32"
//                 />
//               </div>

//               <div className="flex gap-4">
//                 <button
//                   onClick={handleVerify}
//                   disabled={isSubmitting}
//                   className="flex-1 bg-blue-600 hover:bg-blue-700 text-slate-900 py-3.5 rounded-xl transition-colors font-medium text-sm disabled:opacity-50 shadow-lg shadow-blue-900/50"
//                 >
//                   {isSubmitting ? "Verifying..." : "Approve & Mint Badge"}
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </main>
//   );
// }
