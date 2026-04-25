'use client'

import { useState, useEffect } from 'react'
import { useMyEndorsements, useSentEndorsements, useUserSkills } from '@/lib/hooks/useProfileData'
import { useAuth } from '@/lib/hooks/useAuth'
import { endorsementService } from '@/lib/services/endorsements.service'

export default function EndorsementsTab() {
  const { user } = useAuth()
  const { endorsements: receivedEndorsements, isLoading: isReceivedLoading, refetch: refetchReceived } = useMyEndorsements()
  const { endorsements: sentEndorsements, isLoading: isSentLoading, refetch: refetchSent } = useSentEndorsements()
  const { skills } = useUserSkills(user?.uid)

  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received')
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)
  const [requestForm, setRequestForm] = useState({ skill: '', recipientName: '', recipientEmail: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState<{ success: boolean; link?: string; error?: string } | null>(null)

  const skillNames = skills?.map(s => s.name) || []

  // เมื่อสร้าง Request สำเร็จ ให้ดึงประวัติ Sent หมวดใหม่
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
        requestForm.recipientEmail,
        requestForm.message
      )
      const link = res?.data?.link || res?.link
      setSubmitResult({ success: true, link })
      setRequestForm({ skill: '', recipientName: '', recipientEmail: '', message: '' })
      refetchSent() // อัปเดตฝั่งที่ส่งออกไป
      refetchReceived()
    } catch (error: any) {
      setSubmitResult({ success: false, error: error.message || 'เกิดข้อผิดพลาด' })
    } finally {
      setIsSubmitting(false)
    }
  }

  //รูปแบบวันเวลาที่อ่านง่าย
  const timeAgo = (dateVal: any): string => {
    if (!dateVal) return 'ไม่ระบุเวลา'

    let date: Date

    if (dateVal instanceof Date) {
      date = dateVal
    } else if (dateVal?.toDate) {
      date = dateVal.toDate()
    } else if (typeof dateVal === 'number') {
      date = new Date(dateVal)
    } else if (dateVal?._seconds) {
      // Handle Firebase timestamp object from API
      date = new Date(dateVal._seconds * 1000)
    } else if (dateVal?.seconds) {
      date = new Date(dateVal.seconds * 1000)
    } else {
      date = new Date(dateVal)
    }

    if (isNaN(date.getTime())) return 'วันที่ไม่ถูกต้อง'

    const diff = Math.floor((Date.now() - date.getTime()) / 1000)
    if (diff < 60) return 'เมื่อกี้'
    if (diff < 3600) return `${Math.floor(diff / 60)} นาทีที่แล้ว`
    if (diff < 86400) return `${Math.floor(diff / 3600)} ชั่วโมงที่แล้ว`
    if (diff < 2592000) return `${Math.floor(diff / 86400)} วันที่แล้ว`

    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-yellow-500', 'bg-pink-500', 'bg-indigo-500']

  // แยกข้อมูลให้ตรงกับ Tab
  // Received: คือที่คนอื่นกดให้เราและ Verified แล้ว
  const receivedDisplayList = receivedEndorsements.filter(e => e.status === 'verified')

  // Sent Requests: คือสิ่งที่เรา "ส่งคำขอ" ไป (Pending) + สิ่งที่เรารับรองให้คนอื่น (Sent)
  const pendingRequests = receivedEndorsements.filter(e => e.status === 'pending')
  const sentDisplayList = [...pendingRequests, ...sentEndorsements].sort((a: any, b: any) => {
    const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt || 0).getTime()
    const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt || 0).getTime()
    return timeB - timeA
  })

  const displayList = activeTab === 'received' ? receivedDisplayList : sentDisplayList
  const isLoading = activeTab === 'received' ? isReceivedLoading : (isReceivedLoading || isSentLoading)

  return (
    <div className="glass-panel p-8 rounded-3xl animate-in fade-in duration-500 relative">

      {/* Header & Request Button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-slate-200/50 pb-6 gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Endorsements</h3>
          <div className="flex gap-4 mt-2">
            <button
              onClick={() => setActiveTab('received')}
              className={`text-xs font-bold uppercase tracking-wider transition-colors pb-1 border-b-2 ${activeTab === 'received' ? 'text-blue-400 border-blue-400' : 'text-slate-400 border-transparent hover:text-slate-700'}`}
            >
              Received ({receivedDisplayList.length})
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`text-xs font-bold uppercase tracking-wider transition-colors pb-1 border-b-2 ${activeTab === 'sent' ? 'text-purple-400 border-purple-400' : 'text-slate-400 border-transparent hover:text-slate-700'}`}
            >
              Sent Requests ({sentDisplayList.length})
            </button>
          </div>
        </div>
        <button
          onClick={() => { setIsRequestModalOpen(true); setSubmitResult(null) }}
          className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <span>+ Request New</span>
        </button>
      </div>

      {/* List */}
      <div className="space-y-5">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : displayList.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-500 font-medium">
              {activeTab === 'received' ? 'ยังไม่มี Endorsements ที่ได้รับ' : 'ยังไม่เคยส่ง Request หาใครเลย'}
            </p>
            <p className="text-slate-400 text-sm mt-1">
              {activeTab === 'received' ? 'ลองส่ง Request ไปหาเพื่อนก่อน!' : 'กดปุ่ม + Request New เพื่อเริ่มขอการรับรองจากเพื่อนเลย!'}
            </p>
          </div>
        ) : (
          displayList.map((item: any, index) => (
            <div key={item.id || index} className={`bg-white border rounded-2xl p-6 transition-all border-slate-200/80 hover:border-slate-300`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex gap-4 items-start">
                  <div className={`w-10 h-10 rounded-full ${colors[index % colors.length]} flex items-center justify-center text-slate-900 font-bold shrink-0`}>
                    {(item.fromName || item.fromUserName || item.toUserName || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-slate-900 font-semibold text-sm">{item.fromName || item.fromUserName || 'Anonymous'}</h4>
                      {item.status === 'verified' && (
                        <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/30 px-1.5 py-0.5 rounded flex items-center gap-1">
                          Verified
                        </span>
                      )}
                      {item.status === 'pending' && (
                        <span className="text-[10px] bg-orange-500/10 text-orange-400 border border-orange-500/30 px-1.5 py-0.5 rounded flex items-center gap-1">
                          Pending
                        </span>
                      )}
                    </div>
                    {item.fromRole && <p className="text-xs text-slate-400 mt-0.5">{item.fromRole}</p>}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">{activeTab === 'received' ? 'Received' : 'Requested'}</p>
                  <span className="text-slate-400 text-[11px] block mt-0.5">{timeAgo(item.createdAt || item.verifiedAt)}</span>
                </div>
              </div>

              {item.status === 'pending' && item.link && (
                <div className="mb-4 ml-14 bg-slate-50 border border-slate-300/50 rounded-lg p-3 text-xs flex flex-col gap-2">
                  <p className="text-slate-500 font-medium">ส่งลิงก์นี้ให้ผู้ยืนยันของคุณ:</p>
                  <div className="flex items-center gap-2">
                    <code className="bg-white px-2 py-1.5 rounded text-slate-700 w-full overflow-hidden text-ellipsis whitespace-nowrap border border-slate-200">
                      {item.link}
                    </code>
                    <button
                      onClick={() => { navigator.clipboard.writeText(item.link); alert('คัดลอกลิงก์แล้ว!'); }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-900 px-3 py-1.5 rounded transition-colors whitespace-nowrap"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}

              {item.message && (
                <p className="text-slate-500 text-sm leading-relaxed mb-4 ml-14 italic">"{item.message}"</p>
              )}

              {item.skills?.length > 0 && (
                <div className="flex flex-wrap gap-2 ml-14">
                  {item.skills.map((skill: string, idx: number) => (
                    <span key={idx} className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded">
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
        <div className="fixed inset-0 z-[200] flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 pt-[12vh]">
          <div className="bg-white border border-slate-300 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-top-10 duration-300">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-white">
              <h3 className="font-bold text-slate-900">Request Endorsement</h3>
              <button onClick={() => { setIsRequestModalOpen(false); setSubmitResult(null) }} className="text-slate-400 hover:text-slate-900 transition-colors">✕</button>
            </div>

            <div className="p-6 space-y-5">
              {submitResult?.success ? (
                /* ── SUCCESS VIEW ── */
                <div className="animate-in fade-in zoom-in-95 duration-300">
                  <div className="text-center mb-6">
                    <h4 className="text-xl font-bold text-slate-900 mb-2">สร้างลิงก์สำเร็จ</h4>
                    <p className="text-sm text-slate-500">คัดลอกลิงก์ด้านล่างส่งให้เพื่อนของคุณเพื่อขอการรับรอง</p>
                  </div>

                  <div className="space-y-4">
                    {submitResult.link && (
                      <div className="space-y-3">
                        <div className="bg-slate-50 border border-slate-300 rounded-xl p-4 text-xs font-mono break-all text-blue-400 group relative">
                          {submitResult.link}
                          <button
                            onClick={() => { navigator.clipboard.writeText(submitResult.link!); alert('คัดลอกลิงก์แล้ว!') }}
                            className="absolute right-2 top-2 bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors border border-blue-500/30"
                          >
                            Copy Link
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => { setIsRequestModalOpen(false); setSubmitResult(null) }}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 mt-8 rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                  >
                    ปิดหน้าต่าง
                  </button>
                </div>
              ) : (
                /* ── FORM VIEW ── */
                <>
                  {/* ชื่อผู้ขอ */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">ชื่อผู้ที่จะ Endorse คุณ *</label>
                    <input
                      type="text"
                      placeholder="เช่น Nadech Kugimiya"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-blue-500 transition-colors"
                      value={requestForm.recipientName}
                      onChange={(e) => setRequestForm({ ...requestForm, recipientName: e.target.value })}
                    />
                  </div>

                  {/* Email (optional) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email (ถ้าต้องการส่งลิงก์)</label>
                    <input
                      type="email"
                      placeholder="เช่น friend@example.com"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-blue-500 transition-colors"
                      value={requestForm.recipientEmail}
                      onChange={(e) => setRequestForm({ ...requestForm, recipientEmail: e.target.value })}
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">ข้อความถึงเพื่อน (Personal Message)</label>
                    <textarea
                      placeholder="เช่น ช่วยรีวิวทักษะ React จากโปรเจกต์เว็บล่าสุดให้หน่อยนะ..."
                      rows={3}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-blue-500 transition-colors resize-none text-sm"
                      value={requestForm.message}
                      onChange={(e) => setRequestForm({ ...requestForm, message: e.target.value })}
                    />
                  </div>
                  {/* ปุ่ม Submit */}
                  <div className="pt-2">
                    <button
                      onClick={handleSendRequest}
                      disabled={isSubmitting}
                      className="w-full bg-white hover:bg-blue-300 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-bold py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                    >
                      {isSubmitting ? 'กำลังสร้าง Link...' : 'สร้าง Endorsement Link'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}