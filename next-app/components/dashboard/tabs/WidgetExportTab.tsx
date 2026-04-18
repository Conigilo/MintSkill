'use client'

import { useState, useEffect } from 'react'
import { ResumeData, DEFAULT_RESUME, generateResumeHtml } from '@/lib/utils/resume'

interface WidgetExportTabProps {
  userName?: string
  skills?: Array<{ name: string; verified?: boolean; level?: number;[key: string]: any }>
}

const TEMPLATES = [
  { id: 'classic', name: 'Classic', accent: '#3b82f6', desc: 'Clean single column' },
  { id: 'modern', name: 'Modern', accent: '#8b5cf6', desc: 'Two-column sidebar' },
  { id: 'minimal', name: 'Minimal', accent: '#10b981', desc: 'Ultra minimalist' },
  { id: 'bold', name: 'Bold', accent: '#f59e0b', desc: 'Dark header, gold' },
] as const

type TemplateId = typeof TEMPLATES[number]['id']

export default function WidgetExportTab({ userName = 'user', skills = [] }: WidgetExportTabProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('classic')
  const [activeSection, setActiveSection] = useState<'template' | 'edit'>('template')
  const [saved, setSaved] = useState(false)
  const [resume, setResume] = useState<ResumeData>({
    ...DEFAULT_RESUME,
    fullName: userName,
    username: userName,
  })

  // Load saved resume from localStorage on mount
  useEffect(() => {
    try {
      const data = localStorage.getItem('skill-wallet-resume')
      if (data) {
        const parsed = JSON.parse(data)
        setResume(parsed.resume)
        if (parsed.template) setSelectedTemplate(parsed.template)
      }
    } catch (e) { /* ignore parse errors */ }
  }, [])

  const verifiedSkills = skills.filter(s => s.verified).map(s => s.name)
  const allSkillNames = skills.map(s => s.name)

  const handleSave = () => {
    localStorage.setItem('skill-wallet-resume', JSON.stringify({ resume, template: selectedTemplate }))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handlePrint = () => {
    handleSave() // auto-save before export
    const html = generateResumeHtml(selectedTemplate, resume, allSkillNames, verifiedSkills)
    const w = window.open('', '_blank', 'width=800,height=1100')
    if (!w) return
    w.document.write(html)
    w.document.close()
    w.onload = () => w.print()
  }

  // ── Helpers ──
  const updateField = (field: keyof ResumeData, value: any) =>
    setResume(prev => ({ ...prev, [field]: value }))

  const addItem = (field: 'education' | 'activities' | 'projects' | 'strengths') => {
    if (field === 'education') updateField(field, [...resume.education, { school: '', degree: '', gpax: '', year: '' }])
    else if (field === 'activities') updateField(field, [...resume.activities, { title: '', date: '', details: [''] }])
    else if (field === 'projects') updateField(field, [...resume.projects, { name: '', date: '', details: [''] }])
    else updateField(field, [...resume.strengths, ''])
  }

  const removeItem = (field: 'education' | 'activities' | 'projects' | 'strengths', idx: number) => {
    const arr = [...(resume[field] as any[])]
    arr.splice(idx, 1)
    updateField(field, arr)
  }

  // ── Render ──
  return (
    <div className="glass-panel p-8 rounded-3xl animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-gray-800/50 pb-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-1">
            <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Portfolio Export
          </h3>
          <p className="text-sm text-gray-400">Fill in your info, pick a template, and export as PDF</p>
        </div>
        <div className="flex gap-2 mt-3 md:mt-0">
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 font-bold px-5 py-2.5 rounded-xl transition-all text-sm border ${saved
              ? 'bg-green-600 border-green-500 text-white'
              : 'bg-transparent border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white'
              }`}
          >
            {saved ? (
              <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>Saved!</>
            ) : (
              <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>Save</>
            )}
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-purple-900/30 hover:scale-105 active:scale-95 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export PDF
          </button>
        </div>
      </div>

      {/* Section Toggle */}
      <div className="flex gap-1 bg-[#090d14] p-1 rounded-xl border border-gray-800 mb-6">
        {(['template', 'edit'] as const).map(s => (
          <button
            key={s}
            onClick={() => setActiveSection(s)}
            className={`flex-1 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeSection === s ? 'bg-purple-600 text-white' : 'text-gray-500 hover:text-white'
              }`}
          >
            {s === 'template' ? '🎨 Choose Template' : '✏️ Edit Resume'}
          </button>
        ))}
      </div>

      {activeSection === 'template' ? (
        /* ── Template Picker ── */
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTemplate(t.id)}
              className={`group relative rounded-2xl overflow-hidden border-2 transition-all duration-200 ${selectedTemplate === t.id
                ? 'border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                : 'border-gray-800 hover:border-gray-600'
                }`}
            >
              <div className="aspect-[3/4] relative overflow-hidden bg-[#f8fafc]">
                <TemplateMiniPreview id={t.id} accent={t.accent} />
              </div>
              <div className="p-2.5 bg-[#161b22] text-left">
                <p className="text-xs font-bold text-white">{t.name}</p>
                <p className="text-[10px] text-gray-500">{t.desc}</p>
              </div>
              {selectedTemplate === t.id && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      ) : (
        /* ── Resume Editor Form ── */
        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">

          {/* Personal Info */}
          <FormSection title="👤 Personal Info">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Full Name" value={resume.fullName} onChange={v => updateField('fullName', v)} />
              <Input label="Job Title" value={resume.title} onChange={v => updateField('title', v)} />
              <Input label="Phone" value={resume.phone} onChange={v => updateField('phone', v)} />
              <Input label="Email" value={resume.email} onChange={v => updateField('email', v)} />
            </div>
          </FormSection>

          {/* Education */}
          <FormSection title="🎓 Education" onAdd={() => addItem('education')}>
            {resume.education.map((edu, i) => (
              <div key={i} className="bg-[#0d1117] rounded-xl p-3 space-y-2 relative border border-gray-800/50">
                {resume.education.length > 1 && <RemoveBtn onClick={() => removeItem('education', i)} />}
                <Input label="School / University" value={edu.school} onChange={v => { const arr = [...resume.education]; arr[i].school = v; updateField('education', arr) }} />
                <div className="grid grid-cols-3 gap-2">
                  <Input label="Degree" value={edu.degree} onChange={v => { const arr = [...resume.education]; arr[i].degree = v; updateField('education', arr) }} />
                  <Input label="GPAX" value={edu.gpax} onChange={v => { const arr = [...resume.education]; arr[i].gpax = v; updateField('education', arr) }} />
                  <Input label="Year" value={edu.year} onChange={v => { const arr = [...resume.education]; arr[i].year = v; updateField('education', arr) }} placeholder="2024 - Present" />
                </div>
              </div>
            ))}
          </FormSection>

          {/* Activities */}
          <FormSection title="🏆 Activity & Achievement" onAdd={() => addItem('activities')}>
            {resume.activities.map((act, i) => (
              <div key={i} className="bg-[#0d1117] rounded-xl p-3 space-y-2 relative border border-gray-800/50">
                {resume.activities.length > 1 && <RemoveBtn onClick={() => removeItem('activities', i)} />}
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <Input label="Activity Title" value={act.title} onChange={v => { const arr = [...resume.activities]; arr[i].title = v; updateField('activities', arr) }} />
                  </div>
                  <Input label="Date" value={act.date} onChange={v => { const arr = [...resume.activities]; arr[i].date = v; updateField('activities', arr) }} />
                </div>
                <BulletList items={act.details} onChange={details => { const arr = [...resume.activities]; arr[i].details = details; updateField('activities', arr) }} />
              </div>
            ))}
          </FormSection>

          {/* Projects */}
          <FormSection title="💻 Projects" onAdd={() => addItem('projects')}>
            {resume.projects.map((proj, i) => (
              <div key={i} className="bg-[#0d1117] rounded-xl p-3 space-y-2 relative border border-gray-800/50">
                {resume.projects.length > 1 && <RemoveBtn onClick={() => removeItem('projects', i)} />}
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <Input label="Project Name" value={proj.name} onChange={v => { const arr = [...resume.projects]; arr[i].name = v; updateField('projects', arr) }} />
                  </div>
                  <Input label="Date" value={proj.date} onChange={v => { const arr = [...resume.projects]; arr[i].date = v; updateField('projects', arr) }} />
                </div>
                <BulletList items={proj.details} onChange={details => { const arr = [...resume.projects]; arr[i].details = details; updateField('projects', arr) }} />
              </div>
            ))}
          </FormSection>

          {/* Technical Skills (auto from system) */}
          <FormSection title="🛠 Technical Skills (Auto-filled)">
            <div className="flex flex-wrap gap-1.5">
              {allSkillNames.length === 0 ? (
                <p className="text-xs text-gray-500 italic">No skills added yet. Go to Skills tab first.</p>
              ) : allSkillNames.map(s => (
                <span key={s} className={`text-[11px] px-2.5 py-1 rounded-md border ${verifiedSkills.includes(s) ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-gray-800 border-gray-700 text-gray-400'
                  }`}>
                  {verifiedSkills.includes(s) ? '✓' : '○'} {s}
                </span>
              ))}
            </div>
          </FormSection>

          {/* Strengths */}
          <FormSection title="⭐ Additional Strengths" onAdd={() => addItem('strengths')}>
            {resume.strengths.map((s, i) => (
              <div key={i} className="flex gap-2 items-center">
                <span className="text-gray-600 text-xs">•</span>
                <input
                  className="flex-1 bg-[#0d1117] border border-gray-800 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 outline-none focus:border-purple-500 transition-colors"
                  value={s}
                  onChange={e => { const arr = [...resume.strengths]; arr[i] = e.target.value; updateField('strengths', arr) }}
                  placeholder="e.g. Strong teamwork and collaboration skills"
                />
                {resume.strengths.length > 1 && (
                  <button onClick={() => removeItem('strengths', i)} className="text-red-500/50 hover:text-red-400 text-xs">✕</button>
                )}
              </div>
            ))}
          </FormSection>

        </div>
      )}
    </div>
  )
}

// ── Reusable Form Components ──
function FormSection({ title, children, onAdd }: { title: string; children: React.ReactNode; onAdd?: () => void }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-white">{title}</h4>
        {onAdd && (
          <button onClick={onAdd} className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-1 rounded-lg hover:bg-purple-500/20 transition-colors font-bold">
            + Add
          </button>
        )}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function Input({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1 block">{label}</label>
      <input
        className="w-full bg-[#090d14] border border-gray-800 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 outline-none focus:border-purple-500 transition-colors"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder || label}
      />
    </div>
  )
}

function RemoveBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="absolute top-2 right-2 text-red-500/40 hover:text-red-400 text-xs font-bold transition-colors">✕</button>
  )
}

function BulletList({ items, onChange }: { items: string[]; onChange: (items: string[]) => void }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Details (bullet points)</label>
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 items-center">
          <span className="text-gray-600 text-xs">•</span>
          <input
            className="flex-1 bg-[#090d14] border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-600 outline-none focus:border-purple-500 transition-colors"
            value={item}
            onChange={e => { const arr = [...items]; arr[i] = e.target.value; onChange(arr) }}
            placeholder="Describe what you did..."
          />
          {items.length > 1 && <button onClick={() => { const arr = [...items]; arr.splice(i, 1); onChange(arr) }} className="text-red-500/40 hover:text-red-400 text-xs">✕</button>}
        </div>
      ))}
      <button
        onClick={() => onChange([...items, ''])}
        className="text-[10px] text-purple-400/60 hover:text-purple-400 transition-colors"
      >
        + Add bullet
      </button>
    </div>
  )
}

// ── Mini Preview ──
function TemplateMiniPreview({ id, accent }: { id: string; accent: string }) {
  if (id === 'classic') return (
    <div className="absolute inset-0 bg-white p-2">
      <div className="h-4 mb-2" style={{ background: accent }} />
      <div className="h-2 w-3/4 rounded bg-gray-300 mb-1" />
      <div className="h-1.5 w-1/2 rounded bg-gray-200 mb-2" />
      <div className="h-1 w-1/4 rounded mb-2" style={{ background: accent }} />
      {[1, 2, 3].map(i => <div key={i} className="h-1 w-full rounded bg-gray-100 mb-0.5" />)}
      <div className="h-1 w-1/4 rounded mb-1 mt-2" style={{ background: accent }} />
      {[1, 2].map(i => <div key={i} className="h-1 w-full rounded bg-gray-100 mb-0.5" />)}
    </div>
  )
  if (id === 'modern') return (
    <div className="absolute inset-0 bg-white flex">
      <div className="w-[35%] h-full p-2" style={{ background: accent }}>
        <div className="w-4 h-4 rounded-full bg-white/20 mx-auto mb-1" />
        {[1, 2, 3, 4].map(i => <div key={i} className="h-1 w-full rounded bg-white/30 mb-0.5" />)}
      </div>
      <div className="flex-1 p-2">
        <div className="h-2 w-3/4 rounded bg-gray-300 mb-1" />
        {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-1 w-full rounded bg-gray-100 mb-0.5" />)}
      </div>
    </div>
  )
  if (id === 'minimal') return (
    <div className="absolute inset-0 bg-white p-2">
      <div className="h-2 w-1/2 rounded bg-gray-800 mb-0.5" />
      <div className="h-1 w-1/3 rounded bg-gray-300 mb-2" />
      <div className="w-full h-px mb-2" style={{ background: accent }} />
      {[1, 2, 3, 4].map(i => <div key={i} className="h-1 w-full rounded bg-gray-100 mb-0.5" />)}
    </div>
  )
  return (
    <div className="absolute inset-0">
      <div className="h-[30%] p-2 flex flex-col justify-end" style={{ background: accent }}>
        <div className="h-2 w-3/4 rounded bg-white/80 mb-0.5" />
        <div className="h-1 w-1/2 rounded bg-white/50" />
      </div>
      <div className="bg-white p-2">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-1 w-full rounded bg-gray-100 mb-0.5" />)}
      </div>
    </div>
  )
}

