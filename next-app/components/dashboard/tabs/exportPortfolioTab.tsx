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
  ChevronUp,
  Layout,
  Wand2,
  Edit3,
  Check,
  ArrowRight,
  Clock
} from 'lucide-react'

interface WidgetExportTabProps {
  userName?: string
  skills?: Array<{ name: string; verified?: boolean; level?: number;[key: string]: any }>
}

const TEMPLATES = [
  { id: 'classic', name: 'Classic Minimalist', accent: '#1e293b', desc: 'Clean single column standard resume' },
  { id: 'modern', name: 'Modern Sidebar', accent: '#8b5cf6', desc: 'Elegant two-column layout with sidebar' },
  { id: 'minimal', name: 'Emerald Sleek', accent: '#10b981', desc: 'Ultra-clean layout with fresh accents' },
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

  // Workflow step state: 'loading' -> 'template' -> 'details' -> 'preview' -> 'export'
  const [currentStep, setCurrentStep] = useState<'template' | 'details' | 'preview' | 'export'>('template')

  // AI states
  const [aiPrompt, setAiPrompt] = useState('')
  const [isAIArranging, setIsAIArranging] = useState(false)
  const [refinementsSummary, setRefinementsSummary] = useState<string[]>([])
  const [aiError, setAiError] = useState<string | null>(null)

  // Editor states
  const [isEditing, setIsEditing] = useState(false)
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
    <div className="glass-panel p-6 md:p-8 rounded-3xl animate-in fade-in duration-500 flex flex-col min-h-[600px] border border-[var(--border)]/80 shadow-lg bg-[var(--surface)]/40 backdrop-blur-md">
      
      {/* ─── Loading State ─── */}
      {isSyncing ? (
        <div className="flex-1 flex flex-col items-center justify-center py-24 gap-4">
          <div className="relative w-16 h-16">
            <RefreshCw className="w-full h-full text-indigo-500 animate-spin" />
          </div>
          <p className="text-sm text-[var(--muted)]">เตรียมเอกสารของคุณ...</p>
        </div>
      ) : (
        <>
          {/* ─── Step Progress Bar ─── */}
          <div className="mb-8">
            <div className="flex items-center gap-2 md:gap-4">
              {[
                { id: 'template', label: 'Template', icon: Layout },
                { id: 'details', label: 'Details', icon: Edit3 },
                { id: 'preview', label: 'Preview', icon: Eye },
                { id: 'export', label: 'Export', icon: Download }
              ].map((step, idx, arr) => (
                <div key={step.id} className="flex-1 flex items-center gap-2">
                  <button
                    onClick={() => setCurrentStep(step.id as any)}
                    className={`relative flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      step.id === currentStep
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/50 scale-110'
                        : (currentStep === 'export' || ['template', 'details', 'preview'].includes(currentStep) && (step.id === 'template' || step.id === 'details' || (step.id === 'preview' && currentStep !== 'template')))
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-[var(--surface2)] text-[var(--muted)] border border-[var(--border)]'
                    }`}
                  >
                    <step.icon className="w-5 h-5" />
                  </button>
                  
                  {idx < arr.length - 1 && (
                    <div className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                      step.id === currentStep || (['template', 'details', 'preview'].includes(currentStep) && step.id !== 'export')
                        ? 'bg-indigo-600'
                        : 'bg-[var(--surface2)]'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-[var(--muted)] mt-3 font-medium">
              Step {['template', 'details', 'preview', 'export'].indexOf(currentStep) + 1} of 4 · {
                currentStep === 'template' ? 'เลือกแม่แบบเรซูเม่' :
                currentStep === 'details' ? 'ปรับรายละเอียด' :
                currentStep === 'preview' ? 'ตรวจสอบเอกสาร' :
                'ดาวน์โหลดเอกสาร'
              }
            </p>
          </div>

          {/* ─── Step 1: Template Selection ─── */}
          {currentStep === 'template' && (
            <div className="space-y-6 animate-in fade-in duration-300 flex-1">
              <div>
                <h3 className="text-lg font-bold text-[var(--text)] flex items-center gap-2 mb-2">
                  <Layout className="w-5 h-5 text-indigo-500" />
                  เลือกแม่แบบเรซูเม่
                </h3>
                <p className="text-xs text-[var(--muted)]">เลือกสไตล์ที่ชอบใจมากที่สุด</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Left Column: Templates + AI */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Template Grid */}
                  <div>
                    <div className="grid grid-cols-3 gap-4">
                      {TEMPLATES.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => {
                            setSelectedTemplate(t.id)
                            localStorage.setItem('skill-wallet-resume', JSON.stringify({ resume, template: t.id, refinementsSummary }))
                          }}
                          className={`relative group overflow-hidden rounded-2xl border-2 transition-all duration-300 p-4 text-left hover:scale-105 ${
                            selectedTemplate === t.id
                              ? 'border-indigo-500 bg-indigo-500/[0.08] shadow-lg shadow-indigo-500/20'
                              : 'border-[var(--border)] bg-[var(--surface2)]/50 hover:border-indigo-500/50'
                          }`}
                        >
                          {selectedTemplate === t.id && (
                            <div className="absolute top-2 right-2 bg-indigo-600 rounded-full p-1">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-bold text-[var(--text)]">{t.name}</h4>
                            <div 
                              className="w-3 h-3 rounded-full border border-white/20" 
                              style={{ backgroundColor: t.accent }}
                            />
                          </div>
                          <p className="text-xs text-[var(--muted)] line-clamp-2">{t.desc}</p>

                          {/* Accent Color Indicator */}
                          <div className="mt-3 h-1 rounded-full" style={{ backgroundColor: t.accent, opacity: 0.3 }} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* AI Assistant Section */}
                  <div className="bg-gradient-to-br from-indigo-950/20 to-purple-950/10 border border-indigo-500/20 rounded-2xl p-5 space-y-4">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-indigo-400" />
                        <h4 className="text-sm font-bold text-[var(--text)]">AI Template Assistant</h4>
                      </div>
                      
                      <textarea
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="บอก AI ว่าคุณต้องการอะไร เช่น 'ปรับแต่งให้เหมาะกับงาน Frontend Developer'"
                        className="w-full h-20 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3 text-xs text-[var(--text)] outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 resize-none"
                        disabled={isAIArranging}
                      />

                      {aiError && (
                        <p className="text-xs text-red-400 bg-red-900/15 border border-red-500/10 p-2.5 rounded-lg">
                          {aiError}
                        </p>
                      )}

                      <button
                        onClick={handleAIArrange}
                        disabled={isAIArranging || !aiPrompt.trim()}
                        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          isAIArranging
                            ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white cursor-pointer active:scale-95'
                        }`}
                      >
                        {isAIArranging ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            ให้ AI จัดแต่ง...
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-4 h-4" />
                            ให้ AI ช่วยจัดแต่ง
                          </>
                        )}
                      </button>

                      {refinementsSummary.length > 0 && (
                        <div className="bg-emerald-900/15 border border-emerald-500/20 rounded-lg p-3 space-y-1.5">
                          <p className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            ปรับแต่งแล้ว:
                          </p>
                          <ul className="text-[11px] text-[var(--muted)] space-y-1">
                            {refinementsSummary.map((item, idx) => (
                              <li key={idx} className="flex gap-2 items-start">
                                <span className="text-emerald-400 shrink-0">✓</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                </div>

                {/* Right Column: Live Preview */}
                <div className="sticky top-20">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold text-[var(--text)] uppercase tracking-wide flex items-center gap-2">
                      <Eye className="w-4 h-4 text-indigo-400" />
                      Live Preview
                    </p>
                    <span className="text-[10px] px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 font-semibold border border-indigo-500/20">
                      {TEMPLATES.find(t => t.id === selectedTemplate)?.name}
                    </span>
                  </div>

                  {/* Preview Card */}
                  <div className="bg-slate-900/20 border border-[var(--border)] rounded-2xl p-4 flex justify-center">
                    <div className="w-full aspect-[1/1.414] bg-white rounded-lg shadow-xl overflow-hidden text-slate-800 p-6 text-sm flex flex-col justify-between select-none max-w-xs">
                      {/* Header */}
                      <div className={`mb-4 pb-3 border-b ${selectedTemplate === 'classic' ? 'text-center' : 'text-left'}`}>
                        <h2 className="font-bold text-base">{resume.fullName || 'Your Name'}</h2>
                        <p className="text-xs text-slate-500">{resume.title || 'Professional Title'}</p>
                      </div>

                      {/* Body */}
                      <div className="space-y-3 text-xs flex-1">
                        {resume.bio ? (
                          <p className="line-clamp-3 text-slate-600 leading-relaxed">{resume.bio}</p>
                        ) : (
                          <p className="text-slate-400 italic">Your bio will appear here...</p>
                        )}
                        
                        {resume.projects.length > 0 && (
                          <div>
                            <p className="font-bold text-slate-700 text-[11px]">Featured Projects:</p>
                            {resume.projects.slice(0, 2).map((p, idx) => (
                              <p key={idx} className="text-[10px] text-slate-600">• {p.name || 'Project name'}</p>
                            ))}
                          </div>
                        )}
                        
                        {allSkillNames.length > 0 && (
                          <p className="text-[10px] text-slate-600">
                            <span className="font-bold">Skills: </span>
                            {allSkillNames.slice(0, 4).join(', ')}...
                          </p>
                        )}
                      </div>

                      {/* Footer */}
                      <p className="text-[8px] text-slate-400 text-center pt-2 border-t">Skill Wallet Resume</p>
                    </div>
                  </div>

                  <p className="text-[10px] text-[var(--muted)] mt-3 text-center italic">
                    สไตล์ {TEMPLATES.find(t => t.id === selectedTemplate)?.name} - {TEMPLATES.find(t => t.id === selectedTemplate)?.desc}
                  </p>
                </div>
              </div>

              {/* Next Button */}
              <button
                onClick={() => setCurrentStep('details')}
                className="w-full md:w-auto md:ml-auto flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-indigo-600/30"
              >
                ต่อไป
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ─── Step 2: Details Editor ─── */}
          {currentStep === 'details' && (
            <div className="space-y-6 animate-in fade-in duration-300 flex-1 overflow-y-auto max-h-[calc(100vh-400px)]">
              <div>
                <h3 className="text-lg font-bold text-[var(--text)] flex items-center gap-2 mb-2">
                  <Edit3 className="w-5 h-5 text-indigo-500" />
                  แก้ไขรายละเอียด
                </h3>
                <p className="text-xs text-[var(--muted)]">ปรับรายละเอียดของคุณให้เรียบร้อย</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput 
                  label="Full Name" 
                  icon={<User size={14} />} 
                  value={resume.fullName} 
                  onChange={(v) => {
                    const updated = { ...resume, fullName: v }
                    saveResumeAndTemplate(updated, selectedTemplate)
                  }} 
                  placeholder="ชื่อเต็ม"
                />
                <FormInput 
                  label="Professional Title" 
                  icon={<Briefcase size={14} />} 
                  value={resume.title} 
                  onChange={(v) => {
                    const updated = { ...resume, title: v }
                    saveResumeAndTemplate(updated, selectedTemplate)
                  }} 
                  placeholder="Senior Developer"
                />
                <FormInput 
                  label="Email" 
                  icon={<Mail size={14} />} 
                  value={resume.email} 
                  onChange={(v) => {
                    const updated = { ...resume, email: v }
                    saveResumeAndTemplate(updated, selectedTemplate)
                  }} 
                  placeholder="your@email.com"
                />
                <FormInput 
                  label="Phone" 
                  icon={<Phone size={14} />} 
                  value={resume.phone} 
                  onChange={(v) => {
                    const updated = { ...resume, phone: v }
                    saveResumeAndTemplate(updated, selectedTemplate)
                  }} 
                  placeholder="081-XXX-XXXX"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--muted)] uppercase tracking-wide flex items-center gap-1.5">
                  <MapPin size={14} className="text-indigo-400" />
                  Location
                </label>
                <input
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text)] outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                  value={resume.location || ''}
                  onChange={(e) => {
                    const updated = { ...resume, location: e.target.value }
                    saveResumeAndTemplate(updated, selectedTemplate)
                  }}
                  placeholder="Bangkok, Thailand"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--muted)] uppercase tracking-wide flex items-center gap-1.5">
                  <FileText size={14} className="text-indigo-400" />
                  About Me
                </label>
                <textarea
                  value={resume.bio || ''}
                  onChange={(e) => {
                    const updated = { ...resume, bio: e.target.value }
                    saveResumeAndTemplate(updated, selectedTemplate)
                  }}
                  placeholder="บรรยายเกี่ยวกับตัวคุณ ประสบการณ์ หรือเป้าหมายของคุณ..."
                  className="w-full h-28 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 text-sm text-[var(--text)] outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 resize-y"
                />
              </div>

              {/* Skills Section */}
              <div className="space-y-3 bg-[var(--surface2)]/30 border border-[var(--border)] rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[var(--text)] uppercase tracking-wide flex items-center gap-1.5">
                    <Code size={14} className="text-emerald-400" />
                    Verified Skills
                  </label>
                  <span className="text-[11px] text-[var(--muted)] font-semibold">{allSkillNames.length} skills</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {allSkillNames.length === 0 ? (
                    <p className="text-xs text-[var(--muted)] italic">ยังไม่มีทักษะที่ยืนยัน</p>
                  ) : (
                    allSkillNames.map(s => (
                      <span key={s} className="text-xs px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 font-medium">
                        {s}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setCurrentStep('template')}
                  className="px-6 py-2.5 border border-[var(--border)] bg-[var(--surface2)] hover:bg-[var(--surface)] text-[var(--text)] font-bold rounded-xl transition-all"
                >
                  ← ย้อนกลับ
                </button>
                <button
                  onClick={() => setCurrentStep('preview')}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/30"
                >
                  ต่อไป
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ─── Step 3: Preview ─── */}
          {currentStep === 'preview' && (
            <div className="space-y-6 animate-in fade-in duration-300 flex-1 overflow-y-auto">
              <div>
                <h3 className="text-lg font-bold text-[var(--text)] flex items-center gap-2 mb-2">
                  <Eye className="w-5 h-5 text-indigo-500" />
                  ตรวจสอบเรซูเม่ของคุณ
                </h3>
                <p className="text-xs text-[var(--muted)]">ยืนยันว่าเรซูเม่มีลักษณะตามที่คุณต้องการ</p>
              </div>

              {/* Inline Preview */}
              <div className="bg-slate-900/20 border border-[var(--border)] rounded-2xl p-6 flex justify-center max-h-96 overflow-auto">
                <div className="w-full max-w-xs aspect-[1/1.414] bg-white rounded-lg shadow-xl overflow-hidden text-slate-800 p-6 text-sm flex flex-col justify-between">
                  {/* Header */}
                  <div className="text-center mb-4 pb-3 border-b">
                    <h2 className="font-bold text-base">{resume.fullName}</h2>
                    <p className="text-xs text-slate-500">{resume.title}</p>
                  </div>

                  {/* Body */}
                  <div className="space-y-3 text-xs flex-1">
                    {resume.bio && <p className="line-clamp-2">{resume.bio}</p>}
                    {resume.projects.length > 0 && (
                      <div>
                        <p className="font-bold text-slate-700 text-[11px]">Featured Projects:</p>
                        {resume.projects.slice(0, 2).map((p, idx) => (
                          <p key={idx} className="text-[10px] text-slate-600">• {p.name}</p>
                        ))}
                      </div>
                    )}
                    {allSkillNames.length > 0 && (
                      <p className="text-[10px] text-slate-600">
                        <span className="font-bold">Skills: </span>
                        {allSkillNames.slice(0, 5).join(', ')}...
                      </p>
                    )}
                  </div>

                  {/* Footer */}
                  <p className="text-[8px] text-slate-400 text-center pt-2 border-t">Skill Wallet Resume</p>
                </div>
              </div>

              {/* Quick Edit Button */}
              <button
                onClick={() => setCurrentStep('details')}
                className="w-full flex items-center justify-center gap-2 py-2.5 border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 font-bold rounded-xl hover:bg-indigo-500/15 transition-all"
              >
                <Edit3 className="w-4 h-4" />
                แก้ไขรายละเอียด
              </button>

              {/* Navigation */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setCurrentStep('details')}
                  className="px-6 py-2.5 border border-[var(--border)] bg-[var(--surface2)] hover:bg-[var(--surface)] text-[var(--text)] font-bold rounded-xl transition-all"
                >
                  ← ย้อนกลับ
                </button>
                <button
                  onClick={() => setCurrentStep('export')}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/30"
                >
                  ต่อไป
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ─── Step 4: Export Options ─── */}
          {currentStep === 'export' && (
            <div className="space-y-6 animate-in fade-in duration-300 flex-1">
              <div>
                <h3 className="text-lg font-bold text-[var(--text)] flex items-center gap-2 mb-2">
                  <Download className="w-5 h-5 text-indigo-500" />
                  ส่งออกเรซูเม่
                </h3>
                <p className="text-xs text-[var(--muted)]">เลือกรูปแบบในการดาวน์โหลด</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* PDF Export */}
                <button
                  onClick={handlePrint}
                  className="group relative overflow-hidden rounded-xl border-2 border-indigo-500/30 bg-gradient-to-br from-indigo-600/20 to-purple-600/10 p-6 hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-600/20 transition-all hover:scale-105 text-left"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-indigo-600/20 rounded-lg group-hover:bg-indigo-600/30 transition-colors">
                      <FileText className="w-6 h-6 text-indigo-400" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-indigo-400 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                  </div>
                  <h4 className="font-bold text-[var(--text)] mb-1">PDF Resume</h4>
                  <p className="text-xs text-[var(--muted)]">มาตรฐาน A4 พิมพ์หรือส่งเมล</p>
                </button>

                {/* Print */}
                <button
                  onClick={handlePrint}
                  className="group relative overflow-hidden rounded-xl border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-600/20 to-teal-600/10 p-6 hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-600/20 transition-all hover:scale-105 text-left"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-emerald-600/20 rounded-lg group-hover:bg-emerald-600/30 transition-colors">
                      <Clock className="w-6 h-6 text-emerald-400" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-emerald-400 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                  </div>
                  <h4 className="font-bold text-[var(--text)] mb-1">Print / Save as PDF</h4>
                  <p className="text-xs text-[var(--muted)]">พิมพ์จากเบราว์เซอร์โดยตรง</p>
                </button>
              </div>

              {/* Additional Features */}
              <div className="bg-[var(--surface2)]/30 border border-[var(--border)] rounded-xl p-4 space-y-3">
                <p className="text-xs font-bold text-[var(--text)] uppercase tracking-wide">Formats Coming Soon</p>
                <div className="flex flex-wrap gap-2">
                  {['JSON', 'Markdown', 'LinkedIn', 'Word'].map(fmt => (
                    <div key={fmt} className="text-xs px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] opacity-50 cursor-not-allowed">
                      {fmt}
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setCurrentStep('preview')}
                  className="px-6 py-2.5 border border-[var(--border)] bg-[var(--surface2)] hover:bg-[var(--surface)] text-[var(--text)] font-bold rounded-xl transition-all"
                >
                  ← ย้อนกลับ
                </button>
              </div>
            </div>
          )}
        </>
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
    <div className="space-y-1.5">
      <label className="text-[10px] text-[var(--muted)] uppercase tracking-wider font-semibold flex items-center gap-1.5">
        <span className="text-indigo-500/80">{icon}</span>
        {label}
      </label>
      <input
        className="w-full bg-[var(--surface)] hover:bg-[var(--surface2)]/40 border border-[var(--border)] rounded-xl px-3.5 py-2 text-xs text-[var(--text)] placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all duration-200 shadow-xs"
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
    <h2 style="color:#8b5cf6;border-bottom:2px solid #8b5cf6;padding-top:14px;margin-top:14px;">Technical Skills</h2>
    <div style="margin-bottom:12px;font-size:11px;color:#333;">${skillsHtml}</div>
    <p style="font-size:9px;color:#aaa;margin-top:40px;">Skill Wallet · ${now}</p>
  </div>
</div>${end}`
  }

  // ── Default fallback (shouldn't be reached) ──
  return `${head}<div style="max-width:21cm;margin:0 auto;"><p>Invalid template</p></div>${end}`
}
