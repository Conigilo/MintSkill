# Skill Wallet — System Design
> Stack: React · Elysia (Bun) · Firebase

---

## 1. Project Structure

```
skill-wallet/
├── frontend/                        # React App
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.tsx
│   │   │   │   └── Sidebar.tsx
│   │   │   ├── profile/
│   │   │   │   ├── ProfileCard.tsx
│   │   │   │   ├── ProfileStats.tsx
│   │   │   │   └── AvatarUpload.tsx
│   │   │   ├── skills/
│   │   │   │   ├── SkillList.tsx
│   │   │   │   ├── SkillTag.tsx
│   │   │   │   └── SkillAddModal.tsx
│   │   │   ├── endorsements/
│   │   │   │   ├── EndorsementCard.tsx
│   │   │   │   ├── EndorsementList.tsx
│   │   │   │   └── RequestModal.tsx
│   │   │   ├── github/
│   │   │   │   ├── GitHubConnect.tsx
│   │   │   │   ├── RepoCard.tsx
│   │   │   │   └── ContribGrid.tsx
│   │   │   ├── gap/
│   │   │   │   ├── GapAnalysis.tsx
│   │   │   │   └── ProgressBar.tsx
│   │   │   └── widget/
│   │   │       ├── SkillWidget.tsx
│   │   │       └── ExportPanel.tsx
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── Profile.tsx          # /u/:username
│   │   │   ├── EditProfile.tsx
│   │   │   ├── EndorseUser.tsx      # /endorse/:token
│   │   │   └── Widget.tsx           # /widget/:username (public embed)
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useProfile.ts
│   │   │   ├── useSkills.ts
│   │   │   └── useEndorsements.ts
│   │   ├── services/
│   │   │   ├── api.ts               # Elysia API client
│   │   │   └── firebase.ts          # Firebase init
│   │   └── store/
│   │       └── authStore.ts         # Zustand
│
└── backend/                         # Elysia (Bun)
    ├── src/
    │   ├── index.ts                 # Entry point
    │   ├── routes/
    │   │   ├── auth.route.ts        # GitHub OAuth
    │   │   ├── users.route.ts
    │   │   ├── skills.route.ts
    │   │   ├── endorsements.route.ts
    │   │   ├── github.route.ts
    │   │   └── export.route.ts
    │   ├── middleware/
    │   │   └── auth.middleware.ts   # Verify Firebase token
    │   ├── services/
    │   │   ├── firebase.service.ts
    │   │   ├── github.service.ts
    │   │   └── pdf.service.ts
    │   └── utils/
    │       └── token.ts
    └── .env
```

---

## 2. Firebase Schema (Firestore)

### Collection: `users`
```
users/{userId}
├── uid: string                    # Firebase Auth UID
├── username: string               # unique slug (e.g. "filsuw")
├── displayName: string
├── email: string
├── avatarUrl: string
├── title: string                  # "Full-Stack Developer"
├── bio: string
├── location: string
├── linkedinUrl: string
├── portfolioUrl: string
├── github: {
│   ├── connected: boolean
│   ├── login: string              # GitHub username
│   ├── accessToken: string        # encrypted
│   ├── avatarUrl: string
│   ├── repoCount: number
│   ├── totalStars: number
│   ├── totalContributions: number
│   └── lastSynced: timestamp
├── stats: {
│   ├── endorsementCount: number   # denormalized for speed
│   ├── skillCount: number
│   └── profileViews: number
└── createdAt: timestamp
```

### Collection: `skills`
```
skills/{skillId}
├── userId: string                 # owner
├── name: string                   # "React"
├── category: string               # "framework" | "language" | "concept" | "tool"
├── level: number                  # 1-5 (self-assessed)
├── endorsementCount: number       # denormalized
├── fromGitHub: boolean            # auto-detected from repos
├── createdAt: timestamp
└── updatedAt: timestamp
```

### Collection: `endorsements`
```
endorsements/{endorsementId}
├── toUserId: string               # ผู้ถูก endorse
├── fromUserId: string             # ผู้ endorse (null ถ้ายังไม่ตอบ)
├── fromName: string
├── fromRole: string               # "Senior Engineer @ LINE"
├── fromAvatarUrl: string
├── message: string
├── skills: string[]               # ["React", "Node.js"]
├── status: string                 # "pending" | "verified" | "rejected"
├── token: string                  # unique token สำหรับ endorse link
├── verifiedAt: timestamp
└── createdAt: timestamp
```

### Collection: `github_repos`
```
github_repos/{repoId}
├── userId: string
├── repoId: number                 # GitHub repo ID
├── name: string
├── description: string
├── url: string
├── stars: number
├── forks: number
├── language: string
├── topics: string[]
├── updatedAt: timestamp
└── syncedAt: timestamp
```

### Collection: `export_tokens`
```
export_tokens/{tokenId}
├── userId: string
├── type: string                   # "pdf" | "link"
├── token: string                  # public access token
├── expiresAt: timestamp
└── createdAt: timestamp
```

### Firebase Auth
- Provider: **GitHub OAuth** (via Firebase Auth)
- Custom claims: `{ username, role }`

### Firestore Rules (สำคัญ!)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // users: อ่านได้ทุกคน แต่แก้ได้เฉพาะเจ้าของ
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth.uid == userId;
    }

    // skills: อ่านได้ทุกคน แก้ได้เฉพาะเจ้าของ
    match /skills/{skillId} {
      allow read: if true;
      allow create, update, delete: if request.auth.uid == resource.data.userId;
    }

    // endorsements: อ่านได้เฉพาะ owner, สร้างได้ทุกคน (via token)
    match /endorsements/{endId} {
      allow read: if request.auth.uid == resource.data.toUserId;
      allow create: if true;
      allow update: if request.auth != null;
    }

    // repos: อ่านได้ทุกคน
    match /github_repos/{repoId} {
      allow read: if true;
      allow write: if request.auth.uid == resource.data.userId;
    }
  }
}
```

---

## 3. API Endpoints (Elysia)

### Auth Routes `/api/auth`
```
POST  /api/auth/github/callback     # รับ code จาก GitHub OAuth → return Firebase token
POST  /api/auth/verify              # verify Firebase ID token
DELETE /api/auth/logout
```

### User Routes `/api/users`
```
GET   /api/users/:username          # public profile (no auth)
PUT   /api/users/me                 # update profile (auth required)
GET   /api/users/me                 # get own profile
```

### Skills Routes `/api/skills`
```
GET   /api/skills/:userId           # get all skills of user
POST  /api/skills                   # add skill (auth)
PUT   /api/skills/:skillId          # update skill (auth)
DELETE /api/skills/:skillId         # delete skill (auth)
```

### Endorsement Routes `/api/endorsements`
```
GET   /api/endorsements/:userId     # list endorsements (auth = owner)
POST  /api/endorsements/request     # ส่ง request link ไปหาคนที่จะ endorse
GET   /api/endorsements/verify/:token  # verify token (public - ใช้ใน endorse page)
POST  /api/endorsements/submit/:token  # submit endorsement (public)
```

### GitHub Routes `/api/github`
```
POST  /api/github/connect           # connect GitHub account (auth)
POST  /api/github/sync              # sync repos + contributions (auth)
GET   /api/github/repos/:userId     # get synced repos (public)
```

### Export Routes `/api/export`
```
GET   /api/export/pdf/:userId       # generate PDF (auth = owner)
POST  /api/export/link              # create public link token (auth)
GET   /api/export/public/:token     # access public portfolio (no auth)
```

---

## 4. React Components

### `useAuth.ts`
```typescript
// hooks/useAuth.ts
import { useEffect, useState } from 'react'
import { getAuth, onAuthStateChanged, signInWithPopup, GithubAuthProvider } from 'firebase/auth'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const auth = getAuth()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return unsub
  }, [])

  const loginWithGitHub = async () => {
    const provider = new GithubAuthProvider()
    provider.addScope('read:user')
    provider.addScope('repo')
    await signInWithPopup(auth, provider)
  }

  const logout = () => auth.signOut()

  return { user, loading, loginWithGitHub, logout }
}
```

### `api.ts`
```typescript
// services/api.ts
const BASE = import.meta.env.VITE_API_URL

async function request(path: string, options?: RequestInit) {
  const token = await getAuth().currentUser?.getIdToken()
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export const api = {
  getProfile: (username: string) => request(`/users/${username}`),
  updateProfile: (data: any) => request('/users/me', { method: 'PUT', body: JSON.stringify(data) }),
  getSkills: (userId: string) => request(`/skills/${userId}`),
  addSkill: (data: any) => request('/skills', { method: 'POST', body: JSON.stringify(data) }),
  requestEndorsement: (data: any) => request('/endorsements/request', { method: 'POST', body: JSON.stringify(data) }),
  syncGitHub: () => request('/github/sync', { method: 'POST' }),
  exportPDF: (userId: string) => request(`/export/pdf/${userId}`),
}
```

### `auth.middleware.ts` (Elysia)
```typescript
// backend/src/middleware/auth.middleware.ts
import { getAuth } from 'firebase-admin/auth'

export async function verifyToken(request: Request) {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) throw new Error('Unauthorized')
  
  const token = authHeader.split(' ')[1]
  const decoded = await getAuth().verifyIdToken(token)
  return decoded
}
```

### `endorsements.route.ts` (Elysia) — Core logic
```typescript
import Elysia from 'elysia'
import { db } from '../services/firebase.service'
import { randomBytes } from 'crypto'

export const endorsementsRoute = new Elysia({ prefix: '/endorsements' })

  // ส่ง request link ให้คนที่จะมา endorse
  .post('/request', async ({ body, set }) => {
    const { toUserId, recipientEmail, recipientName } = body as any
    const token = randomBytes(32).toString('hex')

    await db.collection('endorsements').add({
      toUserId,
      fromUserId: null,
      fromName: recipientName,
      status: 'pending',
      token,
      createdAt: new Date(),
    })

    // TODO: ส่ง email พร้อม link /endorse/:token
    return { success: true, link: `https://skillwallet.dev/endorse/${token}` }
  })

  // คนกด link มา endorse
  .get('/verify/:token', async ({ params }) => {
    const snap = await db.collection('endorsements')
      .where('token', '==', params.token)
      .where('status', '==', 'pending')
      .limit(1).get()

    if (snap.empty) return { valid: false }
    const doc = snap.docs[0]
    return { valid: true, toUserId: doc.data().toUserId }
  })

  .post('/submit/:token', async ({ params, body }) => {
    const { message, skills, fromRole } = body as any
    const snap = await db.collection('endorsements')
      .where('token', '==', params.token).limit(1).get()

    if (snap.empty) throw new Error('Invalid token')
    await snap.docs[0].ref.update({
      message, skills, fromRole,
      status: 'verified',
      verifiedAt: new Date(),
    })

    // update denormalized count
    const toUserId = snap.docs[0].data().toUserId
    await db.collection('users').doc(toUserId).update({
      'stats.endorsementCount': (await db.collection('endorsements')
        .where('toUserId', '==', toUserId)
        .where('status', '==', 'verified').get()).size
    })

    return { success: true }
  })
```

---

## 5. GitHub OAuth Flow

```
1. User คลิก "Connect GitHub"
   ↓
2. Frontend redirect → https://github.com/login/oauth/authorize
   ?client_id=XXX&scope=read:user,repo
   ↓
3. GitHub redirect กลับ → /api/auth/github/callback?code=XXX
   ↓
4. Elysia backend:
   - exchange code → GitHub access token
   - fetch GitHub user info
   - sign in / link Firebase Auth user
   - save accessToken encrypted ใน Firestore
   - return Firebase custom token
   ↓
5. Frontend: signInWithCustomToken(token)
   ↓
6. POST /api/github/sync
   - ดึง repos, languages, contributions
   - save ใน github_repos collection
   - auto-detect skills จาก repo languages
```

---

## 6. Environment Variables

### Frontend (`.env`)
```
VITE_API_URL=http://localhost:3000/api
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
```

### Backend (`.env`)
```
PORT=3000
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...
```
