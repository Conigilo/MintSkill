export default function GapAnalysisTab() {
  const gaps = [
    { skill: "React", score: 85, status: "Strong — keep building projects", color: "bg-green-500" },
    { skill: "System Design", score: 55, status: "⚠ Gap — study distributed systems", color: "bg-yellow-500" },
    { skill: "Docker / K8s", score: 40, status: "⚠ Gap — practice containerization", color: "bg-yellow-500" },
    { skill: "Algorithms", score: 78, status: "Good — add more LeetCode hard", color: "bg-green-500" },
    { skill: "TypeScript", score: 30, status: "❌ Missing — high demand skill", color: "bg-red-500" },
    { skill: "PostgreSQL", score: 62, status: "Decent — learn query optimization", color: "bg-blue-500" },
  ];

  return (
    <div className="glass-panel p-8 rounded-3xl animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">Skill Gap Analysis</h3>
        <span className="text-xs border border-orange-500/30 bg-orange-500/10 px-3 py-1 rounded-full text-orange-400 flex items-center gap-1.5">
          ✨ AI-powered
        </span>
      </div>

      <p className="text-sm text-gray-400 mb-8">
        Based on your target role: <strong className="text-white">Full-Stack Engineer (Senior)</strong> — compared to market requirements.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {gaps.map((item, idx) => (
          <div key={idx} className="bg-[#161b22] border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-white font-medium text-sm">{item.skill}</h4>
              <span className="text-xs text-gray-500">{item.score}%</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-gray-800 rounded-full h-1.5 mb-3 overflow-hidden">
              <div className={`${item.color} h-1.5 rounded-full`} style={{ width: `${item.score}%` }}></div>
            </div>
            <p className="text-xs text-gray-400">{item.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}