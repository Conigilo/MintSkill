// =============================================================================
// Mock Data — ข้อมูลจำลองสำหรับ frontend (ยังไม่ต่อ API)
// เมื่อต่อ backend แล้ว ให้เปลี่ยนมาใช้ fetch จาก API แทน
// =============================================================================

export interface Skill {
  name: string
  category: 'languages' | 'frameworks' | 'concepts'
  color?: string
  endorsements: number
}

export interface Endorsement {
  id: string
  name: string
  role: string
  avatarGradient: string
  initial: string
  verified: boolean
  text: string
  skills: string[]
  timeAgo: string
}

export interface Project {
  name: string
  icon: string
  language: string
  languageColor: string
  description: string
  stars: number
  forks: number
  updatedAgo: string
}

export interface GapItem {
  skill: string
  percent: number
  color: string
  note: string
}

export interface UserProfile {
  name: string
  handle: string
  title: string
  bio: string
  location: string
  github: string
  linkedin: string
  initial: string
}

// — Profile —
export const mockProfile: UserProfile = {
  name: 'Conigilo',
  handle: '@Conigilo',
  title: 'Full-Stack Developer & CS Student',
  bio: 'Passionate about building products. Love algorithms, system design, and tech investing (NVDA, AMD, TSM 📈).',
  location: 'Bangkok, Thailand',
  github: 'github.com/Conigilo',
  linkedin: 'linkedin.com/in/Conigilo',
  initial: 'C',
}

// — Stats —
export const mockStats = {
  verifiedSkills: 24,
  endorsements: 12,
  contributions: 847,
  projects: 8,
}

// — GitHub —
export const mockGitHub = {
  repositories: 42,
  contributions: 847,
  stars: 234,
  pullRequests: 156,
}

// — Skills —
export const mockSkills: Skill[] = [
  // Languages
  { name: 'JavaScript', category: 'languages', color: '#f1e05a', endorsements: 8 },
  { name: 'Python', category: 'languages', color: '#3572A5', endorsements: 6 },
  { name: 'Java', category: 'languages', color: '#b07219', endorsements: 4 },
  { name: 'HTML/CSS', category: 'languages', color: '#e34c26', endorsements: 5 },
  { name: 'C++', category: 'languages', color: '#555555', endorsements: 3 },
  { name: 'Go', category: 'languages', color: '#00ADD8', endorsements: 1 },
  // Frameworks
  { name: 'React', category: 'frameworks', color: '#61dafb', endorsements: 7 },
  { name: 'Node.js', category: 'frameworks', color: '#68a063', endorsements: 5 },
  { name: 'MongoDB', category: 'frameworks', color: '#47a248', endorsements: 3 },
  { name: 'PostgreSQL', category: 'frameworks', color: '#336791', endorsements: 3 },
  { name: 'Docker', category: 'frameworks', color: '#2496ED', endorsements: 2 },
  { name: 'Kubernetes', category: 'frameworks', color: '#326CE5', endorsements: 1 },
  // Concepts
  { name: 'Algorithms', category: 'concepts', endorsements: 4 },
  { name: 'Data Structures', category: 'concepts', endorsements: 4 },
  { name: 'System Design', category: 'concepts', endorsements: 2 },
  { name: 'OS Concepts', category: 'concepts', endorsements: 2 },
  { name: 'Networking', category: 'concepts', endorsements: 1 },
  { name: 'Database Design', category: 'concepts', endorsements: 2 },
]

// — Endorsements —
export const mockEndorsements: Endorsement[] = [
  {
    id: '1',
    name: 'Anan Sawasdee',
    role: 'Senior Engineer @ LINE Thailand',
    avatarGradient: 'linear-gradient(135deg, #1f6feb, #58a6ff)',
    initial: 'A',
    verified: true,
    text: 'Fil is an incredibly sharp developer. We worked together on the backend team — he consistently wrote clean, well-tested code and picked up new concepts faster than anyone on the team.',
    skills: ['Node.js', 'System Design', 'Algorithms'],
    timeAgo: '3 days ago',
  },
  {
    id: '2',
    name: 'Piyapat Thanasakdi',
    role: 'CS Professor @ KMITL',
    avatarGradient: 'linear-gradient(135deg, #a371f7, #bc8cff)',
    initial: 'P',
    verified: true,
    text: 'One of my top students. Demonstrates deep understanding of data structures and algorithms. His final project on graph optimization was genuinely impressive for an undergrad.',
    skills: ['Algorithms', 'Data Structures', 'Python'],
    timeAgo: '1 week ago',
  },
  {
    id: '3',
    name: 'Siriporn Kaewkla',
    role: 'Tech Lead @ Agoda',
    avatarGradient: 'linear-gradient(135deg, #d29922, #f0b72f)',
    initial: 'S',
    verified: true,
    text: 'Worked with Fil during a hackathon. Built a full React + Node.js app in 24hrs from scratch. Great communicator, ships fast, and writes readable code under pressure.',
    skills: ['React', 'JavaScript', 'Node.js'],
    timeAgo: '2 weeks ago',
  },
  {
    id: '4',
    name: 'Kittiphat Mongkon',
    role: 'Classmate & Project Partner',
    avatarGradient: 'linear-gradient(135deg, #3fb950, #26a641)',
    initial: 'K',
    verified: false,
    text: 'We built our OS project together. Fil handled the scheduler and memory management parts perfectly. Always available to explain concepts to the rest of the team.',
    skills: ['C++', 'OS Concepts'],
    timeAgo: '1 month ago',
  },
]

// — Projects —
export const mockProjects: Project[] = [
  {
    name: 'skill-wallet',
    icon: '📦',
    language: 'JavaScript',
    languageColor: '#f1e05a',
    description: 'Portfolio platform with skill verification and endorsement system',
    stars: 12,
    forks: 3,
    updatedAgo: 'Updated 2d ago',
  },
  {
    name: 'algo-visualizer',
    icon: '🤖',
    language: 'Python',
    languageColor: '#3572A5',
    description: 'Interactive algorithm visualization with step-by-step execution',
    stars: 45,
    forks: 8,
    updatedAgo: 'Updated 1w ago',
  },
  {
    name: 'stock-tracker',
    icon: '📊',
    language: 'React',
    languageColor: '#61dafb',
    description: 'Real-time stock tracker focused on NVDA, AMD, TSM',
    stars: 28,
    forks: 5,
    updatedAgo: 'Updated 3d ago',
  },
  {
    name: 'auth-service',
    icon: '🔐',
    language: 'Node.js',
    languageColor: '#68a063',
    description: 'JWT-based auth microservice with OAuth2 support',
    stars: 19,
    forks: 6,
    updatedAgo: 'Updated 5d ago',
  },
]

// — Gap Analysis —
export const mockGapAnalysis: GapItem[] = [
  { skill: 'React', percent: 85, color: 'var(--green)', note: 'Strong — keep building projects' },
  { skill: 'System Design', percent: 55, color: 'var(--gold)', note: '⚠ Gap — study distributed systems' },
  { skill: 'Docker / K8s', percent: 40, color: 'var(--gold)', note: '⚠ Gap — practice containerization' },
  { skill: 'Algorithms', percent: 78, color: 'var(--green)', note: 'Good — add more LeetCode hard' },
  { skill: 'TypeScript', percent: 30, color: 'var(--red)', note: '❌ Missing — high demand skill' },
  { skill: 'PostgreSQL', percent: 62, color: 'var(--accent)', note: 'Decent — learn query optimization' },
]

// — Widget Skills —
export const mockWidgetSkills = ['React', 'Node.js', 'Python', 'Algorithms', '+20']
