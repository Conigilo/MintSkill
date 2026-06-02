'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { githubService } from '@/lib/services/github.service'
import { fetchAPI } from '@/lib/services/api'
import { 
  User, 
  Mail, 
  Briefcase, 
  RefreshCw, 
  FileText, 
  Download, 
  Eye, 
  Award, 
  CheckCircle2,
  Github,
  Linkedin,
  MapPin,
  Code,
  Sparkles,
  Phone,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp
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
  bio?: string
  location?: string
  linkedinUrl?: string
  githubUsername?: string
  projects: { id?: string; name: string; date: string; details: string[] }[]
}

const DEFAULT_RESUME: ResumeData = {
  fullName: '',
  username: '',
  phone: '',
  email: '',
  title: 'Software Developer',
  bio: '',
  location: '',
  linkedinUrl: '',
  githubUsername: '',
  projects: [],
}

const QUICK_PROMPTS = [
  { label: 'Tailor for Frontend', prompt: 'Tailor my resume for a Senior Frontend Developer role. Rephrase my projects to highlight React, Next.js, and TypeScript, and make my bio sound highly professional.' },
  { label: 'Tailor for Backend', prompt: 'Tailor my resume for a Backend Developer role. Rephrase my project descriptions to highlight Elysia, Node.js, and database performance. Emphasize APIs.' },
  { label: 'Translate to English', prompt: 'Translate all content (including my bio, title, and project descriptions) into professional English. Use strong action verbs.' },
  { label: 'Make it Concise (Single Page)', prompt: 'Condense and streamline all text to be clean and concise, ensuring it easily fits on a single page CV. Make bullets punchy and short.' },
  { label: 'High-Impact Verbs', prompt: 'Rewrite my project descriptions using strong, professional developer action verbs (e.g., Designed, Optimized, Implemented, Streamlined, Spearheaded).' }
]

export default function ExportPortfolioTab({ userName = 'user', skills = [] }: WidgetExportTabProps) {
  const { user } = useAuth()
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('classic')
  const [isSyncing, setIsSyncing] = useState(false)
  const [resume, setResume] = useState<ResumeData>({
    ...DEFAULT_RESUME,
    fullName: userName,
    username: userName,
  })

  // AI states
  const [aiPrompt, setAiPrompt] = useState('')
  const [isAIArranging, setIsAIArranging] = useState(false)
  const [refinementsSummary, setRefinementsSummary] = useState<string[]>([])
  const [aiError, setAiError] = useState<string | null>(null)

  // Editor states
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  // Load saved template preference and data on mount & auto-sync from profile/Github
  useEffect(() => {
    const initResume = async () => {
      // Load saved template preference
      try {
        const data = localStorage.getItem('skill-wallet-resume')
        if (data) {
          const parsed = JSON.parse(data)
          if (parsed.resume) setResume(parsed.resume)
          if (parsed.template) setSelectedTemplate(parsed.template)
          if (parsed.refinementsSummary) setRefinementsSummary(parsed.refinementsSummary)
        }
      } catch (e) {
        console.warn('Failed to load saved template preference:', e)
      }

      if (!user?.uid) return

      setIsSyncing(true)
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
            details: repo.description ? [repo.description] : [`Developed and maintained the ${repo.name} repository on GitHub.`]
          }
        })

        // Check if there is already saved data in local storage. If not, auto-populate.
        const savedData = localStorage.getItem('skill-wallet-resume')
        if (!savedData) {
          const nextResume: ResumeData = {
            fullName: profile?.profile?.displayName || user.displayName || userName || '',
            username: profile?.profile?.username || userName || '',
            phone: '',
            email: profile?.profile?.email || user.email || '',
            title: profile?.profile?.title || 'Software Developer',
            bio: profile?.profile?.bio || '',
            location: profile?.profile?.location || '',
            linkedinUrl: profile?.profile?.linkedinUrl || '',
            githubUsername: profile?.github?.login || '',
            projects: autoProjects
          }

          setResume(nextResume)
          localStorage.setItem('skill-wallet-resume', JSON.stringify({ resume: nextResume, template: selectedTemplate, refinementsSummary: [] }))
        }
      } catch (err) {
        console.error('Failed to auto-populate resume:', err)
      } finally {
        setIsSyncing(false)
      }
    }

    initResume()
  }, [user])

  const allSkillNames = skills.filter(s => s.verified).map(s => s.name)

  const saveResumeAndTemplate = (r: ResumeData, t: TemplateId, refinements: string[] = refinementsSummary) => {
    setResume(r)
    setSelectedTemplate(t)
    setRefinementsSummary(refinements)
    localStorage.setItem('skill-wallet-resume', JSON.stringify({ resume: r, template: t, refinementsSummary: refinements }))
  }

  const handleTemplateChange = (templateId: TemplateId) => {
    setSelectedTemplate(templateId)
    localStorage.setItem('skill-wallet-resume', JSON.stringify({ resume, template: templateId, refinementsSummary }))
  }

  const handlePrint = () => {
    const html = generateResumeHtml(selectedTemplate, resume, allSkillNames)
    const w = window.open('', '_blank', 'width=800,height=1100')
    if (!w) return
    w.document.write(html)
    w.document.close()
    w.onload = () => w.print()
  }

  // AI Arrangement handler
  const handleAIArrange = async () => {
    if (!aiPrompt.trim()) return
    setIsAIArranging(true)
    setAiError(null)
    try {
      const response = await fetchAPI('/ai/arrange-cv', {
        method: 'POST',
        body: JSON.stringify({
          resume,
          skills: allSkillNames,
          prompt: aiPrompt
        })
      })

      if (response.success && response.data) {
        const data = response.data
        const updatedResume: ResumeData = {
          fullName: data.fullName || resume.fullName,
          username: data.githubUsername || resume.username,
          phone: data.phone || resume.phone,
          email: data.email || resume.email,
          title: data.title || resume.title,
          bio: data.bio || resume.bio,
          location: data.location || resume.location,
          linkedinUrl: data.linkedinUrl || resume.linkedinUrl,
          githubUsername: data.githubUsername || resume.githubUsername,
          projects: data.projects || resume.projects
        }
        
        const recommendedTemplate = data.recommendedTemplate as TemplateId
        const refinements = data.refinementsSummary || []
        
        saveResumeAndTemplate(updatedResume, recommendedTemplate || selectedTemplate, refinements)
        setAiPrompt('')
      } else {
        throw new Error(response.error || 'Failed to arrange CV')
      }
    } catch (err: any) {
      console.error(err)
      setAiError(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อระบบ AI')
    } finally {
      setIsAIArranging(false)
    }
  }

  // Manual Edit Handlers
  const handlePersonalChange = (key: keyof ResumeData, value: string) => {
    const updated = { ...resume, [key]: value }
    saveResumeAndTemplate(updated, selectedTemplate)
  }

  const handleProjectChange = (idx: number, key: 'name' | 'date', value: string) => {
    const nextProjects = [...resume.projects]
    nextProjects[idx] = { ...nextProjects[idx], [key]: value }
    const updated = { ...resume, projects: nextProjects }
    saveResumeAndTemplate(updated, selectedTemplate)
  }

  const handleProjectDetailChange = (pIdx: number, dIdx: number, value: string) => {
    const nextProjects = [...resume.projects]
    const nextDetails = [...nextProjects[pIdx].details]
    nextDetails[dIdx] = value
    nextProjects[pIdx] = { ...nextProjects[pIdx], details: nextDetails }
    const updated = { ...resume, projects: nextProjects }
    saveResumeAndTemplate(updated, selectedTemplate)
  }

  const handleAddProjectDetail = (pIdx: number) => {
    const nextProjects = [...resume.projects]
    nextProjects[pIdx] = { 
      ...nextProjects[pIdx], 
      details: [...nextProjects[pIdx].details, ''] 
    }
    const updated = { ...resume, projects: nextProjects }
    saveResumeAndTemplate(updated, selectedTemplate)
  }

  const handleRemoveProjectDetail = (pIdx: number, dIdx: number) => {
    const nextProjects = [...resume.projects]
    const nextDetails = nextProjects[pIdx].details.filter((_, idx) => idx !== dIdx)
    nextProjects[pIdx] = { ...nextProjects[pIdx], details: nextDetails }
    const updated = { ...resume, projects: nextProjects }
    saveResumeAndTemplate(updated, selectedTemplate)
  }

  const handleAddProject = () => {
    const nextProjects = [
      ...resume.projects,
      { name: 'New Project', date: '2026', details: ['Developed features using modern stack.'] }
    ]
    const updated = { ...resume, projects: nextProjects }
    saveResumeAndTemplate(updated, selectedTemplate)
  }

  const handleRemoveProject = (idx: number) => {
    const nextProjects = resume.projects.filter((_, pIdx) => pIdx !== idx)
    const updated = { ...resume, projects: nextProjects }
    saveResumeAndTemplate(updated, selectedTemplate)
  }

  return (
    <div className="glass-panel p-8 rounded-3xl animate-in fade-in duration-500 flex flex-col min-h-[600px]">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-[var(--border)] pb-5">
        <div>
          <h3 className="text-xl font-bold text-[var(--text)] flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
            AI-Powered CV Builder & Export
          </h3>
          <p className="text-xs text-[var(--muted)]">จัดหน้าและปรับปรุงเรซูเม่ด้วยพลังแห่ง AI หรือแก้ไขด้วยตัวคุณเองเพื่อพิมพ์เป็นกระดาษ A4/PDF ทันที</p>
        </div>
        <div className="mt-2 md:mt-0 flex gap-3">
          <button
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 bg-[var(--surface2)] hover:bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] rounded-xl hover:scale-[1.02] active:scale-95 cursor-pointer transition-all"
          >
            <Eye size={14} />
            ดูตัวอย่างเรซูเม่
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-900/20 hover:scale-[1.02] active:scale-95 cursor-pointer transition-all"
          >
            <Download size={14} />
            ดาวน์โหลด PDF / พิมพ์
          </button>
        </div>
      </div>

      {isSyncing ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-xs text-[var(--muted)]">กำลังดึงข้อมูลล่าสุดจากโปรไฟล์และ GitHub เพื่อเตรียมเอกสาร...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: AI Assistant & Template Selector */}
          <div className="space-y-6">
            
            {/* AI CV Assistant Panel */}
            <div className="bg-indigo-900/10 border border-indigo-500/20 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                  AI CV Assistant (ผู้ช่วย AI จัดหน้า)
                </h4>
              </div>
              <p className="text-[10px] text-[var(--muted)] leading-relaxed">
                พิมพ์เป้าหมายของคุณเพื่อให้ AI ช่วยเกลาเรซูเม่ เขียนรายละเอียดโปรเจกต์แปลเป็นภาษาอังกฤษ หรือจัดวางให้สะดุดตา
              </p>
              
              {/* Text Area */}
              <div className="space-y-2">
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="ตัวอย่าง: 'ปรับแต่งเรซูเม่ของฉันสำหรับสมัครงาน Senior Frontend Developer ในบริษัทระดับอินเตอร์ แปลภาษาเป็นอังกฤษ และเลือกแม่แบบที่เหมาะสม'"
                  className="w-full h-20 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3 text-xs text-[var(--text)] placeholder-slate-600 outline-none focus:border-indigo-500 transition-colors resize-none"
                  disabled={isAIArranging}
                />
                
                {/* Suggestions */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {QUICK_PROMPTS.map((p) => (
                    <button
                      key={p.label}
                      onClick={() => setAiPrompt(p.prompt)}
                      className="text-[9px] px-2 py-1 rounded-lg border border-[var(--border)] bg-[var(--surface2)]/50 hover:bg-[var(--surface2)] text-[var(--text)] transition-colors cursor-pointer"
                      disabled={isAIArranging}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {aiError && (
                <p className="text-[10px] text-red-400 bg-red-900/15 border border-red-500/10 p-2 rounded-lg">
                  {aiError}
                </p>
              )}

              {/* Action Button */}
              <button
                onClick={handleAIArrange}
                disabled={isAIArranging || !aiPrompt.trim()}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                  isAIArranging 
                    ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white cursor-pointer active:scale-98 hover:scale-[1.01]'
                }`}
              >
                {isAIArranging ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    กำลังจัดรูปแบบด้วย AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    AI จัดหน้าและเกลาเรซูเม่
                  </>
                )}
              </button>

              {/* Refinement Logs */}
              {refinementsSummary.length > 0 && (
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3 space-y-1.5">
                  <p className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    รายการที่ AI ปรับปรุงล่าสุด:
                  </p>
                  <ul className="text-[9px] text-[var(--muted)] space-y-1 list-disc pl-3">
                    {refinementsSummary.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Template Selector Card */}
            <div className="bg-[var(--surface2)]/30 border border-[var(--border)] rounded-2xl p-5">
              <h4 className="text-xs font-bold text-[var(--text)] uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Award size={14} className="text-indigo-400" />
                Select Theme Style (เลือกรูปแบบเทมเพลต)
              </h4>
              <div className="grid grid-cols-1 gap-3">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleTemplateChange(t.id)}
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
          </div>

          {/* Right Column: Manual Editor & Skills */}
          <div className="space-y-6">
            {/* Manual Resume Editor (Collapsible) */}
            <div className="bg-[var(--surface2)]/30 border border-[var(--border)] rounded-2xl overflow-hidden">
              <button
                onClick={() => setIsFormOpen(!isFormOpen)}
                className="w-full px-5 py-4 flex justify-between items-center bg-[var(--surface2)]/40 hover:bg-[var(--surface2)]/70 transition-colors cursor-pointer"
              >
                <span className="text-xs font-bold text-[var(--text)] uppercase tracking-wider flex items-center gap-2">
                  <User size={14} className="text-indigo-400" />
                  แก้ไขเรซูเม่ด้วยตนเอง (Manual Editor)
                </span>
                {isFormOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {isFormOpen && (
                <div className="p-5 border-t border-[var(--border)]/40 space-y-5 animate-in slide-in-from-top-2 duration-300">
                  {/* Personal details grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput 
                      label="Full Name" 
                      icon={<User size={12} />} 
                      value={resume.fullName} 
                      onChange={(v) => handlePersonalChange('fullName', v)} 
                      placeholder="สมชาย แซ่ตั้ง"
                    />
                    <FormInput 
                      label="Professional Title" 
                      icon={<Briefcase size={12} />} 
                      value={resume.title} 
                      onChange={(v) => handlePersonalChange('title', v)} 
                      placeholder="Senior Fullstack Developer"
                    />
                    <FormInput 
                      label="Email" 
                      icon={<Mail size={12} />} 
                      value={resume.email} 
                      onChange={(v) => handlePersonalChange('email', v)} 
                      placeholder="somchai@gmail.com"
                    />
                    <FormInput 
                      label="Phone" 
                      icon={<Phone size={12} />} 
                      value={resume.phone} 
                      onChange={(v) => handlePersonalChange('phone', v)} 
                      placeholder="081-234-5678"
                    />
                    <FormInput 
                      label="Location" 
                      icon={<MapPin size={12} />} 
                      value={resume.location || ''} 
                      onChange={(v) => handlePersonalChange('location', v)} 
                      placeholder="Bangkok, Thailand"
                    />
                    <FormInput 
                      label="LinkedIn URL" 
                      icon={<Linkedin size={12} />} 
                      value={resume.linkedinUrl || ''} 
                      onChange={(v) => handlePersonalChange('linkedinUrl', v)} 
                      placeholder="linkedin.com/in/somchai"
                    />
                    <div className="md:col-span-2">
                      <FormInput 
                        label="GitHub Username" 
                        icon={<Github size={12} />} 
                        value={resume.githubUsername || ''} 
                        onChange={(v) => handlePersonalChange('githubUsername', v)} 
                        placeholder="somchaidev"
                      />
                    </div>
                  </div>

                  {/* Bio Description */}
                  <div>
                    <label className="text-[10px] text-[var(--muted)] uppercase tracking-wider font-bold mb-1.5 flex items-center gap-1 block">
                      <FileText size={12} />
                      About Me (ประวัติย่อ)
                    </label>
                    <textarea
                      value={resume.bio || ''}
                      onChange={(e) => handlePersonalChange('bio', e.target.value)}
                      placeholder="เขียนสรุปประสบการณ์ ทักษะหลัก หรือเป้าหมายในการทำงาน..."
                      className="w-full h-24 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3 text-xs text-[var(--text)] outline-none focus:border-indigo-500 transition-colors resize-y"
                    />
                  </div>

                  {/* Projects List */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-[var(--border)]/40">
                      <label className="text-[10px] text-[var(--text)] uppercase tracking-wider font-bold flex items-center gap-1">
                        <Briefcase size={12} className="text-indigo-400" />
                        Featured Projects ({resume.projects.length})
                      </label>
                      <button
                        onClick={handleAddProject}
                        className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-0.5 cursor-pointer"
                      >
                        <Plus size={10} />
                        เพิ่มโปรเจกต์
                      </button>
                    </div>

                    <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1 no-scrollbar">
                      {resume.projects.map((p, pIdx) => (
                        <div key={pIdx} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 space-y-3 relative group">
                          
                          <button
                            onClick={() => handleRemoveProject(pIdx)}
                            className="absolute top-3 right-3 text-red-500 hover:text-red-400 p-1 rounded-lg bg-red-950/20 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            title="ลบโปรเจกต์"
                          >
                            <Trash2 size={12} />
                          </button>

                          <div className="grid grid-cols-3 gap-2">
                            <div className="col-span-2">
                              <input
                                value={p.name}
                                onChange={(e) => handleProjectChange(pIdx, 'name', e.target.value)}
                                className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--text)] outline-none focus:border-indigo-500"
                                placeholder="ชื่อโครงการ"
                              />
                            </div>
                            <div>
                              <input
                                value={p.date}
                                onChange={(e) => handleProjectChange(pIdx, 'date', e.target.value)}
                                className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--text)] outline-none focus:border-indigo-500 font-mono"
                                placeholder="ปี (เช่น 2026)"
                              />
                            </div>
                          </div>

                          {/* Bullet details */}
                          <div className="space-y-2 pl-2">
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] font-bold text-[var(--muted)]">Bullet Descriptions (รายละเอียดงาน)</span>
                              <button
                                onClick={() => handleAddProjectDetail(pIdx)}
                                className="text-[9px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-0.5 cursor-pointer"
                              >
                                <Plus size={9} />
                                เพิ่มรายละเอียด
                              </button>
                            </div>
                            
                            {p.details.map((d, dIdx) => (
                              <div key={dIdx} className="flex gap-2 items-center">
                                <span className="text-slate-400 text-xs">•</span>
                                <input
                                  value={d}
                                  onChange={(e) => handleProjectDetailChange(pIdx, dIdx, e.target.value)}
                                  className="flex-1 bg-[var(--surface2)] border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-[11px] text-[var(--text)] outline-none focus:border-indigo-500"
                                  placeholder="เช่น พัฒนาหน้าจอ Dashboard ด้วย Next.js และ Tailwind"
                                />
                                {p.details.length > 1 && (
                                  <button
                                    onClick={() => handleRemoveProjectDetail(pIdx, dIdx)}
                                    className="text-red-500 hover:text-red-400 p-1 cursor-pointer"
                                  >
                                    <Trash2 size={10} />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Technical Skills Card */}
            <div className="bg-[var(--surface2)]/30 border border-[var(--border)] rounded-2xl p-5">
              <h4 className="text-xs font-bold text-[var(--text)] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Code size={14} className="text-indigo-400" />
                Verified Skills Included (ทักษะที่ได้รับการรับรอง)
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {allSkillNames.length === 0 ? (
                  <p className="text-xs text-[var(--muted)] italic">ไม่มีทักษะที่ยืนยัน (แสดงเฉพาะ Verified Skills)</p>
                ) : (
                  allSkillNames.map(s => (
                    <span key={s} className="text-[10px] px-2.5 py-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] font-medium">
                      {s}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. Preview Modal (A4 Preview Overlay) ── */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-[var(--border)] flex justify-between items-center bg-[var(--surface2)]/40">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-indigo-400" />
                <h4 className="font-bold text-sm text-[var(--text)] uppercase tracking-wider">
                  Live Resume Mockup (A4 Preview)
                </h4>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg cursor-pointer transition-all shadow-md"
                >
                  <Download size={12} />
                  พิมพ์เอกสาร / PDF
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-slate-400 hover:text-[var(--text)] p-1.5 rounded-lg bg-[var(--surface2)] hover:bg-[var(--surface2)]/80 transition-colors cursor-pointer text-sm font-bold"
                >
                  ✕
                </button>
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 bg-[var(--surface2)]/15 flex justify-center items-start">
              <div className="w-full max-w-[500px]">
                <div className="w-full aspect-[1/1.414] bg-white border border-slate-300 dark:border-slate-800 rounded-2xl shadow-xl overflow-y-auto no-scrollbar p-8 text-slate-800 flex flex-col justify-between select-none">
                  <div>
                    {/* Header Mockup */}
                    {selectedTemplate === 'bold' ? (
                      <div className="bg-amber-500 -mx-8 -mt-8 p-6 text-slate-900 mb-5">
                        <h2 className="text-xl font-bold uppercase tracking-wide truncate">{resume.fullName || 'YOUR NAME'}</h2>
                        <p className="text-xs font-semibold opacity-90 truncate">{resume.title}</p>
                        <p className="text-[10px] opacity-75 mt-1.5">
                          {[
                            resume.email, 
                            resume.phone, 
                            resume.location,
                            resume.githubUsername && `github.com/${resume.githubUsername}`,
                            resume.linkedinUrl && `linkedin.com/in/${resume.linkedinUrl.replace(/https?:\/\/(www\.)?linkedin\.com\/in\//, '')}`
                          ].filter(Boolean).join('  ·  ')}
                        </p>
                      </div>
                    ) : selectedTemplate === 'royal' ? (
                      <div className="bg-[#0f172a] -mx-8 -mt-8 p-6 text-amber-400 mb-5 text-center">
                        <h2 className="text-xl font-bold uppercase tracking-wide truncate">{resume.fullName || 'YOUR NAME'}</h2>
                        <p className="text-xs font-semibold text-slate-300 truncate">{resume.title}</p>
                        <p className="text-[10px] text-slate-400 mt-1.5">
                          {[
                            resume.email, 
                            resume.phone, 
                            resume.location,
                            resume.githubUsername && `github.com/${resume.githubUsername}`,
                            resume.linkedinUrl && `linkedin.com/in/${resume.linkedinUrl.replace(/https?:\/\/(www\.)?linkedin\.com\/in\//, '')}`
                          ].filter(Boolean).join('  ·  ')}
                        </p>
                      </div>
                    ) : (
                      <div className={`mb-5 pb-3 border-b border-slate-200 ${selectedTemplate === 'classic' ? 'text-center' : 'text-left'}`}>
                        <h2 className="text-xl font-bold uppercase tracking-tight text-slate-900">{resume.fullName || 'YOUR NAME'}</h2>
                        <p className="text-xs text-slate-500 font-medium">{resume.title}</p>
                        <p className="text-[10px] text-slate-400 mt-1.5">
                          {[
                            resume.email, 
                            resume.phone, 
                            resume.location,
                            resume.githubUsername && `github.com/${resume.githubUsername}`,
                            resume.linkedinUrl && `linkedin.com/in/${resume.linkedinUrl.replace(/https?:\/\/(www\.)?linkedin\.com\/in\//, '')}`
                          ].filter(Boolean).join('  ·  ')}
                        </p>
                      </div>
                    )}

                    {/* Layout Body Mockup */}
                    <div className="flex gap-5">
                      {/* Left Column (Sidebar) for Modern layout */}
                      {selectedTemplate === 'modern' && (
                        <div className="w-[32%] bg-purple-50 p-2.5 rounded-lg space-y-4 shrink-0 text-left">
                          <div>
                            <p className="text-[10px] text-purple-700 font-bold uppercase tracking-wider mb-1.5">Contact</p>
                            <div className="text-[8px] text-slate-600 space-y-1 font-medium break-all">
                              {resume.email && <p>✉️ {resume.email}</p>}
                              {resume.phone && <p>📞 {resume.phone}</p>}
                              {resume.location && <p>📍 {resume.location}</p>}
                              {resume.githubUsername && <p>🐙 github.com/{resume.githubUsername}</p>}
                              {resume.linkedinUrl && <p>💼 {resume.linkedinUrl.replace(/https?:\/\/(www\.)?linkedin\.com\/in\//, '')}</p>}
                            </div>
                          </div>
                          <div>
                            <p className="text-[10px] text-purple-700 font-bold uppercase tracking-wider mb-1.5">Skills</p>
                            <div className="space-y-1">
                              {allSkillNames.slice(0, 8).map(s => (
                                <p key={s} className="text-[10px] text-slate-600 font-medium">• {s}</p>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Main Column */}
                      <div className="flex-1 space-y-4 text-left">
                        {/* About Me */}
                        {resume.bio && (
                          <div>
                            <h3 className={`text-[10px] font-bold uppercase tracking-wider mb-1.5 ${selectedTemplate === 'modern' ? 'text-purple-600' :
                              selectedTemplate === 'minimal' ? 'text-emerald-600' :
                                selectedTemplate === 'royal' ? 'text-[#0f172a] border-b border-amber-500/20 pb-0.5' :
                                  'text-slate-900'
                            }`}>About Me</h3>
                            <p className="text-[10px] text-slate-600 leading-relaxed whitespace-pre-line">{resume.bio}</p>
                          </div>
                        )}

                        {/* Projects */}
                        {resume.projects.length > 0 && (
                          <div>
                            <h3 className={`text-[10px] font-bold uppercase tracking-wider mb-1.5 ${selectedTemplate === 'modern' ? 'text-purple-600' :
                              selectedTemplate === 'minimal' ? 'text-emerald-600' :
                                selectedTemplate === 'royal' ? 'text-[#0f172a] border-b border-amber-500/20 pb-0.5' :
                                  'text-slate-900'
                            }`}>Featured Projects</h3>
                            <div className="space-y-2">
                              {resume.projects.slice(0, 3).map((p, pIdx) => (
                                <div key={pIdx}>
                                  <div className="flex justify-between text-[10px] font-bold text-slate-800">
                                    <span>"{p.name}"</span>
                                    <span className="font-mono text-slate-400 font-normal">{p.date}</span>
                                  </div>
                                  <div className="space-y-0.5 mt-0.5">
                                    {p.details.map((d, dIdx) => (
                                      <p key={dIdx} className="text-[9px] text-slate-500 leading-relaxed">• {d}</p>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Skills for non-sidebar templates */}
                        {selectedTemplate !== 'modern' && allSkillNames.length > 0 && (
                          <div>
                            <h3 className={`text-[10px] font-bold uppercase tracking-wider mb-1.5 ${selectedTemplate === 'minimal' ? 'text-emerald-600' :
                              selectedTemplate === 'royal' ? 'text-[#0f172a] border-b border-amber-500/20 pb-0.5' :
                                'text-slate-900'
                            }`}>Technical Skills</h3>
                            <p className="text-[10px] text-slate-600 leading-relaxed">
                              {allSkillNames.map(s => `• ${s}`).join('   ')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Footer Mockup */}
                  <p className="text-[9px] text-slate-400 text-center border-t border-slate-100 pt-2">
                    Skill Wallet Resume · Dynamic Verification
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
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
        className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-3.5 py-2 text-xs text-[var(--text)] placeholder-slate-600 outline-none focus:border-indigo-500 transition-colors"
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
  const contactLine = [
    r.email && `Email: ${r.email}`, 
    r.phone && `Phone: ${r.phone}`,
    r.location && `Location: ${r.location}`,
    r.githubUsername && `GitHub: github.com/${r.githubUsername}`,
    r.linkedinUrl && `LinkedIn: linkedin.com/in/${r.linkedinUrl.replace(/https?:\/\/(www\.)?linkedin\.com\/in\//, '')}`
  ].filter(Boolean).join('  |  ')

  const projHtml = r.projects.filter(p => p.name).map(p => `
    <div style="display:flex;justify-content:space-between;margin-bottom:2px;font-size:11px;"><strong>"${p.name}"</strong><span>${p.date}</span></div>
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
    <p style="font-size:11px;color:#555;font-weight:500;margin-bottom:2px;">${r.title}</p>
    ${contactLine ? `<p style="font-size:11px;color:#555;">${contactLine}</p>` : ''}
  </div>
  ${r.bio ? `
    <h2 style="${headingStyle}">About Me</h2>
    <div style="margin-bottom:12px;font-size:11px;white-space:pre-line;">${r.bio}</div>
  ` : ''}
  ${projHtml ? `<h2 style="${headingStyle}">Featured Projects</h2>${projHtml}` : ''}
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
    <p style="font-size:11px;opacity:0.8;margin-bottom:12px;">${r.title}</p>
    
    <div style="font-size:10px;opacity:0.85;margin-bottom:20px;line-height:1.6;">
      ${r.email ? `<p>✉️ ${r.email}</p>` : ''}
      ${r.phone ? `<p>📞 ${r.phone}</p>` : ''}
      ${r.location ? `<p>📍 ${r.location}</p>` : ''}
      ${r.githubUsername ? `<p>🐙 github.com/${r.githubUsername}</p>` : ''}
      ${r.linkedinUrl ? `<p>💼 ${r.linkedinUrl.replace(/https?:\/\/(www\.)?linkedin\.com\/in\//, '')}</p>` : ''}
    </div>

    <h3 style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2px;border-bottom:1px solid rgba(255,255,255,0.3);padding-bottom:4px;margin:20px 0 8px;">Skills</h3>
    ${allSkills.map(s => `<p style="font-size:11px;margin-bottom:3px;">• ${s}</p>`).join('')}
  </div>
  <div style="flex:1;padding:32px 28px;">
    ${r.bio ? `
      <h2 style="color:#8b5cf6;border-bottom:2px solid #8b5cf6;padding-bottom:4px;margin-top:14px;margin-bottom:6px;">About Me</h2>
      <div style="font-size:11px;color:#333;margin-bottom:12px;white-space:pre-line;line-height:1.6;">${r.bio}</div>
    ` : ''}
    ${projHtml ? `<h2 style="color:#8b5cf6;border-bottom:2px solid #8b5cf6;padding-top:14px;margin-top:14px;">Featured Projects</h2>${projHtml}` : ''}
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
    ${r.bio ? `
      <h2 style="${headingStyle}">About Me</h2>
      <div style="font-size:11px;color:#334155;margin-bottom:12px;white-space:pre-line;line-height:1.6;">${r.bio}</div>
    ` : ''}
    ${projHtml ? `<h2 style="${headingStyle}">Featured Projects</h2>${projHtml}` : ''}
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
    <p style="font-size:14px;font-weight:600;">${r.title}</p>
    ${contactLine ? `<p style="font-size:11px;margin-top:4px;">${contactLine}</p>` : ''}
  </div>
  <div style="padding:28px 40px;">
    ${r.bio ? `
      <h2 style="color:#f59e0b;font-weight:800;text-transform:uppercase;letter-spacing:2px;border-bottom:2px solid #f59e0b;padding-bottom:4px;margin-top:18px;margin-bottom:8px;">About Me</h2>
      <div style="font-size:11px;color:#444;margin-bottom:12px;white-space:pre-line;line-height:1.6;">${r.bio}</div>
    ` : ''}
    ${projHtml ? `<h2 style="color:#f59e0b;font-weight:800;text-transform:uppercase;letter-spacing:2px;border-bottom:2px solid #f59e0b;padding-bottom:4px;margin-top:18px;">Featured Projects</h2>${projHtml}` : ''}
    <h2 style="color:#f59e0b;font-weight:800;text-transform:uppercase;letter-spacing:2px;border-bottom:2px solid #f59e0b;padding-bottom:4px;margin-top:18px;">Technical Skills</h2>
    <div style="margin-bottom:12px;">${skillsHtml}</div>
    <p style="font-size:9px;color:#aaa;margin-top:40px;text-align:center;">Skill Wallet · ${now}</p>
  </div>
</div>${end}`
}
