'use client'

import { useState, useEffect } from 'react'

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

interface ResumeData {
  fullName: string
  username: string
  phone: string
  email: string
  title: string
  education: { school: string; degree: string; gpax: string; year: string }[]
  activities: { title: string; date: string; details: string[] }[]
  projects: { name: string; date: string; details: string[] }[]
  strengths: string[]
}

const DEFAULT_RESUME: ResumeData = {
  fullName: '',
  username: '',
  phone: '',
  email: '',
  title: 'Software Developer',
  education: [{ school: '', degree: '', gpax: '', year: '' }],
  activities: [{ title: '', date: '', details: [''] }],
  projects: [{ name: '', date: '', details: [''] }],
  strengths: [''],
}

export default function ExportPortfolioTab({ userName = 'user', skills = [] }: WidgetExportTabProps) {
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
    } catch (e) { console.log(e); }
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-slate-200/50 pb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-1">
            <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Portfolio Export
          </h3>
          <p className="text-sm text-slate-500">Fill in your info, pick a template, and export as PDF</p>
        </div>
        <div className="flex gap-2 mt-3 md:mt-0">
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 font-bold px-5 py-2.5 rounded-xl transition-all text-sm border ${saved
              ? 'bg-green-600 border-green-500 text-white'
              : 'bg-white border-slate-300 text-slate-700 hover:border-slate-400 hover:text-slate-900'
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
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-purple-900/20 hover:scale-105 active:scale-95 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export PDF
          </button>
        </div>
      </div>

      {/* Section Toggle */}
      <div className="flex gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200 mb-6">
        {(['template', 'edit'] as const).map(s => (
          <button
            key={s}
            onClick={() => setActiveSection(s)}
            className={`flex-1 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeSection === s ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
          >
            {s === 'template' ? 'Choose Template' : 'Edit Resume'}
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
                : 'border-slate-200 hover:border-slate-300'
                }`}
            >
              <div className="aspect-[3/4] relative overflow-hidden bg-[#f8fafc]">
                <TemplateMiniPreview id={t.id} accent={t.accent} />
              </div>
              <div className="p-2.5 bg-white text-left">
                <p className="text-xs font-bold text-slate-900">{t.name}</p>
                <p className="text-[10px] text-slate-400">{t.desc}</p>
              </div>
              {selectedTemplate === t.id && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-3.5 h-3.5 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <FormSection title="Personal Info">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Full Name" value={resume.fullName} onChange={v => updateField('fullName', v)} />
              <Input label="Job Title" value={resume.title} onChange={v => updateField('title', v)} />
              <Input label="Phone" value={resume.phone} onChange={v => updateField('phone', v)} />
              <Input label="Email" value={resume.email} onChange={v => updateField('email', v)} />
            </div>
          </FormSection>

          {/* Education */}
          <FormSection title="Education" onAdd={() => addItem('education')}>
            {resume.education.map((edu, i) => (
              <div key={i} className="bg-white rounded-xl p-3 space-y-2 relative border border-slate-200/50">
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
          <FormSection title="Activity & Achievement" onAdd={() => addItem('activities')}>
            {resume.activities.map((act, i) => (
              <div key={i} className="bg-white rounded-xl p-3 space-y-2 relative border border-slate-200/50">
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
          <FormSection title="Projects" onAdd={() => addItem('projects')}>
            {resume.projects.map((proj, i) => (
              <div key={i} className="bg-white rounded-xl p-3 space-y-2 relative border border-slate-200/50">
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
          <FormSection title="Technical Skills (Auto-filled)">
            <div className="flex flex-wrap gap-1.5">
              {allSkillNames.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No skills added yet. Go to Skills tab first.</p>
              ) : allSkillNames.map(s => (
                <span key={s} className={`text-[11px] px-2.5 py-1 rounded-md border ${verifiedSkills.includes(s) ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-slate-100 border-slate-300 text-slate-500'
                  }`}>
                  {verifiedSkills.includes(s) ? '✓' : '○'} {s}
                </span>
              ))}
            </div>
          </FormSection>

          {/* Strengths */}
          <FormSection title="Additional Strengths" onAdd={() => addItem('strengths')}>
            {resume.strengths.map((s, i) => (
              <div key={i} className="flex gap-2 items-center">
                <span className="text-slate-400 text-xs">•</span>
                <input
                  className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-gray-600 outline-none focus:border-purple-500 transition-colors"
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
        <h4 className="text-sm font-bold text-slate-900">{title}</h4>
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
      <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1 block">{label}</label>
      <input
        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-gray-600 outline-none focus:border-purple-500 transition-colors"
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
      <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Details (bullet points)</label>
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 items-center">
          <span className="text-slate-400 text-xs">•</span>
          <input
            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 placeholder-gray-600 outline-none focus:border-purple-500 transition-colors"
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
      <div className="h-2 w-1/2 rounded bg-slate-100 mb-0.5" />
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

// ── HTML Generator ──
function generateResumeHtml(
  templateId: string, r: ResumeData, allSkills: string[], verifiedSkills: string[]
): string {
  const now = new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })
  const contactLine = [r.phone && `Tel : ${r.phone}`, r.email && `Email : ${r.email}`].filter(Boolean).join(' ')

  const eduHtml = r.education.filter(e => e.school).map(e => `
    <div style="display:flex;justify-content:space-between;margin-bottom:2px;"><strong>${e.school}</strong><span>${e.year}</span></div>
    ${e.degree ? `<ul style="margin:2px 0 8px 20px;"><li>${e.degree}</li>${e.gpax ? `<li>GPAX: ${e.gpax}</li>` : ''}</ul>` : ''}
  `).join('')

  const actHtml = r.activities.filter(a => a.title).map(a => `
    <div style="display:flex;justify-content:space-between;margin-bottom:2px;"><strong>${a.title}</strong><span>${a.date}</span></div>
    <ul style="margin:2px 0 10px 20px;">${a.details.filter(d => d).map(d => `<li>${d}</li>`).join('')}</ul>
  `).join('')

  const projHtml = r.projects.filter(p => p.name).map(p => `
    <div style="display:flex;justify-content:space-between;margin-bottom:2px;"><strong>"${p.name}"</strong><span>${p.date}</span></div>
    <ul style="margin:2px 0 10px 20px;">${p.details.filter(d => d).map(d => `<li>${d}</li>`).join('')}</ul>
  `).join('')

  const skillsHtml = allSkills.length > 0
    ? allSkills.map(s => `<span style="display:inline-block;margin:0 6px 4px 0;">${verifiedSkills.includes(s) ? '✓' : '•'} ${s}</span>`).join('')
    : '<em>No skills added</em>'

  const strengthsHtml = r.strengths.filter(s => s).map(s => `<li>${s}</li>`).join('')

  const head = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${r.fullName || 'Resume'}</title>
<style>
  @page { margin: 15mm; size: A4; }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: system-ui, -apple-system, sans-serif; font-size: 12px; color: #1a1a1a; line-height: 1.5; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  h1 { font-size: 28px; }
  h2 { font-size: 15px; margin-top: 18px; margin-bottom: 8px; }
  ul { padding-left: 18px; }
  li { margin-bottom: 2px; }
</style></head><body>`

  const end = `</body></html>`

  // ── Classic template (similar to the user's reference image) ──
  if (templateId === 'classic' || templateId === 'minimal') {
    const accent = templateId === 'classic' ? '#000' : '#10b981'
    const headingStyle = `font-weight:700;border-bottom:2px solid ${accent};padding-bottom:4px;`
    return `${head}
<div style="max-width:21cm;margin:0 auto;padding:20px 0;">
  <div style="text-align:center;margin-bottom:16px;">
    <h1 style="font-weight:900;margin-bottom:4px;">${r.fullName || r.username}</h1>
    ${contactLine ? `<p style="font-size:11px;color:#555;">${contactLine}</p>` : ''}
  </div>
  ${eduHtml ? `<h2 style="${headingStyle}">Education</h2>${eduHtml}` : ''}
  ${actHtml ? `<h2 style="${headingStyle}">Activity & Achievement</h2>${actHtml}` : ''}
  ${projHtml ? `<h2 style="${headingStyle}">Project</h2>${projHtml}` : ''}
  <h2 style="${headingStyle}">Technical Skills</h2>
  <div style="margin-bottom:12px;">${skillsHtml}</div>
  ${strengthsHtml ? `<h2 style="${headingStyle}">Additional Strengths</h2><ul>${strengthsHtml}</ul>` : ''}
  <p style="font-size:9px;color:#aaa;margin-top:40px;text-align:center;">Generated from Skill Wallet · ${now}</p>
</div>${end}`
  }

  if (templateId === 'modern') {
    return `${head}
<div style="display:flex;min-height:29.7cm;max-width:21cm;margin:0 auto;">
  <div style="width:35%;background:#8b5cf6;color:white;padding:32px 20px;">
    <div style="width:70px;height:70px;border-radius:50%;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:700;margin-bottom:16px;">${(r.fullName || 'U')[0].toUpperCase()}</div>
    <h1 style="font-size:18px;color:white;margin-bottom:2px;">${r.fullName || r.username}</h1>
    <p style="font-size:11px;opacity:0.8;margin-bottom:4px;">${r.title}</p>
    ${r.phone ? `<p style="font-size:10px;opacity:0.7;">${r.phone}</p>` : ''}
    ${r.email ? `<p style="font-size:10px;opacity:0.7;">${r.email}</p>` : ''}
    <h3 style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2px;border-bottom:1px solid rgba(255,255,255,0.3);padding-bottom:4px;margin:20px 0 8px;">Skills</h3>
    ${allSkills.map(s => `<p style="font-size:11px;margin-bottom:3px;">${verifiedSkills.includes(s) ? '✓' : '○'} ${s}</p>`).join('')}
    ${strengthsHtml ? `<h3 style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2px;border-bottom:1px solid rgba(255,255,255,0.3);padding-bottom:4px;margin:20px 0 8px;">Strengths</h3><ul style="padding-left:14px;font-size:11px;opacity:0.9;">${strengthsHtml}</ul>` : ''}
  </div>
  <div style="flex:1;padding:32px 28px;">
    ${eduHtml ? `<h2 style="color:#8b5cf6;border-bottom:2px solid #8b5cf6;padding-bottom:4px;">Education</h2>${eduHtml}` : ''}
    ${actHtml ? `<h2 style="color:#8b5cf6;border-bottom:2px solid #8b5cf6;padding-bottom:4px;">Activity & Achievement</h2>${actHtml}` : ''}
    ${projHtml ? `<h2 style="color:#8b5cf6;border-bottom:2px solid #8b5cf6;padding-bottom:4px;">Project</h2>${projHtml}` : ''}
    <p style="font-size:9px;color:#aaa;margin-top:40px;">Skill Wallet · ${now}</p>
  </div>
</div>${end}`
  }

  // Bold
  return `${head}
<div style="max-width:21cm;margin:0 auto;">
  <div style="background:#f59e0b;padding:32px 40px;color:#1c1917;">
    <h1 style="font-size:36px;font-weight:900;text-transform:uppercase;letter-spacing:3px;margin-bottom:2px;">${r.fullName || r.username}</h1>
    <p style="font-size:14px;font-weight:600;">${r.title} ${contactLine ? `· ${contactLine}` : ''}</p>
  </div>
  <div style="padding:28px 40px;">
    ${eduHtml ? `<h2 style="color:#f59e0b;font-weight:800;text-transform:uppercase;letter-spacing:2px;border-bottom:2px solid #f59e0b;padding-bottom:4px;">Education</h2>${eduHtml}` : ''}
    ${actHtml ? `<h2 style="color:#f59e0b;font-weight:800;text-transform:uppercase;letter-spacing:2px;border-bottom:2px solid #f59e0b;padding-bottom:4px;">Activity & Achievement</h2>${actHtml}` : ''}
    ${projHtml ? `<h2 style="color:#f59e0b;font-weight:800;text-transform:uppercase;letter-spacing:2px;border-bottom:2px solid #f59e0b;padding-bottom:4px;">Project</h2>${projHtml}` : ''}
    <h2 style="color:#f59e0b;font-weight:800;text-transform:uppercase;letter-spacing:2px;border-bottom:2px solid #f59e0b;padding-bottom:4px;">Technical Skills</h2>
    <div style="margin-bottom:12px;">${skillsHtml}</div>
    ${strengthsHtml ? `<h2 style="color:#f59e0b;font-weight:800;text-transform:uppercase;letter-spacing:2px;border-bottom:2px solid #f59e0b;padding-bottom:4px;">Additional Strengths</h2><ul>${strengthsHtml}</ul>` : ''}
    <p style="font-size:9px;color:#aaa;margin-top:40px;text-align:center;">Skill Wallet · ${now}</p>
  </div>
</div>${end}`
}
