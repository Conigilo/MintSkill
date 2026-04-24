'use client'

import { useState, useEffect } from 'react'
import { userService } from '@/lib/services/user.service'

interface ProfileData {
  displayName?: string
  title?: string
  bio?: string
  location?: string
  linkedinUrl?: string
}

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  onSaved: () => void
  initialData: ProfileData
}

export default function EditProfileModal({ isOpen, onClose, onSaved, initialData }: EditProfileModalProps) {
  const [form, setForm] = useState<ProfileData>({
    displayName: '',
    title: '',
    bio: '',
    location: '',
    linkedinUrl: '',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // sync ค่าเริ่มต้นเมื่อ modal เปิด
  useEffect(() => {
    if (isOpen) {
      setForm({
        displayName: initialData.displayName || '',
        title: initialData.title || '',
        bio: initialData.bio || '',
        location: initialData.location || '',
        linkedinUrl: initialData.linkedinUrl || '',
      })
      setError(null)
    }
  }, [isOpen, initialData])

  const handleChange = (field: keyof ProfileData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    try {
      // ส่งเฉพาะ field ที่มีค่า
      const payload: ProfileData = {}
      if (form.displayName?.trim()) payload.displayName = form.displayName.trim()
      if (form.title !== undefined) payload.title = form.title.trim()
      if (form.bio !== undefined) payload.bio = form.bio.trim()
      if (form.location !== undefined) payload.location = form.location.trim()
      if (form.linkedinUrl !== undefined) payload.linkedinUrl = form.linkedinUrl.trim()

      await userService.updateProfile(payload)
      onSaved()
      onClose()
    } catch (e: any) {
      setError(e.message || 'บันทึกข้อมูลไม่สำเร็จ')
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 pt-7 pb-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Edit Profile</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <div className="px-7 py-5 space-y-4 max-h-[65vh] overflow-y-auto">

          {error && (
            <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
              {error}
            </div>
          )}

          {[
            { key: 'displayName', label: 'Display Name', placeholder: 'ชื่อที่แสดง' },
            { key: 'title', label: 'Title / Role', placeholder: 'เช่น Frontend Developer, Student' },
            { key: 'location', label: 'Location', placeholder: 'เช่น Bangkok, Thailand' },
            { key: 'linkedinUrl', label: 'LinkedIn URL', placeholder: 'https://linkedin.com/in/...' },
          ].map(({ key, label, placeholder }) => (
            <div key={key} className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</label>
              <input
                type="text"
                value={form[key as keyof ProfileData] || ''}
                onChange={e => handleChange(key as keyof ProfileData, e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
              />
            </div>
          ))}

          {/* Bio — textarea */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Bio</label>
            <textarea
              value={form.bio || ''}
              onChange={e => handleChange('bio', e.target.value)}
              placeholder="แนะนำตัวเองสั้นๆ..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-7 py-5 border-t border-slate-100">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 py-2.5 rounded-xl bg-slate-900 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
        </div>
      </div>
    </div>
  )
}
