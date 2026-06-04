'use client'

import { useState, useEffect } from 'react'
import { useMyEndorsements, useSentEndorsements } from '@/lib/hooks/useProfileData'
import { useAuth } from '@/lib/hooks/useAuth'
import { endorsementService } from '@/lib/services/endorsements.service'
import { timeAgo } from '@/lib/utils/date'
import ApproveEndorseModal from '@/components/ApproveEndorseModal'
import { 
  Send, CheckCircle, Clock, Link2, Copy, 
  Trash2, User, Calendar, Check, AlertCircle, X, MessageSquare, Award
} from 'lucide-react'

export default function EndorsementsTab() {
  const { user } = useAuth()
  const { endorsements: receivedEndorsements, isLoading: isReceivedLoading, refetch: refetchReceived } = useMyEndorsements()
  const { endorsements: sentEndorsements, isLoading: isSentLoading, refetch: refetchSent } = useSentEndorsements()

  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received')
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)
  const [requestForm, setRequestForm] = useState({ recipientName: '', recipientEmail: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState<{ 
    success: boolean; 
    direct?: boolean; 
    link?: string; 
    targetName?: string;
    error?: string;
  } | null>(null)

  const [pendingRequestsToMe, setPendingRequestsToMe] = useState<any[]>([])
  const [isPendingToMeLoading, setIsPendingToMeLoading] = useState(true)
  const [approveModalData, setApproveModalData] = useState<{ requestId: string; targetUserId: string; targetName: string } | null>(null)
  
  // Modal state for viewing details of an endorsement
  const [selectedEndorsement, setSelectedEndorsement] = useState<any | null>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const fetchPendingToMe = async () => {
    if (!user?.uid) return
    try {
      setIsPendingToMeLoading(true)
      const res = await endorsementService.getPendingEndorsementRequests()
      setPendingRequestsToMe(res.data || res || [])
    } catch (e) {
      console.error(e)
    } finally {
      setIsPendingToMeLoading(false)
    }
  }

  useEffect(() => {
    fetchPendingToMe()
  }, [user])

  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab])

  // Handle Request Submission (Auto-routed on backend)
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
      const data = res?.data || res
      
      setSubmitResult({ 
        success: true, 
        direct: data.direct,
        link: data.link,
        targetName: data.targetName || requestForm.recipientName
      })
      
      setRequestForm({ recipientName: '', recipientEmail: '', message: '' })
      refetchSent()
      refetchReceived()
      fetchPendingToMe()
    } catch (error: any) {
      setSubmitResult({ success: false, error: error.message || 'เกิดข้อผิดพลาดในการส่งคำขอ' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCopyLink = (link: string, id: string) => {
    navigator.clipboard.writeText(link)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

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

  const ITEMS_PER_PAGE = 4
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
    <div className="space-y-5 select-none animate-in fade-in duration-300 relative">
      
      {/* ═══ Header ═══ */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award size={18} className="text-blue-500" />
            การรับรองทักษะ (Endorsements)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            สะสมการรับรองความรู้ความสามารถจากบุคคลรอบตัวเพื่อยืนยันโปรไฟล์ของคุณ
          </p>
        </div>

        <button
          onClick={() => { 
            setIsRequestModalOpen(true)
            setSubmitResult(null) 
            setRequestForm({ recipientName: '', recipientEmail: '', message: '' })
          }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 shadow-sm shadow-blue-500/10 cursor-pointer"
        >
          <Send size={12} />
          ขอคำรับรอง
        </button>
      </div>

      {/* ═══ Inline Compact Stats ═══ */}
      <div className="flex flex-wrap gap-2 text-xs">
        <div className="bg-slate-100 dark:bg-[#161b22] border border-slate-200/50 dark:border-[#30363d] px-3 py-1.5 rounded-lg flex items-center gap-1.5">
          <CheckCircle size={12} className="text-green-500" />
          <span className="text-slate-500 dark:text-slate-400">ได้รับการรับรองแล้ว:</span>
          <span className="font-bold text-slate-900 dark:text-white font-mono">{receivedDisplayList.length}</span>
        </div>
        
        <div className="bg-slate-100 dark:bg-[#161b22] border border-slate-200/50 dark:border-[#30363d] px-3 py-1.5 rounded-lg flex items-center gap-1.5">
          <Clock size={12} className="text-amber-500" />
          <span className="text-slate-500 dark:text-slate-400">รอคุณช่วยรับรอง:</span>
          <span className="font-bold text-slate-900 dark:text-white font-mono">{pendingRequestsToMe.length}</span>
        </div>

        <div className="bg-slate-100 dark:bg-[#161b22] border border-slate-200/50 dark:border-[#30363d] px-3 py-1.5 rounded-lg flex items-center gap-1.5">
          <Send size={12} className="text-blue-500" />
          <span className="text-slate-500 dark:text-slate-400">คำขอส่งออกของคุณ:</span>
          <span className="font-bold text-slate-900 dark:text-white font-mono">{pendingRequests.length}</span>
        </div>
      </div>

      {/* ═══ Inbox (Direct Requests To Me) ═══ */}
      {pendingRequestsToMe.length > 0 && (
        <div className="bg-amber-500/[0.02] border border-amber-500/20 dark:bg-[#161b22]/30 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="text-amber-500" size={14} />
            <h4 className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider">
              มีคำขอส่งถึงคุณ ({pendingRequestsToMe.length})
            </h4>
          </div>
          
          <div className="space-y-2">
            {pendingRequestsToMe.map((req) => (
              <div 
                key={req.id} 
                className="bg-white dark:bg-[#0d1117]/80 border border-slate-200 dark:border-[#21262d] rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-amber-500/30 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                    {(req.toUserName || "U")[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-800 dark:text-[#f0f6fc] block truncate">
                      {req.toUserName || "ผู้ใช้ในระบบ"}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block truncate italic">
                      "{req.message || "ช่วยรับรองทักษะให้ฉันหน่อยสิ"}"
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 self-end sm:self-auto">
                  <button
                    onClick={async () => {
                      if (confirm("คุณต้องการปฏิเสธคำขอรับรองทักษะนี้ใช่หรือไม่?")) {
                        try {
                          await endorsementService.declineEndorsementRequest(req.id)
                          fetchPendingToMe()
                          refetchReceived()
                          refetchSent()
                        } catch (e) {
                          alert("เกิดข้อผิดพลาดในการปฏิเสธคำขอ")
                        }
                      }
                    }}
                    className="px-2.5 py-1.5 border border-slate-200 dark:border-[#30363d] text-slate-500 hover:text-red-500 dark:text-slate-450 dark:hover:text-red-400 text-[10px] font-bold rounded-lg transition-all bg-white dark:bg-[#161b22] cursor-pointer"
                  >
                    ปฏิเสธ
                  </button>
                  <button
                    onClick={() => {
                      setApproveModalData({
                        requestId: req.id,
                        targetUserId: req.toUserId,
                        targetName: req.toUserName || "ผู้ใช้ในระบบ",
                      })
                    }}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                  >
                    รับรองทักษะ
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ Tabs ═══ */}
      <div className="flex gap-4 border-b border-slate-200/50 dark:border-[#21262d] pb-px">
        <button
          onClick={() => setActiveTab('received')}
          className={`pb-2 text-xs font-bold transition-all relative whitespace-nowrap cursor-pointer flex items-center gap-1.5
            ${activeTab === 'received'
              ? 'text-slate-900 dark:text-white'
              : 'text-slate-400 dark:text-[#8b949e] hover:text-slate-600'
            }
          `}
        >
          ที่ได้รับแล้ว ({receivedDisplayList.length})
          {activeTab === 'received' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          className={`pb-2 text-xs font-bold transition-all relative whitespace-nowrap cursor-pointer flex items-center gap-1.5
            ${activeTab === 'sent'
              ? 'text-slate-900 dark:text-white'
              : 'text-slate-400 dark:text-[#8b949e] hover:text-slate-600'
            }
          `}
        >
          คำขอและประวัติส่งออก ({sentDisplayList.length})
          {activeTab === 'sent' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
          )}
        </button>
      </div>

      {/* ═══ Endorsements List (Sleek Compact List Rows) ═══ */}
      {isLoading ? (
        <div className="border border-slate-200/50 dark:border-[#30363d] rounded-xl p-8 flex items-center justify-center bg-white dark:bg-[#161b22]">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : displayList.length === 0 ? (
        <div className="border border-slate-200/50 dark:border-[#30363d] rounded-xl p-8 text-center bg-white dark:bg-[#161b22]">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-450">
            {activeTab === 'received' ? 'ยังไม่มีข้อมูลการรับรองทักษะ' : 'ยังไม่พบคลิกคำรับรองส่งออก'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {paginatedList.map((item: any, index) => {
            const senderName = item.fromName || item.fromUserName || item.toUserName || 'Anonymous'
            const isPending = item.status === 'pending'
            const absoluteIndex = startIndex + index

            return (
              <div
                key={`${item.id || 'endorse'}-${absoluteIndex}`}
                onClick={() => !isPending && setSelectedEndorsement(item)}
                className={`bg-white dark:bg-[#161b22] border rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 transition-all
                  ${isPending 
                    ? 'border-l-4 border-l-amber-500 border-slate-200 dark:border-[#30363d]' 
                    : 'border-slate-200 dark:border-[#30363d] hover:border-blue-500/35 cursor-pointer hover:shadow-sm'
                  }
                `}
              >
                {/* Left Side: Avatar, Name & message preview */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-355 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-200/40 dark:border-[#30363d]">
                    {senderName[0].toUpperCase()}
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-800 dark:text-[#f0f6fc] truncate">
                        {senderName}
                      </span>
                      {isPending ? (
                        <span className="text-[8px] font-bold bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/10">
                          Pending
                        </span>
                      ) : (
                        <span className="text-[8px] font-bold bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400 px-1.5 py-0.5 rounded border border-green-500/10">
                          Verified
                        </span>
                      )}
                      <span className="text-[9px] text-slate-400 dark:text-slate-555 flex items-center gap-0.5 ml-auto md:ml-0">
                        <Calendar size={9} />
                        {timeAgo(item.createdAt || item.verifiedAt)}
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-lg">
                      {isPending ? (
                        item.token ? `คำขอส่งถึง ${senderName} (ผ่านลิงก์)` : `คำขอส่งถึง ${senderName} (ตรงในระบบ)`
                      ) : (
                        item.message ? `"${item.message}"` : 'ไม่มีข้อความเพิ่มเติม'
                      )}
                    </p>
                  </div>
                </div>

                {/* Right Side: Skills or link copy widget */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                  {isPending && item.link ? (
                    <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-[#0d1117]/60 border border-slate-200/60 dark:border-[#21262d] px-2 py-1 rounded-lg">
                      <span className="text-[9px] text-slate-400 font-medium">Link สำหรับกดยืนยัน:</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCopyLink(item.link, item.id)
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-[9px] font-bold px-2 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check size={9} />
                            ก๊อปปี้แล้ว!
                          </>
                        ) : (
                          <>
                            <Copy size={9} />
                            คัดลอกลิงก์
                          </>
                        )}
                      </button>
                    </div>
                  ) : isPending ? (
                    <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500">
                      รอการอนุมัติในระบบ
                    </span>
                  ) : (
                    item.skills?.slice(0, 3).map((skill: string, idx: number) => (
                      <span
                        key={idx}
                        className="text-[9px] font-semibold bg-blue-500/5 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400 px-2 py-0.5 rounded border border-blue-500/10 dark:border-transparent"
                      >
                        {skill}
                      </span>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ═══ Pagination ═══ */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 pt-2 select-none">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="p-1 border border-slate-200 dark:border-[#30363d] rounded-lg text-slate-500 hover:bg-slate-50 dark:hover:bg-[#21262d] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {Array.from({ length: totalPages }, (_, i) => {
            const pageNum = i + 1
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-5 h-5 rounded text-[9px] font-bold transition-all
                  ${pageNum === currentPage
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'border border-slate-200 dark:border-[#30363d] text-slate-500 hover:bg-slate-50 dark:hover:bg-[#21262d]'
                  }
                `}
              >
                {pageNum}
              </button>
            )
          })}

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="p-1 border border-slate-200 dark:border-[#30363d] rounded-lg text-slate-500 hover:bg-slate-50 dark:hover:bg-[#21262d] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {/* ═══ Endorsement Detail View Modal ═══ */}
      {selectedEndorsement && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-100">
          <div className="bg-[#ffffff] border border-slate-200 dark:bg-[#161b22] dark:border-[#30363d] rounded-2xl w-full max-w-sm shadow-xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-[#21262d] flex justify-between items-center bg-[#ffffff] dark:bg-[#161b22]">
              <h3 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                <MessageSquare size={13} className="text-blue-500" />
                รายละเอียดการรับรอง
              </h3>
              <button
                onClick={() => setSelectedEndorsement(null)}
                className="text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-4 space-y-3.5">
              <div className="flex gap-2.5 items-center">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                  {(selectedEndorsement.fromName || selectedEndorsement.fromUserName || 'A')[0].toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white text-xs">
                    {selectedEndorsement.fromName || selectedEndorsement.fromUserName || 'Anonymous'}
                  </h4>
                  {selectedEndorsement.fromRole && (
                    <p className="text-[10px] text-slate-450 dark:text-slate-500">
                      {selectedEndorsement.fromRole}
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-[#0d1117] border border-slate-200/50 dark:border-[#30363d] rounded-xl p-3 relative">
                <p className="text-xs text-slate-650 dark:text-slate-355 leading-relaxed italic pl-4 pr-1">
                  "{selectedEndorsement.message || 'ไม่มีข้อความเพิ่มเติม'}"
                </p>
                <span className="absolute top-1 left-1.5 text-slate-300 dark:text-slate-800 text-xl leading-none font-serif select-none">“</span>
              </div>

              {selectedEndorsement.skills?.length > 0 && (
                <div className="space-y-1">
                  <span className="block text-[9px] font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider">
                    ทักษะที่ได้รับการรับรอง:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {selectedEndorsement.skills.map((skill: string, idx: number) => (
                      <span
                        key={idx}
                        className="text-[9px] font-semibold bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 px-2 py-0.5 rounded"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-[9px] text-slate-400 dark:text-slate-555 text-right">
                รับรองเมื่อ {new Date(selectedEndorsement.verifiedAt?.toDate ? selectedEndorsement.verifiedAt.toDate() : (selectedEndorsement.verifiedAt || selectedEndorsement.createdAt)).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}
              </div>

              <button
                onClick={() => setSelectedEndorsement(null)}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-xs font-semibold rounded-lg transition-all cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Request Endorsement Modal (Simplified with Auto-Routing) ═══ */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-100">
          <div className="bg-[#ffffff] border border-slate-200 dark:bg-[#161b22] dark:border-[#30363d] rounded-2xl w-full max-w-sm shadow-xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-[#21262d] flex justify-between items-center bg-[#ffffff] dark:bg-[#161b22]">
              <h3 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                <Link2 size={14} className="text-blue-500" />
                ขอคำรับรองทักษะ (Endorsement Request)
              </h3>
              <button
                onClick={() => { setIsRequestModalOpen(false); setSubmitResult(null) }}
                className="text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4">
              {submitResult?.success ? (
                submitResult.direct ? (
                  // Direct System Request Success
                  <div className="text-center py-2 space-y-3">
                    <div className="w-10 h-10 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto text-lg font-bold">
                      ✓
                    </div>
                    <h4 className="text-xs font-bold text-slate-850 dark:text-white">ส่งคำขอตรงในระบบสำเร็จ!</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-450 leading-relaxed px-1">
                      คำขอถูกส่งตรงไปยังผู้รับในระบบเรียบร้อยแล้ว เพื่อนสามารถกดยืนยันการรับรองให้คุณได้ทันทีจากเมนูแจ้งเตือนบนแดชบอร์ด
                    </p>
                    <div className="pt-1.5">
                      <button
                        onClick={() => { setIsRequestModalOpen(false); setSubmitResult(null) }}
                        className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-xs font-semibold py-2.5 rounded-lg transition-all cursor-pointer"
                      >
                        ปิดหน้าต่าง
                      </button>
                    </div>
                  </div>
                ) : (
                  // Link Request Success (Fallback)
                  <div className="text-center py-2 space-y-3">
                    <div className="w-10 h-10 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto text-lg font-bold">
                      ✓
                    </div>
                    <h4 className="text-xs font-bold text-slate-850 dark:text-white">สร้างลิงก์สำเร็จ!</h4>
                    <p className="text-[10px] text-slate-555 dark:text-slate-450 leading-relaxed px-1">
                      (ไม่พบอีเมลนี้ในระบบ) ระบบจึงทำการสร้างลิงก์ภายนอกให้เพื่อนกดยืนยัน คัดลอกลิงก์ด้านล่างไปส่งต่อได้เลยครับ
                    </p>
                    
                    {submitResult.link && (
                      <div className="bg-[#f8fafc] border border-slate-200 dark:bg-[#0d1117] dark:border-[#21262d] rounded-xl p-3 text-left space-y-1.5">
                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                          <Link2 size={10} />
                          ลิงก์คำขอรับรองของคุณ:
                        </span>
                        <div className="flex gap-1.5">
                          <input
                            readOnly
                            value={submitResult.link}
                            onClick={(e) => (e.target as HTMLInputElement).select()}
                            className="bg-[#ffffff] border border-slate-200 dark:bg-[#161b22] dark:border-[#30363d] px-2.5 py-1.5 text-[10px] font-mono text-slate-500 dark:text-slate-400 w-full focus:outline-none rounded-lg"
                          />
                          <button
                            onClick={() => { navigator.clipboard.writeText(submitResult.link!); alert('คัดลอกลิงก์เรียบร้อย!') }}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all active:scale-95 flex items-center gap-1 whitespace-nowrap cursor-pointer"
                          >
                            <Copy size={11} />
                            คัดลอก
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="pt-1.5">
                      <button
                        onClick={() => { setIsRequestModalOpen(false); setSubmitResult(null) }}
                        className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-xs font-semibold py-2.5 rounded-lg transition-all cursor-pointer"
                      >
                        ปิดหน้าต่าง
                      </button>
                    </div>
                  </div>
                )
              ) : (
                <div className="space-y-3">
                  {submitResult?.error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 text-[10px] px-2.5 py-1.5 rounded-lg">
                      {submitResult.error}
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-slate-450 dark:text-slate-555 uppercase tracking-wider">
                      ชื่อผู้รับรอง *
                    </label>
                    <input
                      type="text"
                      placeholder="เช่น หัวหน้างาน หรือเพื่อนร่วมงานที่ต้องการส่งให้"
                      className="w-full bg-[#f8fafc] border border-slate-200 dark:bg-[#0d1117] dark:border-[#30363d] text-slate-850 dark:text-[#f0f6fc] text-xs px-2.5 py-2 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                      value={requestForm.recipientName}
                      onChange={(e) => setRequestForm({ ...requestForm, recipientName: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-slate-450 dark:text-slate-555 uppercase tracking-wider">
                      อีเมลผู้รับรอง (ใช้หาไอดีเพื่อส่งตรงในระบบ)
                    </label>
                    <input
                      type="email"
                      placeholder="เช่น name@company.com หรืออีเมลไอดีของเพื่อนในระบบ"
                      className="w-full bg-[#f8fafc] border border-slate-200 dark:bg-[#0d1117] dark:border-[#30363d] text-slate-850 dark:text-[#f0f6fc] text-xs px-2.5 py-2 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                      value={requestForm.recipientEmail}
                      onChange={(e) => setRequestForm({ ...requestForm, recipientEmail: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider">
                      ข้อความส่วนตัวสั้นๆ
                    </label>
                    <textarea
                      placeholder="ช่วยเขียนรับรองทักษะการทำโปรเจกต์ที่ผ่านมาให้หน่อยนะครับ..."
                      rows={2}
                      className="w-full bg-[#f8fafc] border border-slate-200 dark:bg-[#0d1117] dark:border-[#30363d] text-slate-850 dark:text-[#f0f6fc] text-xs px-2.5 py-2 rounded-lg focus:outline-none focus:border-blue-500 transition-colors resize-none leading-normal"
                      value={requestForm.message}
                      onChange={(e) => setRequestForm({ ...requestForm, message: e.target.value })}
                    />
                  </div>

                  <div className="flex gap-2.5 pt-1.5">
                    <button
                      type="button"
                      onClick={() => setIsRequestModalOpen(false)}
                      className="flex-1 px-3 py-2 border border-slate-200 dark:border-[#30363d] text-slate-650 dark:text-slate-400 text-xs font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-[#21262d] cursor-pointer"
                    >
                      ยกเลิก
                    </button>
                    <button
                      onClick={handleSendRequest}
                      disabled={isSubmitting}
                      className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {isSubmitting ? 'กำลังส่ง...' : 'ส่งคำขอ'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ Approve Endorsement Request Modal ═══ */}
      {approveModalData && (
        <ApproveEndorseModal
          requestId={approveModalData.requestId}
          targetUserId={approveModalData.targetUserId}
          targetName={approveModalData.targetName}
          onClose={() => setApproveModalData(null)}
          onSuccess={() => {
            setApproveModalData(null)
            fetchPendingToMe()
            refetchReceived()
            refetchSent()
          }}
        />
      )}

    </div>
  )
}