'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { githubService } from '@/lib/services/github.service'
import { fetchAPI } from '@/lib/services/api'
import { 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  GraduationCap, 
  Sparkles, 
  RefreshCw, 
  FileText, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Eye, 
  Award, 
  Save,
  CheckCircle2
} from 'lucide-react'

interface WidgetExportTabProps {
  userName?: string
  skills?: Array<{ name: string; verified?: boolean; level?: number;[key: string]: any }>
}

const TEMPLATES = [
  { id: 'classic', name: 'Classic Minimalist', accent: '#1e293b', desc: 'Clean single column standard resume' },
  { id: 'modern', name: 'Modern Sidebar', accent: '#8b5cf6', desc: 'Elegant two-column layout with sidebar' },
  { id: 'minimal', name: 'Emerald Sleek', accent: '#10b981', desc: 'Ultra-clean layout with fresh accents' },
  { id: 'bold', name: 'Bold Accent', accent: '#f59e0b', desc: 'Stylish dark gold header bar resume' },
  { id: 'royal', name: 'Royal Navy Dark', accent: '#0f172a', desc: 'Premium deep blue template with gold headings' },
] as const

type TemplateId = typeof TEMPLATES[number]['id']

interface ResumeData {
  fullName: string
  username: string
  phone: string
  email: string
  title: string
  education?: string
  experience?: string
  projects: { id?: string; name: string; date: string; details: string[] }[]
}

const DEFAULT_RESUME: ResumeData = {
  fullName: '',
  username: '',
  phone: '',
  email: '',
  title: 'Software Developer',
  education: '',
  experience: '',
  projects: [],
}

export default function ExportPortfolioTab({ userName = 'user', skills = [] }: WidgetExportTabProps) {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('classic')
  const [saved, setSaved] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [resume, setResume] = useState<ResumeData>({
    ...DEFAULT_RESUME,
    fullName: userName,
    username: userName,
  })
  const [generatingIdx, setGeneratingIdx] = useState<number | null>(null)

  // Load saved resume from localStorage on mount & auto-fill from Github if empty
  useEffect(() => {
    const initResume = async () => {
      let savedResume = null
      try {
        const data = localStorage.getItem('skill-wallet-resume')
        if (data) {
          const parsed = JSON.parse(data)
          savedResume = parsed.resume
          if (parsed.template) setSelectedTemplate(parsed.template)
        }
      } catch (e) {
        console.warn('Failed to load saved resume:', e)
      }

      // Check if the saved resume is empty or has only empty placeholders
      const isProjectsEmpty = !savedResume || 
                            !savedResume.projects || 
                            savedResume.projects.length === 0 || 
                            (savedResume.projects.length === 1 && !savedResume.projects[0].name);

      const isPersonalInfoEmpty = !savedResume || !savedResume.fullName || !savedResume.email;

      if (savedResume && !isProjectsEmpty && !isPersonalInfoEmpty) {
        setResume(savedResume)
      } else if (user?.uid) {
        try {
          const data = await githubService.getDashboard()
          const profile = data?.data || data
          const ghRepos = profile?.recentRepos || []
          
          // Prioritize Pinned spotlight repos
          const spotlightRepos = ghRepos.filter((repo: any) => repo.isSpotlight)
          const filteredRepos = spotlightRepos.length > 0 ? spotlightRepos : ghRepos

          const autoProjects = filteredRepos.slice(0, 5).map((repo: any) => {
            const dateObj = new Date(repo.updatedAt)
            const yearStr = !isNaN(dateObj.getTime()) ? String(dateObj.getFullYear()) : '2026'
            return {
              id: repo.id,
              name: repo.name,
              date: yearStr,
              details: repo.aiBulletPoints && repo.aiBulletPoints.length > 0
                ? repo.aiBulletPoints
                : [repo.description || `Developed and maintained ${repo.name} repository.`]
            }
          })

          setResume(prev => {
            const baseResume = savedResume || prev;
            return {
              ...baseResume,
              fullName: baseResume.fullName || user.displayName || '',
              email: baseResume.email || user.email || '',
              title: baseResume.title && baseResume.title !== 'Software Developer' ? baseResume.title : (profile?.profile?.title || 'Software Developer'),
              education: baseResume.education || '',
              experience: baseResume.experience || '',
              projects: isProjectsEmpty && autoProjects.length > 0 ? autoProjects : (baseResume.projects || prev.projects)
            }
          })
        } catch (err) {
          console.error('Failed to auto-populate resume:', err)
          if (savedResume) setResume(savedResume)
        }
      }
    }

    initResume()
  }, [user])

  const allSkillNames = skills.filter(s => s.verified).map(s => s.name)

  const syncWithSpotlight = async () => {
    if (!user?.uid) return
    setIsSyncing(true)
    try {
      const data = await githubService.getDashboard()
      const profile = data?.data || data
      const ghRepos = profile?.recentRepos || []
      
      const spotlightRepos = ghRepos.filter((repo: any) => repo.isSpotlight)
      const filteredRepos = spotlightRepos.length > 0 ? spotlightRepos : ghRepos
      
      const autoProjects = filteredRepos.slice(0, 5).map((repo: any) => {
        const dateObj = new Date(repo.updatedAt)
        const yearStr = !isNaN(dateObj.getTime()) ? String(dateObj.getFullYear()) : '2026'
        return {
          id: repo.id,
          name: repo.name,
          date: yearStr,
          details: repo.aiBulletPoints && repo.aiBulletPoints.length > 0
            ? repo.aiBulletPoints
            : [repo.description || `Developed and maintained ${repo.name} repository.`]
        }
      })
      
      setResume(prev => {
        const nextResume = {
          ...prev,
          projects: autoProjects
        }
        localStorage.setItem('skill-wallet-resume', JSON.stringify({ resume: nextResume, template: selectedTemplate }))
        return nextResume
      })
    } catch (err) {
      console.error('Failed to sync spotlight:', err)
      alert('เกิดข้อผิดพลาดในการดึงข้อมูล Spotlight')
    } finally {
      setIsSyncing(false)
    }
  }

  const handleGenerateAiBullets = async (idx: number, repoName: string) => {
    const project = resume.projects[idx]
    if (!project) return
    
    let repoDocId = project.id
    
    if (!repoDocId && user?.uid) {
      try {
        const data = await githubService.getDashboard()
        const profile = data?.data || data
        const ghRepos = profile?.recentRepos || []
        const match = ghRepos.find((r: any) => r.name === repoName)
        if (match) {
          repoDocId = match.id
        }
      } catch (err) {
        console.error('Failed to resolve repo ID:', err)
      }
    }

    if (!repoDocId) {
      alert('ไม่พบข้อมูล ID ของคลังข้อมูลนี้ กรุณาซิงค์ GitHub ใหม่อีกครั้ง')
      return
    }

    setGeneratingIdx(idx)
    try {
      const response = await fetchAPI('/ai/repo-bullets', {
        method: 'POST',
        body: JSON.stringify({ repoDocId })
      })

      if (response?.success && response?.data) {
        const bullets = response.data
        setResume(prev => {
          const updatedProjects = [...prev.projects]
          updatedProjects[idx] = {
            ...updatedProjects[idx],
            details: bullets
          }
          const nextResume = {
            ...prev,
            projects: updatedProjects
          }
          localStorage.setItem('skill-wallet-resume', JSON.stringify({ resume: nextResume, template: selectedTemplate }))
          return nextResume
        })
      }
    } catch (err: any) {
      console.error('Failed to generate AI bullets:', err)
      alert(err.message || 'เกิดข้อผิดพลาดในการสร้างคำอธิบายโครงการด้วย AI')
    } finally {
      setGeneratingIdx(null)
    }
  }

  const handleSave = () => {
    localStorage.setItem('skill-wallet-resume', JSON.stringify({ resume, template: selectedTemplate }))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handlePrint = () => {
    handleSave() // auto-save before export
    const html = generateResumeHtml(selectedTemplate, resume, allSkillNames)
    const w = window.open('', '_blank', 'width=800,height=1100')
    if (!w) return
    w.document.write(html)
    w.document.close()
    w.onload = () => w.print()
  }

  const updateField = (field: keyof ResumeData, value: any) => {
    const updated = { ...resume, [field]: value }
    setResume(updated)
    // Auto-save draft on type
    localStorage.setItem('skill-wallet-resume', JSON.stringify({ resume: updated, template: selectedTemplate }))
  }

  const steps = [
    { number: 1, label: 'ข้อมูลส่วนตัว', icon: <User size={16} /> },
    { number: 2, label: 'คลังผลงาน & AI', icon: <Sparkles size={16} /> },
    { number: 3, label: 'เลือกสไตล์ & ส่งออก', icon: <FileText size={16} /> }
  ]

  return (
    <div className="glass-panel p-8 rounded-3xl animate-in fade-in duration-500 flex flex-col min-h-[600px] justify-between">
      {/* 1. Upper Section: Title and Stepper Progress Bar */}
      <div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-[var(--border)] pb-5">
          <div>
            <h3 className="text-xl font-bold text-[var(--text)] flex items-center gap-2 mb-1">
              <FileText className="w-5 h-5 text-indigo-500 animate-pulse" />
              Portfolio Export Wizard
            </h3>
            <p className="text-xs text-[var(--muted)]">ระบบตัวช่วยจัดพอร์ตโฟลิโอและส่งออกเรซูเม่แบบอัจฉริยะใน 3 ขั้นตอน</p>
          </div>
          {/* Quick Draft Save indicator */}
          <div className="mt-2 md:mt-0">
            <button
              onClick={handleSave}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                saved
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-[var(--surface2)]/60 border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface2)]'
              }`}
            >
              {saved ? (
                <>
                  <CheckCircle2 size={12} className="text-emerald-400" />
                  Saved Draft
                </>
              ) : (
                <>
                  <Save size={12} />
                  Save Draft
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stepper Header UI */}
        <div className="flex items-center justify-between max-w-2xl mx-auto mb-10 relative px-4">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[var(--border)] -translate-y-1/2 z-0" />
          <div 
            className="absolute top-1/2 left-0 h-0.5 bg-indigo-500 -translate-y-1/2 z-0 transition-all duration-300"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />

          {steps.map((s) => (
            <button
              key={s.number}
              onClick={() => setCurrentStep(s.number)}
              className="relative z-10 flex flex-col items-center gap-2 cursor-pointer focus:outline-none group"
            >
              <div 
                className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 font-bold ${
                  currentStep >= s.number 
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20 scale-105' 
                    : 'bg-[var(--surface)] border-[var(--border)] text-[var(--muted)] group-hover:border-slate-400'
                }`}
              >
                {s.icon}
              </div>
              <span className={`text-[10px] font-bold tracking-wider transition-colors duration-300 ${
                currentStep === s.number ? 'text-indigo-400' : 'text-[var(--muted)]'
              }`}>
                {s.label}
              </span>
            </button>
          ))}
        </div>

        {/* 2. Step Views */}
        <div className="min-h-[300px] mb-8">
          {/* STEP 1: Profile & Contacts Form */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in slide-in-from-bottom-3 duration-300">
              <div className="bg-[var(--surface2)]/30 border border-[var(--border)] rounded-2xl p-6 space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-[var(--border)]/40">
                  <User className="text-indigo-400 w-4 h-4" />
                  <h4 className="text-sm font-bold text-[var(--text)]">Contact & Core Profile (ข้อมูลหลักและผู้ติดต่อ)</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <FormInput label="Full Name" icon={<User size={12} />} value={resume.fullName} onChange={v => updateField('fullName', v)} />
                  <FormInput label="Job Title" icon={<Briefcase size={12} />} value={resume.title} onChange={v => updateField('title', v)} />
                  <FormInput label="Phone Number" icon={<Phone size={12} />} value={resume.phone} onChange={v => updateField('phone', v)} />
                  <FormInput label="Email Address" icon={<Mail size={12} />} value={resume.email} onChange={v => updateField('email', v)} />
                </div>
              </div>

              <div className="bg-[var(--surface2)]/30 border border-[var(--border)] rounded-2xl p-6 space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-[var(--border)]/40">
                  <GraduationCap className="text-indigo-400 w-4 h-4" />
                  <h4 className="text-sm font-bold text-[var(--text)]">Education & Work Experience (ประวัติและผลงาน)</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-[10px] text-[var(--muted)] uppercase tracking-wider font-bold mb-1.5 flex items-center gap-1.5">
                      <GraduationCap size={12} />
                      Education (ประวัติการศึกษา)
                    </label>
                    <textarea
                      rows={3}
                      className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3 text-xs text-[var(--text)] placeholder-slate-600 outline-none focus:border-indigo-500 transition-colors resize-none leading-relaxed"
                      value={resume.education || ''}
                      onChange={e => updateField('education', e.target.value)}
                      placeholder="เช่น ปริญญาตรี สาขาวิทยาการคอมพิวเตอร์ มหาวิทยาลัย (2022 - 2026)"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[var(--muted)] uppercase tracking-wider font-bold mb-1.5 flex items-center gap-1.5">
                      <Briefcase size={12} />
                      Experience (ประสบการณ์ทำงาน)
                    </label>
                    <textarea
                      rows={3}
                      className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3 text-xs text-[var(--text)] placeholder-slate-600 outline-none focus:border-indigo-500 transition-colors resize-none leading-relaxed"
                      value={resume.experience || ''}
                      onChange={e => updateField('experience', e.target.value)}
                      placeholder="เช่น Frontend Developer Intern ที่ TechCorp (3 เดือน)"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: GitHub Projects Spotlight & AI description builder */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in slide-in-from-bottom-3 duration-300">
              <div className="bg-[var(--surface2)]/30 border border-[var(--border)] rounded-2xl p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-[var(--border)]/40 mb-5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="text-purple-400 w-4 h-4 animate-pulse" />
                    <div>
                      <h4 className="text-sm font-bold text-[var(--text)]">GitHub Pinned Projects</h4>
                      <p className="text-[10px] text-[var(--muted)] mt-0.5">ดึงโครงการเด่นที่ปักหมุดไว้จากหน้า Overview และใช้ AI เพิ่มเนื้อหา</p>
                    </div>
                  </div>
                  <button
                    onClick={syncWithSpotlight}
                    disabled={isSyncing}
                    className="text-xs bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/20 text-purple-400 font-bold px-3 py-1.5 rounded-lg cursor-pointer flex items-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    <RefreshCw size={12} className={isSyncing ? "animate-spin" : ""} />
                    {isSyncing ? 'Syncing...' : 'Sync Pinned Spotlight'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {resume.projects.length === 0 ? (
                    <div className="col-span-2 text-center py-10 border border-dashed border-[var(--border)] rounded-xl">
                      <p className="text-xs text-[var(--muted)] italic">ไม่มีข้อมูลโปรเจกต์เด่นที่ถูกเลือกหรือปักหมุดไว้ที่หน้า Overview</p>
                    </div>
                  ) : resume.projects.map((p, idx) => (
                    <div key={idx} className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-2xl flex flex-col justify-between gap-3 hover:border-indigo-500/30 transition-colors">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-bold text-slate-200 bg-[var(--surface2)] px-2.5 py-0.5 rounded-lg border border-[var(--border)] truncate max-w-[80%]">
                            {p.name}
                          </span>
                          <span className="text-[10px] font-mono text-[var(--muted)]">{p.date}</span>
                        </div>

                        {p.details && p.details.length > 0 && (
                          <ul className="list-disc pl-4 space-y-1">
                            {p.details.map((bullet, bIdx) => (
                              <li key={bIdx} className="text-[10px] text-[var(--muted)] leading-relaxed">
                                {bullet}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <div className="flex justify-end pt-2 border-t border-[var(--border)]/40">
                        <button
                          onClick={() => handleGenerateAiBullets(idx, p.name)}
                          disabled={generatingIdx !== null}
                          className="text-[10px] text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 cursor-pointer bg-none border-none outline-none disabled:opacity-50 hover:underline"
                        >
                          <Sparkles className={`w-3 h-3 ${generatingIdx === idx ? 'animate-spin' : ''}`} />
                          {generatingIdx === idx ? 'Generating...' : '✨ AI Generate Description'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Style Picker & A4 Live Document Preview */}
          {currentStep === 3 && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-in slide-in-from-bottom-3 duration-300">
              {/* Left Column: Template Styles Picker */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-[var(--surface2)]/30 border border-[var(--border)] rounded-2xl p-5">
                  <h4 className="text-xs font-bold text-[var(--text)] uppercase tracking-wider mb-4 flex items-center gap-1.5">
                    <Award size={14} className="text-indigo-400" />
                    Select Theme Style
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    {TEMPLATES.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTemplate(t.id)}
                        className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-3 ${
                          selectedTemplate === t.id
                            ? 'border-indigo-500 bg-indigo-500/[0.03] shadow-md'
                            : 'border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface2)]'
                        }`}
                      >
                        <div className="w-4 h-4 rounded-full border-2 border-indigo-500 flex items-center justify-center shrink-0 mt-0.5">
                          {selectedTemplate === t.id && <div className="w-2 h-2 bg-indigo-500 rounded-full" />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[var(--text)]">{t.name}</p>
                          <p className="text-[10px] text-[var(--muted)] mt-0.5">{t.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-[var(--surface2)]/30 border border-[var(--border)] rounded-2xl p-5 space-y-3">
                  <h4 className="text-xs font-bold text-[var(--text)] uppercase tracking-wider flex items-center gap-1.5">
                    <Award size={14} className="text-indigo-400" />
                    Technical Skills Included
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {allSkillNames.length === 0 ? (
                      <p className="text-xs text-[var(--muted)] italic">ไม่มีทักษะที่ยืนยัน (แสดงเฉพาะ Verified Skills)</p>
                    ) : allSkillNames.map(s => (
                      <span key={s} className="text-[10px] px-2 py-0.5 rounded-md border border-[var(--border)] bg-[var(--surface)] text-[var(--text)]">
                        • {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: High-Fidelity Mini A4 Page Preview Mockup */}
              <div className="lg:col-span-3 flex flex-col items-center">
                <p className="text-[10px] text-[var(--muted)] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 self-start">
                  <Eye size={12} />
                  Live Resume Mockup (A4 Preview)
                </p>
                <div className="w-full aspect-[1/1.414] bg-white border border-slate-300 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden p-6 text-slate-800 flex flex-col justify-between select-none">
                  {/* Miniature Content Based on Selected Template */}
                  <div>
                    {/* Header Mockup */}
                    {selectedTemplate === 'bold' ? (
                      <div className="bg-amber-500 -mx-6 -mt-6 p-4 text-slate-900 mb-4">
                        <h2 className="text-sm font-bold uppercase tracking-wide truncate">{resume.fullName || 'YOUR NAME'}</h2>
                        <p className="text-[8px] font-semibold opacity-90 truncate">{resume.title}</p>
                        <p className="text-[7px] opacity-75 mt-1">{[resume.email, resume.phone].filter(Boolean).join(' · ')}</p>
                      </div>
                    ) : selectedTemplate === 'royal' ? (
                      <div className="bg-[#0f172a] -mx-6 -mt-6 p-4 text-amber-400 mb-4 text-center">
                        <h2 className="text-sm font-bold uppercase tracking-wide truncate">{resume.fullName || 'YOUR NAME'}</h2>
                        <p className="text-[8px] font-semibold text-slate-300 truncate">{resume.title}</p>
                        <p className="text-[7px] text-slate-400 mt-1">{[resume.email, resume.phone].filter(Boolean).join(' · ')}</p>
                      </div>
                    ) : (
                      <div className={`mb-4 pb-2 border-b border-slate-200 ${selectedTemplate === 'classic' ? 'text-center' : 'text-left'}`}>
                        <h2 className="text-sm font-bold uppercase tracking-tight text-slate-900">{resume.fullName || 'YOUR NAME'}</h2>
                        <p className="text-[8px] text-slate-500 font-medium">{resume.title}</p>
                        <p className="text-[7px] text-slate-400 mt-1">{[resume.email, resume.phone].filter(Boolean).join(' · ')}</p>
                      </div>
                    )}

                    {/* Layout Body Mockup */}
                    <div className="flex gap-4">
                      {/* Left Column (Sidebar) for Modern layout */}
                      {selectedTemplate === 'modern' && (
                        <div className="w-[30%] bg-purple-50 p-2 rounded-lg space-y-3 shrink-0">
                          <div>
                            <p className="text-[7px] text-purple-700 font-bold uppercase tracking-wider mb-1">Skills</p>
                            {allSkillNames.slice(0, 5).map(s => (
                              <p key={s} className="text-[6px] text-slate-600 font-medium">• {s}</p>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Main Column */}
                      <div className="flex-1 space-y-3 text-left">
                        {/* Education */}
                        {resume.education && (
                          <div>
                            <h3 className={`text-[8px] font-bold uppercase tracking-wider mb-1 ${
                              selectedTemplate === 'modern' ? 'text-purple-600' : 
                              selectedTemplate === 'minimal' ? 'text-emerald-600' : 
                              selectedTemplate === 'royal' ? 'text-[#0f172a] border-b border-amber-500/20 pb-0.5' : 
                              'text-slate-900'
                            }`}>Education</h3>
                            <p className="text-[7px] text-slate-600 leading-normal whitespace-pre-line">{resume.education}</p>
                          </div>
                        )}

                        {/* Experience */}
                        {resume.experience && (
                          <div>
                            <h3 className={`text-[8px] font-bold uppercase tracking-wider mb-1 ${
                              selectedTemplate === 'modern' ? 'text-purple-600' : 
                              selectedTemplate === 'minimal' ? 'text-emerald-600' : 
                              selectedTemplate === 'royal' ? 'text-[#0f172a] border-b border-amber-500/20 pb-0.5' : 
                              'text-slate-900'
                            }`}>Experience</h3>
                            <p className="text-[7px] text-slate-600 leading-normal whitespace-pre-line">{resume.experience}</p>
                          </div>
                        )}

                        {/* Projects */}
                        {resume.projects.length > 0 && (
                          <div>
                            <h3 className={`text-[8px] font-bold uppercase tracking-wider mb-1 ${
                              selectedTemplate === 'modern' ? 'text-purple-600' : 
                              selectedTemplate === 'minimal' ? 'text-emerald-600' : 
                              selectedTemplate === 'royal' ? 'text-[#0f172a] border-b border-amber-500/20 pb-0.5' : 
                              'text-slate-900'
                            }`}>Project</h3>
                            <div className="space-y-1.5">
                              {resume.projects.slice(0, 3).map((p, pIdx) => (
                                <div key={pIdx}>
                                  <div className="flex justify-between text-[7px] font-bold text-slate-800">
                                    <span>"{p.name}"</span>
                                    <span className="font-mono text-slate-400 font-normal">{p.date}</span>
                                  </div>
                                  <p className="text-[6px] text-slate-500 leading-relaxed mt-0.5">• {p.details[0] || 'Repository description'}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Skills for non-sidebar templates */}
                        {selectedTemplate !== 'modern' && allSkillNames.length > 0 && (
                          <div>
                            <h3 className={`text-[8px] font-bold uppercase tracking-wider mb-1 ${
                              selectedTemplate === 'minimal' ? 'text-emerald-600' : 
                              selectedTemplate === 'royal' ? 'text-[#0f172a] border-b border-amber-500/20 pb-0.5' : 
                              'text-slate-900'
                            }`}>Technical Skills</h3>
                            <p className="text-[7px] text-slate-650 leading-relaxed">
                              {allSkillNames.map(s => `• ${s}`).join('   ')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Footer Mockup */}
                  <p className="text-[6px] text-slate-350 text-center border-t border-slate-100 pt-1.5 mt-2">
                    Skill Wallet Resume · Powered by AI Verification
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Navigation Controls */}
      <div className="flex justify-between border-t border-[var(--border)] pt-5 mt-4">
        <button
          onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
          disabled={currentStep === 1}
          className="flex items-center gap-1.5 px-4 py-2 border border-[var(--border)] rounded-xl text-xs font-bold text-[var(--text)] bg-[var(--surface2)]/60 hover:bg-[var(--surface2)] cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={14} />
          ย้อนกลับ
        </button>

        {currentStep < 3 ? (
          <button
            onClick={() => setCurrentStep(prev => Math.min(3, prev + 1))}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-900/20 hover:scale-[1.02] active:scale-95 cursor-pointer transition-all"
          >
            ถัดไป
            <ChevronRight size={14} />
          </button>
        ) : (
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-purple-650 hover:bg-purple-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-900/20 hover:scale-[1.02] active:scale-95 cursor-pointer transition-all"
          >
            <Download size={14} />
            ดาวน์โหลด PDF
          </button>
        )}
      </div>
    </div>
  )
}

// ── Form Input Helper Sub-component ──
interface FormInputProps {
  label: string
  icon: React.ReactNode
  value: string
  onChange: (v: string) => void
  placeholder?: string
}

function FormInput({ label, icon, value, onChange, placeholder }: FormInputProps) {
  return (
    <div>
      <label className="text-[10px] text-[var(--muted)] uppercase tracking-wider font-bold mb-1.5 flex items-center gap-1 block">
        {icon}
        {label}
      </label>
      <input
        className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text)] placeholder-slate-600 outline-none focus:border-indigo-500 transition-colors"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder || label}
      />
    </div>
  )
}

// ── HTML Generator (Identical layout to print beautifully) ──
function generateResumeHtml(
  templateId: string, r: ResumeData, allSkills: string[]
): string {
  const now = new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })
  const contactLine = [r.phone && `Tel : ${r.phone}`, r.email && `Email : ${r.email}`].filter(Boolean).join(' ')

  const projHtml = r.projects.filter(p => p.name).map(p => `
    <div style="display:flex;justify-content:space-between;margin-bottom:2px;"><strong>"${p.name}"</strong><span>${p.date}</span></div>
    <ul style="margin:2px 0 10px 20px;">${p.details.filter(d => d).map(d => `<li>${d}</li>`).join('')}</ul>
  `).join('')

  const skillsHtml = allSkills.length > 0
    ? allSkills.map(s => `<span style="display:inline-block;margin:0 12px 4px 0;">• ${s}</span>`).join('')
    : '<em>No skills added</em>'

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

  // ── Classic & Minimal template ──
  if (templateId === 'classic' || templateId === 'minimal') {
    const accent = templateId === 'classic' ? '#000' : '#10b981'
    const headingStyle = `font-weight:700;border-bottom:2px solid ${accent};padding-bottom:4px;`
    return `${head}
<div style="max-width:21cm;margin:0 auto;padding:20px 0;">
  <div style="text-align:center;margin-bottom:16px;">
    <h1 style="font-weight:900;margin-bottom:4px;">${r.fullName || r.username}</h1>
    ${contactLine ? `<p style="font-size:11px;color:#555;">${contactLine}</p>` : ''}
  </div>
  ${r.education ? `
    <h2 style="${headingStyle}">Education</h2>
    <div style="margin-bottom:12px;font-size:11px;white-space:pre-line;">${r.education}</div>
  ` : ''}
  ${r.experience ? `
    <h2 style="${headingStyle}">Experience</h2>
    <div style="margin-bottom:12px;font-size:11px;white-space:pre-line;">${r.experience}</div>
  ` : ''}
  ${projHtml ? `<h2 style="${headingStyle}">Project</h2>${projHtml}` : ''}
  <h2 style="${headingStyle}">Technical Skills</h2>
  <div style="margin-bottom:12px;">${skillsHtml}</div>
  <p style="font-size:9px;color:#aaa;margin-top:40px;text-align:center;">Generated from Skill Wallet · ${now}</p>
</div>${end}`
  }

  // ── Modern template ──
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
    ${allSkills.map(s => `<p style="font-size:11px;margin-bottom:3px;">• ${s}</p>`).join('')}
  </div>
  <div style="flex:1;padding:32px 28px;">
    ${r.education ? `
      <h2 style="color:#8b5cf6;border-bottom:2px solid #8b5cf6;padding-bottom:4px;margin-top:14px;margin-bottom:6px;">Education</h2>
      <div style="font-size:11px;color:#333;margin-bottom:12px;white-space:pre-line;">${r.education}</div>
    ` : ''}
    ${r.experience ? `
      <h2 style="color:#8b5cf6;border-bottom:2px solid #8b5cf6;padding-bottom:4px;margin-top:14px;margin-bottom:6px;">Experience</h2>
      <div style="font-size:11px;color:#333;margin-bottom:12px;white-space:pre-line;">${r.experience}</div>
    ` : ''}
    ${projHtml ? `<h2 style="color:#8b5cf6;border-bottom:2px solid #8b5cf6;padding-bottom:4px;margin-top:14px;">Project</h2>${projHtml}` : ''}
    <p style="font-size:9px;color:#aaa;margin-top:40px;">Skill Wallet · ${now}</p>
  </div>
</div>${end}`
  }

  // ── Royal Navy Dark template ──
  if (templateId === 'royal') {
    const headingStyle = `color:#0f172a;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;border-bottom:2px solid #f59e0b;padding-bottom:3px;margin-top:16px;margin-bottom:6px;`
    return `${head}
<div style="max-width:21cm;margin:0 auto;background:#fff;min-height:29.7cm;">
  <div style="background:#0f172a;padding:28px 36px;color:#fff;text-align:center;">
    <h1 style="font-size:32px;font-weight:900;text-transform:uppercase;letter-spacing:2px;margin-bottom:4px;color:#f59e0b;">${r.fullName || r.username}</h1>
    <p style="font-size:13px;font-weight:600;color:#e2e8f0;margin-bottom:6px;">${r.title}</p>
    ${contactLine ? `<p style="font-size:10px;color:#cbd5e1;letter-spacing:0.5px;">${contactLine}</p>` : ''}
  </div>
  <div style="padding:24px 36px;">
    ${r.education ? `
      <h2 style="${headingStyle}">Education</h2>
      <div style="font-size:11px;color:#334155;margin-bottom:12px;white-space:pre-line;">${r.education}</div>
    ` : ''}
    ${r.experience ? `
      <h2 style="${headingStyle}">Experience</h2>
      <div style="font-size:11px;color:#334155;margin-bottom:12px;white-space:pre-line;">${r.experience}</div>
    ` : ''}
    ${projHtml ? `<h2 style="${headingStyle}">Project</h2>${projHtml}` : ''}
    <h2 style="${headingStyle}">Technical Skills</h2>
    <div style="margin-bottom:12px;color:#334155;">${skillsHtml}</div>
    <p style="font-size:9px;color:#aaa;margin-top:40px;text-align:center;border-top:1px solid #e2e8f0;padding-top:12px;">Skill Wallet · ${now}</p>
  </div>
</div>${end}`
  }

  // ── Bold template ──
  return `${head}
<div style="max-width:21cm;margin:0 auto;">
  <div style="background:#f59e0b;padding:32px 40px;color:#1c1917;">
    <h1 style="font-size:36px;font-weight:900;text-transform:uppercase;letter-spacing:3px;margin-bottom:2px;">${r.fullName || r.username}</h1>
    <p style="font-size:14px;font-weight:600;">${r.title} ${contactLine ? `· ${contactLine}` : ''}</p>
  </div>
  <div style="padding:28px 40px;">
    ${r.education ? `
      <h2 style="color:#f59e0b;font-weight:800;text-transform:uppercase;letter-spacing:2px;border-bottom:2px solid #f59e0b;padding-bottom:4px;margin-top:18px;margin-bottom:8px;">Education</h2>
      <div style="font-size:11px;color:#444;margin-bottom:12px;white-space:pre-line;">${r.education}</div>
    ` : ''}
    ${r.experience ? `
      <h2 style="color:#f59e0b;font-weight:800;text-transform:uppercase;letter-spacing:2px;border-bottom:2px solid #f59e0b;padding-bottom:4px;margin-top:18px;margin-bottom:8px;">Experience</h2>
      <div style="font-size:11px;color:#444;margin-bottom:12px;white-space:pre-line;">${r.experience}</div>
    ` : ''}
    ${projHtml ? `<h2 style="color:#f59e0b;font-weight:800;text-transform:uppercase;letter-spacing:2px;border-bottom:2px solid #f59e0b;padding-bottom:4px;margin-top:18px;">Project</h2>${projHtml}` : ''}
    <h2 style="color:#f59e0b;font-weight:800;text-transform:uppercase;letter-spacing:2px;border-bottom:2px solid #f59e0b;padding-bottom:4px;margin-top:18px;">Technical Skills</h2>
    <div style="margin-bottom:12px;">${skillsHtml}</div>
    <p style="font-size:9px;color:#aaa;margin-top:40px;text-align:center;">Skill Wallet · ${now}</p>
  </div>
</div>${end}`
}
