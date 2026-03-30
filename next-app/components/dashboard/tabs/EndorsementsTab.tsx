'use client'

import { useState, useEffect } from 'react'
import { useMyEndorsements } from '@/hooks/useProfileData'
import { useUserSkills } from '@/hooks/useProfileData'
import { useAuth } from '@/lib/hooks/useAuth'
import { endorsementService } from '@/lib/services/endorsements.service'

export default function EndorsementsTab() {
  const { user } = useAuth()
  const { endorsements, isLoading, refetch } = useMyEndorsements()
  const { skills } = useUserSkills(user?.uid)

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)
  const [requestForm, setRequestForm] = useState({ skill: '', recipientName: '', recipientEmail: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState<{ success: boolean; link?: string; error?: string } | null>(null)

  const skillNames = skills?.map(s => s.name) || []

  const handleSendRequest = async () => {
    if (!requestForm.recipientName.trim()) {
      setSubmitResult({ success: false, error: 'กรุณาระบุชื่อผู้ที่ต้องการขอ Endorse' })
      return
    }
    setIsSubmitting(true)
    setSubmitResult(null)
    try {
      const res = await endorsementService.requestEndorsement(
        requestForm.recipientName,
        requestForm.recipientEmail
      )
      const link = res?.data?.link || res?.link
      setSubmitResult({ success: true, link })
      setRequestForm({ skill: '', recipientName: '', recipientEmail: '' })
      refetch()
    } catch (error: any) {
      setSubmitResult({ success: false, error: error.message || 'เกิดข้อผิดพลาด' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Helper: กี่วันที่แล้ว
  const timeAgo = (dateVal: any): string => {
    if (!dateVal) return ''
    const date = dateVal?.toDate ? dateVal.toDate() : new Date(dateVal)
    const diff = Math.floor((Date.now() - date.getTime()) / 1000)
    if (diff < 60) return 'เมื่อกี้'
    if (diff < 3600) return `${Math.floor(diff / 60)} นาทีที่แล้ว`
    if (diff < 86400) return `${Math.floor(diff / 3600)} ชั่วโมงที่แล้ว`
    return `${Math.floor(diff / 86400)} วันที่แล้ว`
  }

  const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-yellow-500', 'bg-pink-500', 'bg-indigo-500']

  return (
    <div className="glass-panel p-8 rounded-3xl animate-in fade-in duration-500 relative">

      {/* Header & Request Button */}
      <div className="flex justify-between items-center mb-8 border-b border-gray-800/50 pb-6">
        <div>
          <h3 className="text-xl font-bold text-white">Endorsements</h3>
          <p className="text-xs text-gray-500 mt-1">{endorsements.length} endorsements received</p>
        </div>
        <button
          onClick={() => { setIsRequestModalOpen(true); setSubmitResult(null) }}
          className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <span>+ Request New</span>
        </button>
      </div>

      {/* Endorsements List */}
      <div className="space-y-5">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : endorsements.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🤝</p>
            <p className="text-gray-400 font-medium">ยังไม่มี Endorsements</p>
            <p className="text-gray-600 text-sm mt-1">ลองส่ง Request ไปหาเพื่อนก่อน!</p>
          </div>
        ) : (
          endorsements.map((item: any, index) => (
            <div key={item.id || index} className="bg-[#161b22] border border-gray-800/80 rounded-2xl p-6 hover:border-gray-700 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex gap-4 items-start">
                  <div className={`w-10 h-10 rounded-full ${colors[index % colors.length]} flex items-center justify-center text-white font-bold shrink-0`}>
                    {(item.fromName || item.fromUserName || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-white font-semibold text-sm">{item.fromName || item.fromUserName || 'Anonymous'}</h4>
                      {item.status === 'verified' && (
                        <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/30 px-1.5 py-0.5 rounded flex items-center gap-1">
                          ✓ Verified
                        </span>
                      )}
                    </div>
                    {item.fromRole && <p className="text-xs text-gray-500 mt-0.5">{item.fromRole}</p>}
                  </div>
                </div>
                <span className="text-gray-500 text-xs shrink-0 mt-1">{timeAgo(item.createdAt || item.verifiedAt)}</span>
              </div>

              {item.message && (
                <p className="text-gray-400 text-sm leading-relaxed mb-4 ml-14">"{item.message}"</p>
              )}

              {item.skills?.length > 0 && (
                <div className="flex flex-wrap gap-2 ml-14">
                  {item.skills.map((skill: string, idx: number) => (
                    <span key={idx} className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-1 rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* ================= Request Endorsement Modal ================= */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0d1117] border border-gray-700 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center bg-[#161b22]">
              <h3 className="font-bold text-white">Request Endorsement</h3>
              <button onClick={() => { setIsRequestModalOpen(false); setSubmitResult(null) }} className="text-gray-500 hover:text-white transition-colors">✕</button>
            </div>

            <div className="p-6 space-y-5">
              {/* ชื่อผู้ขอ */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">ชื่อผู้ที่จะ Endorse คุณ *</label>
                <input
                  type="text"
                  placeholder="เช่น Nadech Kugimiya"
                  className="w-full bg-[#090d14] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  value={requestForm.recipientName}
                  onChange={(e) => setRequestForm({ ...requestForm, recipientName: e.target.value })}
                />
              </div>

              {/* Email (optional) */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Email (ถ้าต้องการส่งลิงก์)</label>
                <input
                  type="email"
                  placeholder="เช่น friend@example.com"
                  className="w-full bg-[#090d14] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  value={requestForm.recipientEmail}
                  onChange={(e) => setRequestForm({ ...requestForm, recipientEmail: e.target.value })}
                />
              </div>

              {/* Error / Success */}
              {submitResult && (
                <div className={`p-4 rounded-xl border text-sm ${submitResult.success ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                  {submitResult.success ? (
                    <div>
                      <p className="font-bold mb-2">✅ สร้าง Endorsement Link สำเร็จ!</p>
                      {submitResult.link && (
                        <div className="bg-[#090d14] border border-gray-700 rounded-lg p-3 text-xs font-mono break-all text-gray-300 cursor-pointer" onClick={() => { navigator.clipboard.writeText(submitResult.link!); alert('Copied!') }}>
                          {submitResult.link}
                          <span className="ml-2 text-blue-400">(คลิกเพื่อคัดลอก)</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p>❌ {submitResult.error}</p>
                  )}
                </div>
              )}

              {/* ปุ่ม Submit */}
              <div className="pt-2">
                <button
                  onClick={handleSendRequest}
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                >
                  {isSubmitting ? 'กำลังสร้าง Link...' : 'สร้าง Endorsement Link 🔗'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}