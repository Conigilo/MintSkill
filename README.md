# Skill Wallet — Developer Portfolio & Skill Verification Platform

> ระบบยืนยันทักษะและจัดการ Portfolio พร้อม Skill Badge, GitHub Integration, Peer Endorsement, Gap Analysis, Resume Builder และ Job Matching

---

## Overall

Skill Wallet เป็นแพลตฟอร์มที่ช่วยให้นักพัฒนาสร้าง Portfolio ที่น่าเชื่อถือ โดยรวบรวมทักษะ (Skills) ที่ผ่านการรับรองจากเพื่อนร่วมงาน (Peer Endorsement) หรือป้อนข้อมูลการรับรองโดยตรง, เหรียญรับรอง (Badges), ข้อมูลจาก GitHub พร้อมการปักหมุด Repository เด่น (Spotlight), การวิเคราะห์ช่องว่างทักษะ (Gap Analysis) และระบบ Resume Builder ที่สามารถเลือก Template และ Export เป็น PDF ได้ทันที

---

## All feature

### Authentication & Security

| ฟีเจอร์                 | รายละเอียด                                                                           |
| ----------------------- | ------------------------------------------------------------------------------------ |
| **Multi-Provider Auth** | Login ผ่าน GitHub OAuth, Google OAuth, Email/Password โดยใช้ Firebase Authentication |
| **Token Verification**  | ทุก Protected Endpoint ต้อง verify Firebase ID Token ผ่าน Middleware                 |
| **Rate Limiting**       | จำกัด 100 requests/นาที/IP เพื่อป้องกัน abuse                                        |
| **CORS Protection**     | จำกัด origin เฉพาะ Frontend URL ที่กำหนด                                             |
| **Input Validation**    | ตรวจสอบ input ทุก endpoint ผ่าน validators                                           |

### Dashboard (5 Tabs)

| Tab               | รายละเอียด                                                                                                                                                                       |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Overview**      | แสดง Stats (Verified Skills, Endorsements, Contributions, Projects), Top Skills, GitHub Status                                                                                   |
| **Skills**        | จัดการทักษะ — เพิ่ม/แก้ไข/ลบ Skill พร้อม Level (1–5) และ Category, ดูสถานะ Verified, กรอง/ค้นหา, Request Endorsement                                                             |
| **Endorsements**  | ดูรายการ Endorsement ที่ได้รับ, สร้าง Endorsement Link ส่งให้คนอื่นมารับรอง                                                                                                      |
| **Gap Analysis**  | วิเคราะห์ช่องว่างทักษะเทียบกับ Role เป้าหมาย (Frontend, Backend, Fullstack, DevOps, Mobile), คำนวณ Match Score                                                                   |
| **Export Resume** | เลือก Template (4 แบบ), กรอกข้อมูล Resume ครบ (Personal, Education, Activity, Project, Skills, Strengths), บันทึกข้อมูล, และสั่ง Export PDF ได้ผ่านฟังก์ชัน Print ของเบราว์เซอร์ |

### Skill Badge System

| ฟีเจอร์                     | รายละเอียด                                                          |
| --------------------------- | ------------------------------------------------------------------- |
| **Auto-Mint Badge**         | เมื่อ Skill ได้รับ Endorsement ครบ 3 คน → ระบบสร้าง Badge อัตโนมัติ |
| **Badge Certificate Modal** | กดดู Badge แต่ละอัน จะแสดง Certificate สวยงาม พร้อมวันที่ได้รับ     |
| **Verification Status**     | แสดง ✓ Verified / ○ In Progress บนทุก Skill                         |

### GitHub Integration

| ฟีเจอร์                | รายละเอียด                                                                                      |
| ---------------------- | ----------------------------------------------------------------------------------------------- |
| **OAuth Link**         | เชื่อมต่อ GitHub Account ผ่าน OAuth                                                             |
| **Repo Sync**          | ดึง Repositories, Stars, Forks, Languages มาแสดง                                                |
| **Contribution Stats** | ดึงข้อมูล Contributions, Commit History                                                         |
| **Repo Spotlight**     | สลับสถานะการไฮไลต์ (Spotlight) เพื่อปักหมุด Repository โครงการเด่นขึ้นแสดงในหน้า Public Profile |
| **Dashboard Card**     | แสดงสถานะ GitHub (Connected/Not Connected) พร้อม Stats                                          |

### Peer Endorsement System

```
Flow การ Endorse:
1. การขอรับรองผ่าน Link:
   - User A กด "Request Endorsement" → ระบบสร้าง Link พร้อม Token
   - User B เปิด Link → กรอกชื่อ, ข้อความ, เลือก Skills ที่จะ Endorse
   - ระบบบันทึก Endorsement → อัปเดต endorsementCount ใน Skill
   - ถ้า Skill ได้ ≥3 Endorsements → Auto-Mint Badge
2. การรับรองโดยตรง (Direct Endorsement):
   - User B (ที่ล็อกอินอยู่ในระบบ) สามารถกดรับรองทักษะให้ User A ได้โดยตรงจากหน้า Explore หรือหน้าโปรไฟล์สาธารณะ
```

### Resume Builder & Export

| ฟีเจอร์                   | รายละเอียด                                                                                                                                                           |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **4 Templates**           | Classic (สีน้ำเงิน), Modern (2 คอลัมน์สีม่วง), Minimal (เรียบ serif), Bold (Header สีทอง)                                                                            |
| **Template Preview**      | แสดง Mini A4 Preview ของแต่ละ Template ให้เลือก                                                                                                                      |
| **Resume Editor**         | กรอกข้อมูลแบบ Form — Personal Info, Education, Activities, Projects, Strengths                                                                                       |
| **Auto-Fill Skills**      | ดึง Technical Skills จากข้อมูลจริงของ User ใส่ให้อัตโนมัติ                                                                                                           |
| **Bullet Points**         | เพิ่ม/ลบ Bullet Point ใน Activity และ Project ได้ตามต้องการ                                                                                                          |
| **Save & Load**           | บันทึกข้อมูล Resume ลง localStorage, โหลดกลับอัตโนมัติเมื่อเปิดหน้าใหม่                                                                                              |
| **Client-Side Print PDF** | Generate HTML โครงสร้างเรซูเม่จากเทมเพลตที่เลือกในฝั่ง Client จากนั้นใช้คำสั่งพิมพ์ของเบราว์เซอร์ (window.print()) บันทึกเป็น PDF ได้ทันทีโดยมีความปลอดภัยและรวดเร็ว |

### Gap Analysis

| ฟีเจอร์                 | รายละเอียด                                                                                 |
| ----------------------- | ------------------------------------------------------------------------------------------ |
| **Role-Based Analysis** | เลือก Role เป้าหมาย: Frontend Dev, Backend Dev, Fullstack Dev, DevOps Engineer, Mobile Dev |
| **Match Score**         | คำนวณ % ความตรงกันระหว่าง Skills ที่มีกับ Skills ที่ Role ต้องการ                          |
| **Skill Gap List**      | แสดงรายการ Skills ที่ยังขาดสำหรับแต่ละ Role                                                |
| **Visual Progress**     | แสดง Progress Bar สีแสดงระดับ Match                                                        |

### Job Board & Matching

| ฟีเจอร์                     | รายละเอียด                                                                       |
| --------------------------- | -------------------------------------------------------------------------------- |
| **Real-time Match Score**   | คำนวณ % ความเหมาะสมระหว่างทักษะของคุณกับงานแต่ละตำแหน่งแบบ Real-time             |
| **Skill Gap Visualization** | แสดงสัญลักษณ์ ✓ (มีทักษะ) และ ✗ (ทักษะที่ยังขาด) สำหรับแต่ละตำแหน่งงาน           |
| **Sticky UI Layout**        | ส่วนหัวและตัวกรองถูกล็อคไว้ด้านบน (Sticky) ช่วยให้เลื่อนดูงานได้อย่างสะดวก       |
| **Recommendation Engine**   | ระบบแนะนำงานที่ตรงกับทักษะของคุณโดยเฉพาะ (ดึงข้อมูลจาก Firestore จริง)           |
| **Minimal Premium Design**  | ปรับปรุง UI ให้ดูหรูหรา เรียบง่าย พร้อมฟอนต์ Sans-serif ที่อ่านง่ายและเป็นทางการ |
| **Apply**                   | สมัครงานได้จากในระบบ                                                             |
| **Skill Tags**              | แสดง Required Skills ของแต่ละงาน พร้อมไฮไลต์ Skills ที่ตรงกับ User               |

### Backend Architecture (High Performance)

| หัวข้อ                    | เทคโนโลยีและเทคนิคที่ใช้                                                                       |
| ------------------------- | ---------------------------------------------------------------------------------------------- |
| **RESTful API**           | ออกแบบตามมาตรฐาน Resource-based โดยใช้ **Elysia.js** (Bun Runtime)                             |
| **GitHub API Caching**    | มีระบบ **In-memory Cache** (10 นาที) สำหรับข้อมูล GitHub เพื่อความรวดเร็วและประหยัด Rate Limit |
| **Security & Rate Limit** | ระบบป้องกันการรัว Request (Rate Limiting) และเช็คสิทธิ์ผ่าน Firebase Admin SDK                 |
| **API Documentation**     | มีระบบ **Swagger UI** ในตัวสำหรับการทดสอบและดูเอกสาร API ทั้งหมด                               |
| **Database**              | ใช้ **Google Firestore** (NoSQL) จัดการข้อมูลงาน, สกิล และโปรไฟล์ผู้ใช้                        |

### Explore & Public Profile

| ฟีเจอร์              | รายละเอียด                                                                                            |
| -------------------- | ----------------------------------------------------------------------------------------------------- |
| **Developer Search** | ค้นหานักพัฒนาคนอื่นในระบบ                                                                             |
| **Public Profile**   | หน้า Profile สาธารณะ (`/profile/:username`) แสดง Skills, Badges, GitHub Stats, Pinned Spotlight Repos |
| **Endorse Others**   | Endorse Skills ของนักพัฒนาคนอื่นได้ทันทีจากหน้า Explore หรือ Public Profile                           |

---

## Tech Stack

| Layer                 | Technology                                                 |
| --------------------- | ---------------------------------------------------------- |
| **Frontend**          | Next.js 16 (App Router) + React 19 + TypeScript            |
| **Styling**           | TailwindCSS v4                                             |
| **Backend**           | ElysiaJS (Bun Runtime) + TypeScript                        |
| **Database**          | Firebase Firestore (NoSQL)                                 |
| **Authentication**    | Firebase Auth (GitHub OAuth, Google OAuth, Email/Password) |
| **API Documentation** | Swagger UI (`/swagger`)                                    |
| **State Management**  | React Hooks + localStorage                                 |

---

## สถาปัตยกรรม (Architecture)

```
┌──────────────────────────┐         ┌──────────────────────────┐
│     Next.js Frontend     │  HTTP   │     Elysia Backend       │
│     (Port 3000)          │◄───────►│     (Port 8000)          │
│                          │         │                          │
│  • App Router (Pages)    │         │  • REST API              │
│  • Firebase Client SDK   │         │  • Firebase Admin SDK    │
│  • TailwindCSS v4        │         │  • Rate Limiting         │
│  • Custom Hooks          │         │  • Input Validation      │
│  • Service Layer (API)   │         │  • Swagger UI            │
│  • Client-side PDF Print │         │  • CORS Protection       │
└──────────┬───────────────┘         └──────────┬───────────────┘
           │                                    │
           │       ┌────────────────────┐       │
           └──────►│  Firebase          │◄──────┘
                   │  • Authentication  │
                   │  • Firestore DB    │
                   └────────┬───────────┘
                             │
                    ┌────────▼───────────┐
                    │  GitHub API        │
                    │  (OAuth + REST)    │
                    └────────────────────┘
```

### Data Flow

```
User → Frontend (Next.js) → API Request (fetch + Firebase ID Token)
                           → Backend (ElysiaJS) → Auth Middleware (verify token)
                                                → Controller → Service → Firestore
                                                ← Response (JSON)
                           ← Update UI
```

---

## Firestore Collections

| Collection     | รายละเอียด                  | Fields หลัก                                                                                         |
| -------------- | --------------------------- | --------------------------------------------------------------------------------------------------- |
| `users`        | ข้อมูล Profile ของ User     | `uid`, `displayName`, `email`, `username`, `title`, `bio`, `location`, `githubUsername`, `photoURL` |
| `skills`       | ทักษะของ User แต่ละคน       | `userId`, `name`, `category`, `level` (1–5), `endorsementCount`, `verified`                         |
| `endorsements` | การรับรองทักษะ              | `skillId`, `fromName`, `message`, `status` (pending/verified), `token`, `skills[]`, `fromRole`      |
| `badges`       | Badge ที่ได้รับอัตโนมัติ    | `userId`, `skillId`, `skillName`, `earnedAt`                                                        |
| `github_repos` | Repos ที่ sync มาจาก GitHub | `userId`, `name`, `description`, `stars`, `forks`, `language`, `url`, `isSpotlight`                 |
| `jobs`         | ประกาศงาน                   | `title`, `company`, `requiredSkills[]`, `description`, `location`, `logo`, `type`, `salary`         |

---

## API Reference

**Base URL:** `http://localhost:8000`
**Swagger UI:** `http://localhost:8000/swagger`

> Header สำหรับ Protected Endpoint: `Authorization: Bearer <Firebase_ID_Token>`

### Health Check

| Method | Path      | Auth | คำอธิบาย            |
| ------ | --------- | ---- | ------------------- |
| `GET`  | `/health` | ❌   | ตรวจสอบสถานะ server |

### Auth (`/auth`)

| Method   | Path                    | Auth | คำอธิบาย                                                |
| -------- | ----------------------- | ---- | ------------------------------------------------------- |
| `POST`   | `/auth/github/callback` | ❌   | รับ GitHub OAuth code → return Firebase custom token    |
| `POST`   | `/auth/login`           | ❌   | สำหรับเข้าสู่ระบบผ่านอีเมลในการรันพัฒนา (Dev/Test Only) |
| `POST`   | `/auth/verify`          | ✅   | ตรวจสอบ Firebase ID Token                               |
| `DELETE` | `/auth/logout`          | ✅   | Logout และสั่งยกเลิกโทเคนสะท้อนกลับ                     |

### Users (`/users`)

| Method | Path                         | Auth | คำอธิบาย                                                                            |
| ------ | ---------------------------- | ---- | ----------------------------------------------------------------------------------- |
| `GET`  | `/users/me`                  | ✅   | ดึง Profile ตัวเอง                                                                  |
| `PUT`  | `/users/me`                  | ✅   | แก้ไข Profile (displayName, title, bio, location, linkedinUrl)                      |
| `POST` | `/users/sync`                | ✅   | ซิงค์โปรไฟล์จาก Firebase Auth ไปยังฐานข้อมูลหลัก                                    |
| `GET`  | `/users/:username`           | ❌   | ดู Public Profile                                                                   |
| `GET`  | `/users/:username/portfolio` | ❌   | ดึงข้อมูลครบ (profile + skills + badges + repos + endorsements) สำหรับนำเสนอโปรไฟล์ |
| `GET`  | `/users/search?q=keyword`    | ❌   | ค้นหา users (ใช้ในหน้า Explore)                                                     |
| `GET`  | `/users/recommendations`     | ❌   | ดึงข้อมูลการแนะนำผู้ใช้งานที่น่าสนใจบนแพลตฟอร์ม                                     |

### Skills (`/skills`)

| Method   | Path                    | Auth | คำอธิบาย                                    |
| -------- | ----------------------- | ---- | ------------------------------------------- |
| `GET`    | `/skills/me`            | ✅   | ดึงข้อมูลทักษะที่เกี่ยวข้องกับตัวเองทั้งหมด |
| `GET`    | `/skills/:userId`       | ❌   | ดึง Skills ทั้งหมดของ user                  |
| `POST`   | `/skills`               | ✅   | เพิ่ม Skill (name, category, level 1–5)     |
| `PUT`    | `/skills/:skillId`      | ✅   | แก้ไข Skill                                 |
| `DELETE` | `/skills/:skillId`      | ✅   | ลบ Skill                                    |
| `POST`   | `/skills/:skillId/quiz` | ✅   | บันทึกคะแนนแบบทดสอบเพื่อสะสมในการขอรับรอง   |

### Endorsements (`/endorsements`)

| Method | Path                          | Auth | คำอธิบาย                                            |
| ------ | ----------------------------- | ---- | --------------------------------------------------- |
| `POST` | `/endorsements/request`       | ✅   | สร้าง endorsement request → ได้ link กลับ           |
| `POST` | `/endorsements/direct`        | ✅   | ลงคะแนนรับรองทักษะให้นักพัฒนาคนอื่นโดยตรง           |
| `GET`  | `/endorsements/verify/:token` | ❌   | ตรวจสอบ token ว่ายัง valid มั้ย                     |
| `POST` | `/endorsements/submit/:token` | ❌   | ส่ง Endorsement (fromName, message, skills[])       |
| `GET`  | `/endorsements/sent/:userId`  | ✅   | ดึงรายการคำรับรองที่คุณเคยส่งให้เพื่อนร่วมงานคนอื่น |
| `GET`  | `/endorsements/:userId`       | ✅   | ดึง Endorsements ของตัวเอง (ต้องเป็น owner)         |

### GitHub (`/github`)

| Method | Path                                 | Auth | คำอธิบาย                                                          |
| ------ | ------------------------------------ | ---- | ----------------------------------------------------------------- |
| `POST` | `/github/connect`                    | ✅   | บันทึกการเชื่อมต่อและจัดเก็บ Token ล็อกอิน GitHub                 |
| `POST` | `/github/sync`                       | ✅   | Sync repos + contributions จาก GitHub API                         |
| `GET`  | `/github/repos`                      | ✅   | ดึง repos ที่ sync แล้ว                                           |
| `GET`  | `/github/dashboard`                  | ✅   | ดึงข้อมูล GitHub dashboard และทักษะที่เกี่ยวข้อง                  |
| `PUT`  | `/github/repos/:repoDocId/spotlight` | ✅   | สลับและบันทึกสถานะการตั้ง Spotlight ให้กับ Repository โครงการเด่น |

### Badges (`/badges`)

| Method | Path              | Auth | คำอธิบาย            |
| ------ | ----------------- | ---- | ------------------- |
| `GET`  | `/badges/:userId` | ❌   | ดึง Badges ของ user |

### Jobs (`/jobs`)

| Method | Path                    | Auth | คำอธิบาย                                          |
| ------ | ----------------------- | ---- | ------------------------------------------------- |
| `GET`  | `/jobs`                 | ❌   | ดึงรายการประกาศรับสมัครงานทั้งหมดที่มีในระบบ      |
| `GET`  | `/jobs/recommendations` | ✅   | ดึงงานแนะนำตาม skill match (limit, minMatchScore) |
| `GET`  | `/jobs/:id`             | ❌   | ดึงข้อมูลงานรายชิ้น                               |
| `POST` | `/jobs/:jobId/apply`    | ✅   | สมัครงาน                                          |

### Export (`/export`)

| Method | Path                    | Auth | คำอธิบาย                           |
| ------ | ----------------------- | ---- | ---------------------------------- |
| `GET`  | `/export/pdf`           | ✅   | Export portfolio เป็น PDF          |
| `POST` | `/export/link`          | ✅   | สร้าง public share link            |
| `GET`  | `/export/public/:token` | ❌   | เข้าถึง portfolio ผ่าน public link |

### Challenges (`/challenges`)

| Method | Path                     | Auth | คำอธิบาย               |
| ------ | ------------------------ | ---- | ---------------------- |
| `GET`  | `/challenges`            | ✅   | ดึง Challenges ทั้งหมด |
| `POST` | `/challenges/:id/submit` | ✅   | ส่งคำตอบ Challenge     |
| `GET`  | `/challenges/:id/status` | ✅   | ตรวจสอบสถานะ Challenge |

---

## หน้าจอทั้งหมด (Pages)

| Path                 | ชื่อหน้า         | คำอธิบาย                                                                                       |
| -------------------- | ---------------- | ---------------------------------------------------------------------------------------------- |
| `/`                  | Landing Page     | หน้าแรก แนะนำระบบ พร้อม Call-to-Action                                                         |
| `/login`             | Login            | เข้าสู่ระบบ (GitHub / Google / Email)                                                          |
| `/signup`            | Sign Up          | สมัครสมาชิกด้วย Email/Password                                                                 |
| `/auth/callback`     | Auth Callback    | หน้าจัดการรับ Callback จาก GitHub OAuth เพื่อประมวลผลโทเคนเข้าระบบ                             |
| `/dashboard`         | Dashboard        | หน้าหลัก — Profile Card + 5 Tabs (Overview, Skills, Endorsements, Gap Analysis, Export Resume) |
| `/explore`           | Explore          | ค้นหานักพัฒนาในระบบ พร้อม Endorse                                                              |
| `/jobs`              | Jobs             | งานแนะนำตาม Skill Match Score และรายชิ้นงาน                                                    |
| `/profile/:username` | Public Profile   | หน้า Profile สาธารณะ แสดง Skills + Badges + Stats + Spotlight Projects                         |
| `/endorse/:token`    | Endorsement Page | หน้ากรอก Endorsement สำหรับคนภายนอกตามโทเคนที่อ้างอิง                                          |

---

## โครงสร้างโปรเจค (Project Structure)

```text
skill-badge-platform/
├── backend/                       # Elysia API Server (Bun Runtime)
│   ├── ai-service/                # AI Microservice (แยก Service เฉพาะทาง)
│   │   └── src/index.ts           # บริการสร้าง Quiz ด้วย Gemini API (Port 3002)
│   ├── src/
│   │   ├── index.ts               # Entry — Elysia app setup, CORS, Rate Limit, Swagger
│   │   ├── controllers/           # Request Handlers
│   │   │   ├── ai.controller.ts           # AI controller for quiz generation
│   │   │   ├── auth.controller.ts         # GitHub OAuth callback, verify token
│   │   │   ├── badges.controller.ts       # Badge retrieval
│   │   │   ├── export.controller.ts       # PDF export placeholder
│   │   │   ├── github.controller.ts       # GitHub sync, repos, dashboard, spotlight
│   │   │   ├── jobs.controller.ts         # Job recommendations, apply
│   │   │   ├── skills.controller.ts       # Skill CRUD + validation
│   │   │   ├── endorsements.controller.ts # Endorsement request, verify, submit, direct
│   │   │   ├── users.controller.ts        # Profile CRUD, search, portfolio
│   │   ├── services/              # Business Logic Layer
│   │   │   ├── ai.service.ts              # AI service calling microservice
│   │   │   ├── auth.service.ts            # Token creation, GitHub OAuth exchange
│   │   │   ├── badges.service.ts          # Badge queries
│   │   │   ├── endorsements.service.ts    # Endorsement logic, auto-mint badge
│   │   │   ├── github.service.ts          # GitHub API integration
│   │   │   ├── firebase.service.ts        # Firebase Admin SDK initialization
│   │   │   ├── jobs.service.ts            # Job matching algorithm
│   │   │   ├── pdf.service.ts             # PDF generation placeholder
│   │   │   ├── skills.service.ts          # Skill CRUD, validation
│   │   │   └── users.service.ts           # User CRUD, search, profile sync
│   │   ├── middleware/            # Auth Middleware
│   │   │   └── auth.middleware.ts         # Firebase token verification middleware
│   │   ├── routes/                # Route Definitions
│   │   │   ├── ai.routes.ts               # AI quiz generation routes
│   │   │   ├── auth.routes.ts             # Authentication routes
│   │   │   ├── badges.routes.ts           # Badge routes
│   │   │   ├── export.routes.ts           # Export routes
│   │   │   ├── github.routes.ts           # GitHub routes
│   │   │   ├── jobs.routes.ts             # Job routes
│   │   │   ├── skills.routes.ts           # Skill routes
│   │   │   └── endorsements.routes.ts     # Endorsement routes
│   │   ├── scripts/               # Utility scripts (e.g., seed-jobs.ts)
│   │   └── utils/                 # Validators, error handlers, cache helpers
│   ├── config/                    # Firebase Service Account JSON
│   └── package.json               # Backend Dependencies
│
├── next-app/                      # Next.js Frontend (App Router)
│   ├── app/                       # App Router Pages
│   │   ├── page.tsx                       # Landing Page
│   │   ├── layout.tsx                     # Root Layout
│   │   ├── globals.css                    # Global CSS + Print Styles
│   │   ├── login/page.tsx                 # Login Page
│   │   ├── signup/page.tsx                # Sign Up Page
│   │   ├── dashboard/page.tsx             # Dashboard (Main Tabs)
│   │   ├── explore/page.tsx               # Developer Search
│   │   ├── jobs/page.tsx                  # Job Recommendations
│   │   ├── profile/[username]/page.tsx    # Public Profile
│   │   └── endorse/[token]/page.tsx       # Endorsement Submission
│   ├── components/
│   │   ├── dashboard/             # Dashboard Components
│   │   │   ├── SidebarLayout.tsx          # Sidebar + Auth redirect layout
│   │   │   ├── Sidebar.tsx                # Navigation sidebar
│   │   │   ├── ProfileCard.tsx            # User avatar + info card
│   │   │   ├── TabNavigation.tsx          # Tab switcher component
│   │   │   ├── EditProfileModal.tsx       # Modal สำหรับแก้ไขโปรไฟล์
│   │   │   └── tabs/                      # Tab Content Components
│   │   │       ├── OverviewTab.tsx            # Stats + Top Skills
│   │   │       ├── SkillsTab.tsx              # Skill Management
│   │   │       ├── EndorsementsTab.tsx         # Endorsement list
│   │   │       ├── GapAnalysisTab.tsx          # Skill gap analysis
│   │   │       └── exportPortfolioTab.tsx      # Export functionality
│   │   └── ui/                    # Reusable UI Components (Button, Card, Alert, etc.)
│   ├── lib/
│   │   ├── services/              # API Client Functions (api.ts, auth.service.ts, etc.)
│   │   ├── context/               # React Context (Auth Context)
│   │   ├── hooks/                 # Custom Hooks (useAuth, useProfileData)
│   │   ├── types/                 # TypeScript type definitions
│   │   └── utils/                 # Utility functions (firebase.ts, validators.ts)
│   └── package.json               # Frontend Dependencies
│
└── ai/                             # (Optional) External AI Research/Services
```

> [!TIP]
> **ทำไมต้องแยก Controller และ Service?**
>
> - **Controller**: มีหน้าที่แค่ "รับงาน" (Request) และ "ส่งคำตอบ" (Response)
> - **Service**: มีหน้าที่ "ทำงาน" (Processing) เช่น การคำนวณหรือติดต่อ Database
>   การแยกแบบนี้ช่วยให้เราเขียน Unit Test ได้ง่ายและแก้โค้ดได้โดยไม่กระทบส่วนอื่น

---

## การติดตั้งและรัน

### 1. Clone โปรเจค

```bash
git clone <repo-url>
cd skill-badge-platform
```

### 2. ตั้งค่า Backend

```bash
cd backend
cp .env.example .env   # แก้ไข env ตามด้านล่าง
bun install
bun run dev            # เริ่ม server ที่ port 8000
```

**Environment Variables (Backend):**

```env
GITHUB_CLIENT_ID=<GitHub OAuth App Client ID>
GITHUB_CLIENT_SECRET=<GitHub OAuth App Client Secret>
FRONTEND_URL=http://localhost:3000
PORT=8000
```

### 3. ตั้งค่า AI Service (Gemini API)

```bash
cd backend/ai-service
cp .env.example .env   # ตั้ง GEMINI_API_KEY
bun install
bun run dev            # เริ่ม AI microservice ที่ port 3002
```

**Environment Variables (AI Service):**

```env
GEMINI_API_KEY=<your-gemini-api-key>
```

### 4. ตั้งค่า Frontend

```bash
cd next-app
cp .env.example .env   # ตั้ง Firebase config
npm install
npm run dev            # เริ่ม dev server ที่ port 3000
```

**Environment Variables (Frontend):**

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_FIREBASE_API_KEY=<your-key>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<your-domain>
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<your-project-id>
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<your-bucket>
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<your-sender-id>
NEXT_PUBLIC_FIREBASE_APP_ID=<your-app-id>
```

### 5. Firebase Setup

1. สร้าง Firebase Project ใน [Firebase Console](https://console.firebase.google.com)
2. เปิดใช้ Authentication → Sign-in methods: Email/Password, Google, GitHub
3. สร้าง Firestore Database
4. Download Service Account JSON → วางที่ `backend/config/`
5. Copy Firebase Client Config → ตั้งค่าใน Frontend `.env`

### 6. GitHub OAuth Setup

1. ไปที่ [GitHub Developer Settings](https://github.com/settings/developers)
2. สร้าง OAuth App ใหม่
3. Homepage URL: `http://localhost:3000`
4. Callback URL: `http://localhost:8000/auth/github/callback`
5. Copy Client ID + Secret → ตั้งค่าใน Backend `.env`

---

## วิธีรัน

```bash
# Terminal 1 — Backend
cd backend
bun run dev

# Terminal 2 — AI Microservice
cd backend/ai-service
bun run dev

# Terminal 3 — Frontend
cd next-app
npm run dev
```

| Service            | URL                           |
| ------------------ | ----------------------------- |
| 🌐 Frontend        | http://localhost:3000         |
| ⚙️ Backend API     | http://localhost:8000         |
| 🤖 AI Microservice | http://localhost:3002         |
| 📖 Swagger Docs    | http://localhost:8000/swagger |

---

## Security Features

| Feature                     | Implementation                                                         |
| --------------------------- | ---------------------------------------------------------------------- |
| **Authentication**          | Firebase Auth — multi-provider (GitHub, Google, Email)                 |
| **API Protection**          | Bearer Token verification middleware ทุก protected route               |
| **Rate Limiting**           | 100 req/min/IP ผ่าน Custom in-memory rate-limiter                      |
| **CORS**                    | จำกัด origin เฉพาะ `FRONTEND_URL`                                      |
| **Input Validation**        | Custom validators ตรวจสอบ body/params ทุก endpoint                     |
| **Token-based Endorsement** | ใช้ crypto random token สำหรับ endorsement link ป้องกันการ endorse ซ้ำ |
| **OAuth2**                  | GitHub + Google OAuth2 flow ผ่าน Firebase                              |

---

## Design Patterns

| Pattern                   | ที่ใช้                                                               |
| ------------------------- | -------------------------------------------------------------------- |
| **MVC**                   | Backend — Controller → Service → Database (Firestore)                |
| **Service Layer**         | Frontend — `lib/services/*.ts` เป็น API client layer แยกจาก UI       |
| **Custom Hooks**          | `useAuth`, `useProfileData`                                          |
| **Component Composition** | Dashboard Tabs แยกเป็น Component อิสระ (OverviewTab, SkillsTab, ...) |
| **Middleware Pattern**    | Backend auth middleware inject `userId` เข้า request context         |

---

## UI/UX Design

- **Dark Theme** — พื้นหลัง Dark (#090d14) + Glassmorphism panels (ในแอปหลักเน้นสไตล์ Premium Clean/Dark Minimal และ Print Styles สำหรับการจัดตำแหน่งกระดาษ A4)
- **Responsive** — ทำงานได้ทุกขนาดหน้าจอ (Desktop + Mobile)
- **Micro-Animations** — Hover effects, transition, scale on click
- **Custom Scrollbar** — สไตล์เข้ากับธีมหลัก
- **Print Styles** — แยก CSS สำหรับ Print/PDF export
- **Color System** — Purple primary (#7c3aed), Green verified (#3fb950), Blue accent (#3b82f6)

---

## License

**This project developed by**

- **Sarit Sridit - Developer**
- **Krittinan Buathong - Developer**
