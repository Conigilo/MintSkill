'use client'

import { useState, useRef, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { timeAgo } from '@/lib/utils/date'

interface NotificationBellProps {
  pendingRequests: any[]
  onNavigateToEndorseTab: () => void
  onRefresh?: () => void
}

export default function NotificationBell({
  pendingRequests,
  onNavigateToEndorseTab,
  onRefresh,
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [dismissedIds, setDismissedIds] = useState<string[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Load dismissed notifications from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('dismissed_notifications')
    if (saved) {
      try {
        setDismissedIds(JSON.parse(saved))
      } catch (e) {
        console.error('Error parsing dismissed notifications', e)
      }
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

  const handleNotificationClick = () => {
    setIsOpen(false)
    onNavigateToEndorseTab()
  }

  // Dismiss notification from bell (hide locally only, do not delete from DB)
  const handleDismissNotification = (e: React.MouseEvent, requestId: string) => {
    e.stopPropagation()
    if (confirm("คุณต้องการลบข้อความแจ้งเตือนนี้ออกจากกระดิ่งใช่หรือไม่? (คำขอรับรองจริงจะยังคงอยู่เพื่อเข้าจัดการในหน้าหลัก)")) {
      const updated = [...dismissedIds, requestId]
      setDismissedIds(updated)
      localStorage.setItem('dismissed_notifications', JSON.stringify(updated))
    }
  }

  // Filter out dismissed requests
  const visibleRequests = pendingRequests.filter(req => !dismissedIds.includes(req.id))

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] hover:bg-slate-50 dark:hover:bg-[#21262d] transition-all p-2.5 rounded-full cursor-pointer shadow-sm focus:outline-none"
        title="การแจ้งเตือน"
      >
        <Bell size={18} className="text-slate-600 dark:text-[#8b949e] hover:text-slate-900 dark:hover:text-white" />
        {visibleRequests.length > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-rose-500 rounded-full border-2 border-white dark:border-[#0d1117] flex items-center justify-center text-[10px] font-bold text-white">
            {visibleRequests.length}
          </span>
        )}
      </button>

      {/* Premium Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white/95 dark:bg-[#161b22]/95 backdrop-blur-md border border-slate-200/60 dark:border-[#30363d] rounded-2xl shadow-xl z-50 overflow-hidden animate-in zoom-in-95 duration-200 origin-top-right">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 dark:border-[#21262d] flex justify-between items-center">
            <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
              การแจ้งเตือน ({visibleRequests.length})
            </span>
          </div>

          {/* List items */}
          <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-[#21262d]">
            {visibleRequests.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <span className="text-xl">🔔</span>
                <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-2">
                  ไม่มีการแจ้งเตือนใหม่ในขณะนี้
                </p>
              </div>
            ) : (
              visibleRequests.map((req, idx) => {
                const requesterName = req.fromName || req.fromUserName || req.toUserName || 'ผู้ใช้อื่น'
                const targetSkill = req.skill || req.skills?.[0] || 'ทักษะ'
                return (
                  <div
                    key={req.id || idx}
                    className="p-4 hover:bg-slate-50/50 dark:hover:bg-[#21262d]/30 transition-colors"
                  >
                    <div className="flex gap-2.5 items-start">
                      {/* Avatar initial */}
                      <div className="w-7 h-7 rounded-full bg-blue-500/10 text-blue-500 dark:bg-blue-500/20 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {requesterName[0].toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-normal">
                          <strong className="font-bold text-slate-900 dark:text-white">{requesterName}</strong>{' '}
                          ส่งคำขอให้คุณช่วยรับรองทักษะ{' '}
                          <span className="font-bold text-blue-500 dark:text-blue-400">
                            {targetSkill}
                          </span>
                        </p>
                        {req.message && (
                          <p className="text-[10px] text-slate-400 dark:text-[#8b949e] italic mt-1 truncate">
                            "{req.message}"
                          </p>
                        )}
                        <div className="flex justify-between items-center mt-2.5">
                          <span className="text-[9px] text-slate-400 dark:text-slate-500">
                            {timeAgo(req.createdAt || req.verifiedAt)}
                          </span>
                          <div className="flex gap-1.5">
                            <button
                              onClick={(e) => handleDismissNotification(e, req.id)}
                              className="px-2 py-1 text-[10px] font-bold text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 border border-slate-200 dark:border-[#30363d] rounded-md transition-all active:scale-95 bg-white dark:bg-[#161b22] cursor-pointer"
                            >
                              ลบออก
                            </button>
                            <button
                              onClick={handleNotificationClick}
                              className="px-2.5 py-1 text-[10px] font-bold text-white bg-blue-600 hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-md transition-all active:scale-95 shadow-sm cursor-pointer"
                            >
                              รับรองทักษะ
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Footer */}
          {visibleRequests.length > 0 && (
            <button
              onClick={handleNotificationClick}
              className="w-full text-center py-2.5 bg-slate-50 dark:bg-[#0d1117]/50 hover:bg-slate-100 dark:hover:bg-[#21262d]/50 text-[10px] font-bold text-slate-500 dark:text-[#8b949e] transition-colors border-t border-slate-100 dark:border-[#21262d] uppercase tracking-wider cursor-pointer"
            >
              ดูคำรับรองทั้งหมด
            </button>
          )}
        </div>
      )}
    </div>
  )
}
