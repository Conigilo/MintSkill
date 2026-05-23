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

  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab])

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

  // Handle Request Submission
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
      refetchSent()
      refetchReceived()
    } catch (error: any) {
      setSubmitResult({ success: false, error: error.message || 'เกิดข้อผิดพลาด' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Fetching Logic
  const getTimestamp = (item: any) => {
    const dateVal = item.createdAt || item.verifiedAt
    if (!dateVal) return 0
    if (dateVal instanceof Date) return dateVal.getTime()
    if (dateVal?.toDate) return dateVal.toDate().getTime()
    if (typeof dateVal === 'number') return dateVal
    if (dateVal?._seconds) return dateVal._seconds * 1000
    if (dateVal?.seconds) return dateVal.seconds * 1000
    return new Date(dateVal).getTime()
  }

  const sortEndorsements = (list: any[]) => {
    return [...list].sort((a: any, b: any) => getTimestamp(b) - getTimestamp(a))
  }

  const receivedDisplayList = sortEndorsements(receivedEndorsements.filter(e => e.status === 'verified'))
  const pendingRequests = receivedEndorsements.filter(e => e.status === 'pending')
  const sentDisplayList = sortEndorsements([...pendingRequests, ...sentEndorsements])

  const displayList = activeTab === 'received' ? receivedDisplayList : sentDisplayList
  const isLoading = activeTab === 'received' ? isReceivedLoading : (isReceivedLoading || isSentLoading)

  const ITEMS_PER_PAGE = 5
  const totalItems = displayList.length
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE))

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [totalPages, currentPage])

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedList = displayList.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-500">
      
      {/* ═══ Header ═══ */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200/50 dark:border-[#21262d]">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">
            การรับรองทักษะ (Endorsements)
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            สะสมการรับรองความสามารถเพื่อยืนยันประวัติการทักษะวิชาชีพของคุณ
          </p>
        </div>

        <button
          onClick={() => { setIsRequestModalOpen(true); setSubmitResult(null) }}
          className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all active:scale-95 whitespace-nowrap shadow-sm"
        >
          + ขอคำรับรองใหม่
        </button>
      </div>

      {/* ═══ Tab Navigation (Simple Flat Style) ═══ */}
      <div className="flex gap-6 border-b border-slate-200/60 dark:border-[#21262d] pb-px">
        <button
          onClick={() => setActiveTab('received')}
          className={`pb-3 text-xs font-bold transition-all relative whitespace-nowrap select-none
            ${activeTab === 'received'
              ? 'text-slate-900 dark:text-white'
              : 'text-slate-400 dark:text-[#8b949e] hover:text-slate-600 dark:hover:text-[#c9d1d9]'
            }
          `}
        >
          ที่ได้รับแล้ว ({receivedDisplayList.length})
          {activeTab === 'received' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          className={`pb-3 text-xs font-bold transition-all relative whitespace-nowrap select-none
            ${activeTab === 'sent'
              ? 'text-slate-900 dark:text-white'
              : 'text-slate-400 dark:text-[#8b949e] hover:text-slate-600 dark:hover:text-[#c9d1d9]'
            }
          `}
        >
          คำขอและประวัติส่งออก ({sentDisplayList.length})
          {activeTab === 'sent' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
          )}
        </button>
      </div>

      {/* ═══ Endorsements List ═══ */}
      {isLoading ? (
        <div className="bg-[#ffffff] border border-slate-200/80 dark:bg-[#161b22] dark:border-[#30363d] rounded-2xl p-16 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : displayList.length === 0 ? (
        <div className="bg-[#ffffff] border border-slate-200/80 dark:bg-[#161b22] dark:border-[#30363d] rounded-2xl p-12 text-center">
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500">
            {activeTab === 'received' ? 'ยังไม่มีการรับรองทักษะในระบบ' : 'ยังไม่พบคลิกคำรับรองส่งออก'}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            {activeTab === 'received' ? 'คลิก ขอคำรับรองใหม่ เพื่อชวนผู้อื่นมารับรองทักษะของคุณ' : 'สร้างลิงก์และแชร์ลิงก์เพื่อให้เพื่อนช่วยรับรองความสามารถได้ทันที'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginatedList.map((item: any, index) => {
              const senderName = item.fromName || item.fromUserName || item.toUserName || 'Anonymous'
              const isPending = item.status === 'pending'
              const absoluteIndex = startIndex + index

              return (
                <div
                  key={`${item.id || 'endorse'}-${absoluteIndex}`}
                  className={`bg-[#ffffff] border rounded-2xl p-5 dark:bg-[#161b22] transition-all flex flex-col justify-between
                    ${isPending 
                      ? 'border-l-4 border-l-amber-500 border-slate-200 dark:border-[#30363d]' 
                      : 'border-slate-200/80 dark:border-[#30363d] hover:border-slate-300 dark:hover:border-[#484f58]'
                    }
                  `}
                >
                  <div>
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex gap-2.5 items-center min-w-0">
                        {/* Simple Avatar */}
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#21262d] text-slate-500 dark:text-[#8b949e] flex items-center justify-center font-bold text-xs shrink-0">
                          {senderName[0].toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="text-slate-800 dark:text-[#f0f6fc] font-bold text-xs truncate">
                              {senderName}
                            </h4>
                            {item.status === 'verified' ? (
                              <span className="inline-flex items-center gap-0.5 text-[8px] font-bold px-1.5 py-0.5 bg-green-50 text-green-700 border border-green-200/60 rounded dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20">
                                Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-0.5 text-[8px] font-bold px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200/60 rounded dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20">
                                Pending
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 dark:text-[#8b949e] mt-0.5 truncate">
                            {item.fromRole || 'ผู้ให้การรับรอง'}
                          </p>
                        </div>
                      </div>

                      <span className="text-slate-400 dark:text-slate-500 text-[10px]">
                        {timeAgo(item.createdAt || item.verifiedAt)}
                      </span>
                    </div>

                    {/* Message */}
                    {item.message && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic mb-3 pl-3.5 border-l border-slate-200 dark:border-[#30363d]">
                        "{item.message}"
                      </p>
                    )}

                    {/* Pending Action Copy Area */}
                    {isPending && item.link && (
                      <div className="mb-3 bg-[#f8fafc] border border-slate-200 dark:bg-[#0d1117] dark:border-[#21262d] rounded-xl p-3 space-y-1.5">
                        <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          ส่งลิงก์นี้ให้ผู้รับรองของคุณ:
                        </p>
                        <div className="flex gap-1.5 items-center">
                          <input
                            readOnly
                            value={item.link}
                            className="bg-[#ffffff] border border-slate-200 dark:bg-[#161b22] dark:border-[#30363d] px-2.5 py-1 text-[10px] font-mono text-slate-500 dark:text-slate-400 w-full focus:outline-none rounded"
                          />
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(item.link)
                              alert('คัดลอกลิงก์เรียบร้อย!')
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-3 py-1.5 rounded transition-all active:scale-95 whitespace-nowrap"
                          >
                            คัดลอก
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Skills Endorsed List */}
                  {item.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-2 border-t border-slate-100/50 dark:border-[#21262d]/50">
                      {item.skills.map((skill: string, idx: number) => (
                        <span
                          key={idx}
                          className="text-[9px] font-bold bg-[#f1f5f9] text-slate-500 border border-slate-200 dark:bg-[#21262d] dark:text-[#8b949e] dark:border-transparent px-2 py-0.5 rounded-md"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* ═══ Pagination Controls ═══ */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4 border-t border-slate-100 dark:border-[#21262d] select-none">
              {/* Previous Button */}
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-1.5 border border-slate-200 dark:border-[#30363d] rounded-lg text-slate-500 dark:text-[#8b949e] hover:bg-slate-50 dark:hover:bg-[#21262d] disabled:opacity-40 disabled:cursor-not-allowed transition-all select-none"
                aria-label="Previous Page"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Page indicators */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => {
                  const pageNum = i + 1
                  const isCurrent = pageNum === currentPage
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-6 h-6 rounded-md text-[10px] font-bold transition-all select-none
                        ${isCurrent
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'border border-slate-200 dark:border-[#30363d] text-slate-500 dark:text-[#8b949e] hover:bg-slate-50 dark:hover:bg-[#21262d]'
                        }
                      `}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>

              {/* Next Button */}
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 border border-slate-200 dark:border-[#30363d] rounded-lg text-slate-500 dark:text-[#8b949e] hover:bg-slate-50 dark:hover:bg-[#21262d] disabled:opacity-40 disabled:cursor-not-allowed transition-all select-none"
                aria-label="Next Page"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ═══ Request Endorsement Modal ═══ */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-[#ffffff] border border-slate-200 dark:bg-[#161b22] dark:border-[#30363d] rounded-2xl w-full max-w-sm shadow-xl overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-slate-100 dark:border-[#21262d] flex justify-between items-center bg-[#ffffff] dark:bg-[#161b22]">
              <h3 className="font-bold text-xs text-slate-700 dark:text-white uppercase tracking-wider">
                ส่งคำขอคำรับรอง
              </h3>
              <button
                onClick={() => { setIsRequestModalOpen(false); setSubmitResult(null) }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5">
              {submitResult?.success ? (
                /* Success screen */
                <div className="text-center py-2 space-y-4">
                  <div className="w-10 h-10 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white">สร้างลิงก์สำเร็จ</h4>
                  
                  {submitResult.link && (
                    <div className="bg-[#f8fafc] border border-slate-200 dark:bg-[#0d1117] dark:border-[#21262d] rounded-xl p-3.5 text-left space-y-1.5">
                      <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        ลิงก์ของคุณ:
                      </p>
                      <div className="flex gap-1.5 items-center">
                        <input
                          readOnly
                          value={submitResult.link}
                          className="bg-[#ffffff] border border-slate-200 dark:bg-[#161b22] dark:border-[#30363d] px-2 py-1 text-[10px] font-mono text-slate-500 dark:text-slate-400 w-full focus:outline-none rounded"
                        />
                        <button
                          onClick={() => { navigator.clipboard.writeText(submitResult.link!); alert('คัดลอกลิงก์แล้ว!') }}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-3 py-1.5 rounded transition-all active:scale-95"
                        >
                          คัดลอก
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => { setIsRequestModalOpen(false); setSubmitResult(null) }}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 rounded-lg transition-all"
                  >
                    ปิดหน้าจอ
                  </button>
                </div>
              ) : (
                /* Form screen */
                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      ชื่อผู้รับรอง *
                    </label>
                    <input
                      type="text"
                      placeholder="เช่น อาจารย์ที่ปรึกษา หรือหัวหน้าทีม"
                      className="w-full bg-[#f8fafc] border border-slate-200 dark:bg-[#0d1117] dark:border-[#30363d] text-slate-800 dark:text-[#f0f6fc] text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                      value={requestForm.recipientName}
                      onChange={(e) => setRequestForm({ ...requestForm, recipientName: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      อีเมล (ระบุหรือไม่ก็ได้)
                    </label>
                    <input
                      type="email"
                      placeholder="friend@email.com"
                      className="w-full bg-[#f8fafc] border border-slate-200 dark:bg-[#0d1117] dark:border-[#30363d] text-slate-800 dark:text-[#f0f6fc] text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                      value={requestForm.recipientEmail}
                      onChange={(e) => setRequestForm({ ...requestForm, recipientEmail: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      ข้อความถึงผู้รับรอง
                    </label>
                    <textarea
                      placeholder="ช่วยเขียนรับรองทักษะการเขียนเว็บในการทำโปรเจกต์ที่ผ่านมาให้หน่อยครับ..."
                      rows={3}
                      className="w-full bg-[#f8fafc] border border-slate-200 dark:bg-[#0d1117] dark:border-[#30363d] text-slate-800 dark:text-[#f0f6fc] text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500 transition-colors resize-none leading-relaxed"
                      value={requestForm.message}
                      onChange={(e) => setRequestForm({ ...requestForm, message: e.target.value })}
                    />
                  </div>

                  <button
                    onClick={handleSendRequest}
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold py-2 rounded-lg transition-all active:scale-95 flex items-center justify-center gap-1.5 mt-2"
                  >
                    {isSubmitting ? 'กำลังทำงาน...' : 'สร้างลิงก์คำขอ'}
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  )
}