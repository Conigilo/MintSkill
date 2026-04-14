# Skill Wallet — Developer Portfolio Platform

> ระบบจัดการ Portfolio สำหรับนักพัฒนา พร้อม Skill Badge, GitHub Integration และ Peer Endorsement

---

## ภาพรวมระบบ

Skill Wallet เป็นแพลตฟอร์มที่ช่วยให้นักพัฒนาสร้าง Portfolio ของตัวเอง โดยรวบรวมทักษะ (Skills), เหรียญรับรอง (Badges), ข้อมูลจาก GitHub และการรับรองจากเพื่อนร่วมงาน (Endorsements) ไว้ในที่เดียว

### ฟีเจอร์หลัก

| ฟีเจอร์ | รายละเอียด |
|---------|-----------|
| **Authentication** | Login ผ่าน GitHub OAuth, Google, Email/Password โดยใช้ Firebase Auth |
| **Skill Management** | เพิ่ม / แก้ไข / ลบทักษะ พร้อมระบุ Level (1–5) และ Category |
| **Peer Endorsement** | ส่ง Link ให้คนอื่นมา Endorse ทักษะ — เมื่อได้ 3 endorsements จะ auto-mint Badge |
| **GitHub Integration** | เชื่อมต่อ GitHub เพื่อดึง Repos, Contributions, Stars มาแสดงใน Profile |
| **Skill Badge** | ระบบ Badge อัตโนมัติ — ได้รับเมื่อ Skill ถูก Endorse ครบตามเกณฑ์ |
| **Gap Analysis** | วิเคราะห์ช่องว่างทักษะเทียบกับ Role ที่สนใจ เช่น Frontend, Backend, Fullstack |
| **Job Matching** | แนะนำงานที่เหมาะสมตาม Skill Match Score |
| **Export Portfolio** | Export เป็น PDF / หน้าเว็บ Public สำหรับแชร์ |
| **Explore** | ค้นหานักพัฒนาคนอื่นในระบบ พร้อม Endorse ได้ |

---

## Tech Stack

```
Frontend:   Next.js 16 (App Router) + React 19 + TypeScript + TailwindCSS
Backend:    Elysia (Bun Runtime) + TypeScript
Database:   Firebase Firestore
Auth:       Firebase Authentication (GitHub, Google, Email/Password)
API Docs:   Swagger UI (/swagger)
```

---

## สถาปัตยกรรม (Architecture)

```
┌─────────────────────┐         ┌──────────────────────┐
│    Next.js Frontend │  HTTP   │   Elysia Backend     │
│    (Port 3000)      │◄───────►│   (Port 8000)        │
│                     │         │                      │
│  • App Router       │         │  • REST API          │
│  • Firebase SDK     │         │  • Firebase Admin    │
│  • TailwindCSS      │         │  • Rate Limiting     │
│  • ShadCN UI        │         │  • Swagger UI        │
└────────┬────────────┘         └──────────┬───────────┘
         │                                 │
         │       ┌─────────────────┐       │
         └──────►│  Firebase       │◄──────┘
                 │  • Auth         │
                 │  • Firestore    │
                 └────────┬────────┘
                          │
                 ┌────────▼────────┐
                 │  GitHub API     │
                 │  (OAuth + REST) │
                 └─────────────────┘
```

---

## การติดตั้ง

### 1. Clone โปรเจค

```bash
git clone <repo-url>
cd skill-badge-platform
```

### 2. ตั้งค่า Backend

```bash
cd backend
cp .env.example .env   # แก้ไข env ตามต้องการ
bun install
bun run dev            # เริ่ม server ที่ port 3000 (หรือตาม PORT ใน .env)
```

**Environment Variables ที่ต้องตั้ง:**
```
GITHUB_CLIENT_ID=<GitHub OAuth App Client ID>
GITHUB_CLIENT_SECRET=<GitHub OAuth App Client Secret>
FRONTEND_URL=http://localhost:3000
PORT=8000
```

### 3. ตั้งค่า Frontend

```bash
cd next-app
npm install
npm run dev            # เริ่ม dev server ที่ port 3000
```

### 4. Firebase Config

- ตั้งค่า Firebase project ใน Firebase Console
- วาง Service Account JSON ไว้ที่ `backend/config/`
- ตั้งค่า Firebase Client Config ใน Frontend

---

## Firestore Collections

| Collection | รายละเอียด |
|-----------|-----------|
| `users` | ข้อมูล Profile, GitHub stats, endorsement count |
| `skills` | ทักษะของ user แต่ละคน (name, category, level, endorsementCount) |
| `endorsements` | การรับรองทักษะ (status: pending/verified, token สำหรับ link) |
| `github_repos` | Repos ที่ sync มาจาก GitHub |
| `badges` | Badge ที่ได้รับอัตโนมัติเมื่อ skill ถูก endorse ครบเกณฑ์ |
| `jobs` | ประกาศงาน พร้อม requiredSkills สำหรับ matching |
| `export_tokens` | Token สำหรับ public portfolio link |

---

## API Reference

**Base URL:** `http://localhost:8000`  
**Swagger UI:** `http://localhost:8000/swagger`

> Header สำหรับ Endpoint ที่ต้อง Auth: `Authorization: Bearer <Firebase_ID_Token>`

### Health Check

| Method | Path | Auth | คำอธิบาย |
|--------|------|------|---------|
| `GET` | `/health` | ❌ | ตรวจสอบสถานะ server |

### Auth (`/auth`)

| Method | Path | Auth | คำอธิบาย |
|--------|------|------|---------|
| `POST` | `/auth/github/callback` | ❌ | รับ GitHub OAuth code → return Firebase custom token |
| `POST` | `/auth/verify` | ✅ | ตรวจสอบ Firebase ID Token |
| `DELETE` | `/auth/logout` | ✅ | Logout |

### Users (`/users`)

| Method | Path | Auth | คำอธิบาย |
|--------|------|------|---------|
| `GET` | `/users/me` | ✅ | ดึง Profile ตัวเอง |
| `PUT` | `/users/me` | ✅ | แก้ไข Profile (displayName, title, bio, location, linkedinUrl) |
| `GET` | `/users/:username` | ❌ | ดู Public Profile |
| `GET` | `/users/:username/portfolio` | ❌ | ดึงข้อมูลครบ (profile + skills + badges + repos + endorsements) |
| `GET` | `/users/search?q=keyword` | ❌ | ค้นหา users (ใช้ในหน้า Explore) |

### Skills (`/skills`)

| Method | Path | Auth | คำอธิบาย |
|--------|------|------|---------|
| `GET` | `/skills/:userId` | ❌ | ดึง Skills ทั้งหมดของ user |
| `POST` | `/skills` | ✅ | เพิ่ม Skill (name, category, level 1–5) |
| `PUT` | `/skills/:skillId` | ✅ | แก้ไข Skill |
| `DELETE` | `/skills/:skillId` | ✅ | ลบ Skill |

### Endorsements (`/endorsements`)

| Method | Path | Auth | คำอธิบาย |
|--------|------|------|---------|
| `POST` | `/endorsements/request` | ✅ | สร้าง endorsement request → ได้ link กลับ |
| `GET` | `/endorsements/verify/:token` | ❌ | ตรวจสอบ token ว่ายัง valid มั้ย |
| `POST` | `/endorsements/submit/:token` | ❌ | ส่ง Endorsement (fromName, message, skills[]) |
| `GET` | `/endorsements/:userId` | ✅ | ดึง Endorsements ของตัวเอง (ต้องเป็น owner) |

**Flow การ Endorse:**
```
1. User A กด "Request Endorsement" → ได้ link พร้อม token
2. User B เปิด link → กรอกชื่อ, ข้อความ, เลือก Skills ที่จะ Endorse
3. ระบบบันทึก endorsement → อัปเดต endorsementCount ใน skill
4. ถ้า skill ได้ 3 endorsements → auto-mint Badge
```

### GitHub (`/github`)

| Method | Path | Auth | คำอธิบาย |
|--------|------|------|---------|
| `POST` | `/github/sync` | ✅ | Sync repos + contributions จาก GitHub API |
| `GET` | `/github/repos` | ✅ | ดึง repos ที่ sync แล้ว |
| `GET` | `/github/dashboard` | ✅ | ดึงข้อมูลครบ (profile + github + skills + repos + endorsements) |

### Badges (`/badges`)

| Method | Path | Auth | คำอธิบาย |
|--------|------|------|---------|
| `GET` | `/badges/:userId` | ❌ | ดึง Badges ของ user |

### Jobs (`/jobs`)

| Method | Path | Auth | คำอธิบาย |
|--------|------|------|---------|
| `GET` | `/jobs/recommendations` | ✅ | ดึงงานแนะนำตาม skill match (limit, minMatchScore) |
| `POST` | `/jobs/:jobId/apply` | ✅ | สมัครงาน |

### Export (`/export`)

| Method | Path | Auth | คำอธิบาย |
|--------|------|------|---------|
| `GET` | `/export/pdf` | ✅ | Export portfolio เป็น PDF |
| `POST` | `/export/link` | ✅ | สร้าง public share link |
| `GET` | `/export/public/:token` | ❌ | เข้าถึง portfolio ผ่าน public link |

---

## หน้าจอหลัก (Pages)

| Path | ชื่อหน้า | คำอธิบาย |
|------|---------|---------|
| `/` | Landing | หน้าแรก แนะนำระบบ |
| `/login` | Login | เข้าสู่ระบบ (GitHub / Google / Email) |
| `/signup` | Sign Up | สมัครสมาชิก |
| `/dashboard` | Dashboard | หน้าหลัก — Profile Card, Tabs (Overview, Skills, Endorsements, Gap Analysis, Widgets) |
| `/explore` | Explore | ค้นหานักพัฒนาในระบบ พร้อม Endorse |
| `/jobs` | Jobs | งานแนะนำตาม Skill Match |

---

## โฟลเดอร์โปรเจค

```
skill-badge-platform/
├── backend/                    # Elysia API Server (Bun)
│   ├── src/
│   │   ├── index.ts           # Entry — Elysia app, CORS, Rate Limit, Swagger
│   │   ├── controllers/       # Request handlers (auth, users, skills, ...)
│   │   ├── services/          # Business logic (firebase, github, endorsements, ...)
│   │   ├── middleware/        # Auth middleware (Firebase token verification)
│   │   ├── routes/            # Route definitions
│   │   └── utils/             # Validators, errors, token helpers
│   └── config/                # Firebase Service Account JSON
│
├── next-app/                   # Next.js Frontend
│   ├── app/                   # App Router pages
│   │   ├── dashboard/         # Dashboard page
│   │   ├── explore/           # Explore developers page
│   │   ├── jobs/              # Job recommendations page
│   │   ├── login/             # Login page
│   │   └── signup/            # Sign up page
│   ├── components/            # React components
│   │   ├── dashboard/         # Sidebar, Profile Card, Tab components
│   │   └── ui/                # Reusable UI (Button, Card, Badge, Alert, ...)
│   ├── hooks/                 # Custom hooks (useAuth, useProfileData, ...)
│   └── lib/
│       ├── services/          # API client functions
│       ├── hooks/             # Auth hook (canonical)
│       ├── constants/         # API endpoints
│       └── types/             # TypeScript type definitions
│
├── ai/                        # AI Services (stub)
│   └── services/
│       ├── badge-recommender/ # Badge recommendation engine
│       └── skill-analyzer/    # Skill analysis engine
│
└── apiTestRef/                # API test reference document
```

---

## วิธีรัน

```bash
# Terminal 1 — Backend
cd backend
bun run dev

# Terminal 2 — Frontend
cd next-app
npm run dev
```

เปิดเบราว์เซอร์ที่ `http://localhost:3000`  
Swagger API Docs ที่ `http://localhost:8000/swagger`

---

## Security

- **Rate Limiting** — 100 requests/นาที/IP
- **Firebase Auth** — Token verification ทุก protected endpoint
- **CORS** — จำกัด origin เฉพาะ frontend URL
- **Input Validation** — ตรวจสอบ input ทุก endpoint ผ่าน validators

---

## License

MIT

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
