'use client'

import { useState, useRef, useEffect } from 'react'
import { Bell, MessageSquare, CheckCircle, Clock, Trash2, X } from 'lucide-react'
import { timeAgo } from '@/lib/utils/date'
import ApproveEndorseModal from '@/components/ApproveEndorseModal'

interface NotificationBellProps {
  notifications: any[]
  onNavigateToEndorseTab: () => void
  onRefresh?: () => void
}

export default function NotificationBell({
  notifications,
  onNavigateToEndorseTab,
  onRefresh,
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [dismissedIds, setDismissedIds] = useState<string[]>([])
  const [selectedFeedback, setSelectedFeedback] = useState<any | null>(null)
  const [selectedApproveRequest, setSelectedApproveRequest] = useState<any | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Load dismissed notifications from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('dismissed_notifications')
      if (saved) {
        setDismissedIds(JSON.parse(saved))
      }
    } catch (e) {
      console.error('Error parsing dismissed notifications', e)
    }
  }, [])

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Dismiss notification from bell (hide locally only)
  const handleDismissNotification = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    const updated = [...dismissedIds, id]
    setDismissedIds(updated)
    localStorage.setItem('dismissed_notifications', JSON.stringify(updated))
  }

  // Filter out dismissed requests
  const visibleNotifications = notifications.filter(notif => !dismissedIds.includes(notif.id))

  const handleNotificationClick = (notif: any) => {
    setIsOpen(false)
    if (notif.type === 'request') {
      setSelectedApproveRequest(notif.raw)
    } else {
      setSelectedFeedback(notif)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] hover:bg-slate-50 dark:hover:bg-[#21262d] transition-all p-2.5 rounded-full cursor-pointer shadow-sm focus:outline-none"
        title="การแจ้งเตือน"
      >
        <Bell size={18} className="text-slate-600 dark:text-[#8b949e] hover:text-slate-900 dark:hover:text-white" />
        {visibleNotifications.length > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-rose-500 rounded-full border-2 border-white dark:border-[#0d1117] flex items-center justify-center text-[10px] font-bold text-white">
            {visibleNotifications.length}
          </span>
        )}
      </button>

      {/* Premium Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-2xl shadow-xl z-50 overflow-hidden animate-in zoom-in-95 duration-200 origin-top-right">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 dark:border-[#21262d] flex justify-between items-center bg-slate-50/50 dark:bg-[#161b22]/50">
            <span className="text-xs font-bold text-slate-800 dark:text-[#c9d1d9] uppercase tracking-wider">
              การแจ้งเตือน ({visibleNotifications.length})
            </span>
            {visibleNotifications.length > 0 && (
              <button
                onClick={() => {
                  const allIds = visibleNotifications.map(n => n.id)
                  const updated = [...dismissedIds, ...allIds]
                  setDismissedIds(updated)
                  localStorage.setItem('dismissed_notifications', JSON.stringify(updated))
                }}
                className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-semibold transition-colors"
              >
                ลบทั้งหมด
              </button>
            )}
          </div>

          {/* List items */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-[#21262d]">
            {visibleNotifications.length === 0 ? (
              <div className="px-4 py-8 text-center space-y-2">
                <Bell size={24} className="mx-auto text-slate-300 dark:text-slate-600" />
                <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                  ไม่มีการแจ้งเตือนใหม่ในขณะนี้
                </p>
              </div>
            ) : (
              visibleNotifications.map((notif) => {
                const isRequest = notif.type === 'request'
                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className="p-4 hover:bg-slate-50/80 dark:hover:bg-[#21262d]/50 transition-colors cursor-pointer relative group"
                  >
                    <div className="flex gap-3 items-start pr-6">
                      {/* Icon Indicator */}
                      <div className="mt-0.5 shrink-0">
                        {isRequest ? (
                          <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 flex items-center justify-center font-bold text-xs">
                            <Clock size={14} />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400 flex items-center justify-center font-bold text-xs">
                            <CheckCircle size={14} />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">
                          {isRequest ? 'คำขอช่วยรับรอง' : 'ได้รับการรับรองใหม่'}
                        </p>
                        <p className="text-xs text-slate-800 dark:text-slate-200 leading-snug">
                          <strong className="font-bold text-slate-900 dark:text-white">{notif.title}</strong>{' '}
                          {notif.message}
                        </p>
                        {notif.detailMessage && (
                          <p className="text-[10px] text-slate-400 dark:text-[#8b949e] italic mt-1 line-clamp-1">
                            "{notif.detailMessage}"
                          </p>
                        )}
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 block mt-2">
                          {timeAgo(notif.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Quick Dismiss Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDismissNotification(e, notif.id);
                      }}
                      className="absolute right-3 top-4 text-slate-300 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded"
                      title="ซ่อนแจ้งเตือน"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )
              })
            )}
          </div>

          {/* Footer */}
          <button
            onClick={onNavigateToEndorseTab}
            className="w-full text-center py-2.5 bg-slate-50 dark:bg-[#0d1117]/50 hover:bg-slate-100 dark:hover:bg-[#21262d]/50 text-[10px] font-bold text-slate-500 dark:text-[#8b949e] transition-colors border-t border-slate-100 dark:border-[#21262d] uppercase tracking-wider cursor-pointer"
          >
            ดูการรับรองทั้งหมด
          </button>
        </div>
      )}

      {/* ═══ Feedback Viewer Modal ═══ */}
      {selectedFeedback && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#ffffff] border border-slate-200 dark:bg-[#161b22] dark:border-[#30363d] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-[#21262d] flex justify-between items-center bg-[#ffffff] dark:bg-[#161b22]">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare size={16} className="text-blue-500" />
                ข้อความรับรองทักษะ
              </h3>
              <button
                onClick={() => setSelectedFeedback(null)}
                className="text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="flex gap-3 items-center">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
                  {selectedFeedback.avatar}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white text-sm">
                    {selectedFeedback.title}
                  </h4>
                  {selectedFeedback.raw?.fromRole && (
                    <p className="text-xs text-slate-400 dark:text-[#8b949e]">
                      {selectedFeedback.raw.fromRole}
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-[#0d1117] border border-slate-200/50 dark:border-[#30363d] rounded-2xl p-4 relative">
                <span className="text-3xl text-blue-500/20 font-serif absolute top-2 left-2 leading-none">“</span>
                <p className="text-xs text-slate-650 dark:text-slate-300 leading-relaxed italic pl-5 pr-2 pt-2">
                  {selectedFeedback.detailMessage || 'ไม่มีข้อความเพิ่มเติม'}
                </p>
                <span className="text-3xl text-blue-500/20 font-serif absolute bottom-2 right-2 leading-none">”</span>
              </div>

              {selectedFeedback.raw?.skills?.length > 0 && (
                <div className="space-y-1.5">
                  <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    ทักษะที่ได้รับการรับรอง:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedFeedback.raw.skills.map((skill: string, idx: number) => (
                      <span
                        key={idx}
                        className="text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 px-2.5 py-1 rounded-md"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-[10px] text-slate-400 dark:text-slate-500 text-right pt-2">
                รับรองเมื่อ {new Date(selectedFeedback.createdAt?.toDate ? selectedFeedback.createdAt.toDate() : selectedFeedback.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </div>

              <button
                onClick={() => setSelectedFeedback(null)}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-xs font-bold rounded-lg transition-all"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Approve Endorsement Request Modal (Inline Bell Trigger) ═══ */}
      {selectedApproveRequest && (
        <ApproveEndorseModal
          requestId={selectedApproveRequest.id}
          targetUserId={selectedApproveRequest.toUserId}
          targetName={selectedApproveRequest.toUserName || "ผู้ใช้ในระบบ"}
          onClose={() => setSelectedApproveRequest(null)}
          onSuccess={() => {
            setSelectedApproveRequest(null)
            onRefresh?.()
          }}
        />
      )}
    </div>
  )
}
