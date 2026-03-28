import { useState } from "react";

export default function EndorsementsTab() {
  // 1. สร้าง State สำหรับ Modal ตรงนี้เลย
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestForm, setRequestForm] = useState({ skill: "React", recipient: "", message: "" });

  const endorsements = [
    {
      name: "Anan Sawasdee",
      role: "Senior Engineer @ LINE Thailand",
      verified: true,
      timeAgo: "3 days ago",
      text: "Fil is an incredibly sharp developer. We worked together on the backend team — he consistently wrote clean, well-tested code and picked up new concepts faster than anyone on the team.",
      skills: ["Node.js", "System Design", "Algorithms"],
      avatarColor: "bg-blue-500",
      initial: "A"
    },
    // ... (ข้อมูล Mock อื่นๆ ใส่ต่อได้เลย)
  ];

  return (
    <div className="glass-panel p-8 rounded-3xl animate-in fade-in duration-500 relative">

      {/* Header & Request Button */}
      <div className="flex justify-between items-center mb-8 border-b border-gray-800/50 pb-6">
        <h3 className="text-xl font-bold text-white">Endorsements</h3>
        {/* 2. ผูก onClick เพื่อเปิด Modal */}
        <button
          onClick={() => setIsRequestModalOpen(true)}
          className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <span>+ Request New</span>
        </button>
      </div>

      {/* Endorsements List */}
      <div className="space-y-5">
        {endorsements.map((item, index) => (
          <div key={index} className="bg-[#161b22] border border-gray-800/80 rounded-2xl p-6 hover:border-gray-700 transition-colors">
            {/* ... โค้ดแสดงผลคนรีวิวเหมือนเดิม ... */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex gap-4 items-start">
                <div className={`w-10 h-10 rounded-full ${item.avatarColor} flex items-center justify-center text-white font-bold shrink-0`}>
                  {item.initial}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-white font-semibold text-sm">{item.name}</h4>
                    {item.verified && (
                      <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/30 px-1.5 py-0.5 rounded flex items-center gap-1">
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <span className="text-gray-500 text-xs shrink-0 mt-1">{item.timeAgo}</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4 ml-14">{item.text}</p>
            <div className="flex flex-wrap gap-2 ml-14">
              {item.skills.map((skill, idx) => (
                <span key={idx} className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-1 rounded">{skill}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ================= Request Modal ซ่อนอยู่ตรงนี้ ================= */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0d1117] border border-gray-700 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center bg-[#161b22]">
              <h3 className="font-bold text-white">Request Endorsement</h3>
              <button onClick={() => setIsRequestModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">✕</button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Which skill?</label>
                <select
                  className="w-full bg-[#090d14] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  value={requestForm.skill}
                  onChange={(e) => setRequestForm({ ...requestForm, skill: e.target.value })}
                >
                  <option value="React">React</option>
                  <option value="Node.js">Node.js</option>
                  <option value="Python">Python</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Who to ask?</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-500">@</span>
                  <input
                    type="text"
                    placeholder="GitHub Username"
                    className="w-full bg-[#090d14] border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    value={requestForm.recipient}
                    onChange={(e) => setRequestForm({ ...requestForm, recipient: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Message</label>
                <textarea
                  rows={3}
                  className="w-full bg-[#090d14] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  value={requestForm.message}
                  onChange={(e) => setRequestForm({ ...requestForm, message: e.target.value })}
                ></textarea>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => {
                    alert("Sent request successfully!");
                    setIsRequestModalOpen(false);
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all"
                >
                  Send Requests
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}