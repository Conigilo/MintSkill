# Skill Badge Platform - Project Structure

## Overview
โปรเจคแบ่งเป็น 3 ส่วนหลัก:

### 📱 Frontend (`/frontend`)
Next.js 16 application with TypeScript and Tailwind CSS.
- **Tech**: Next.js, React, TypeScript, Tailwind CSS, shadcn/ui
- **Docs**: See [frontend/README.md](frontend/README.md)

### 🔧 Backend (`/backend`)
Express.js API server with TypeScript.
- **Tech**: Node.js, Express, TypeScript, Firebase Admin
- **Docs**: See [backend/README.md](backend/README.md)

### 🤖 AI Services (`/ai`)
Python-based ML services for skill analysis and recommendations.
- **Tech**: Python, FastAPI, scikit-learn
- **Docs**: See [ai/README.md](ai/README.md)

---

## Project Structure

```
skill-badge-platform/
│
├── frontend/                    # Next.js Frontend
│   ├── app/
│   │   ├── page.tsx            # Landing page
│   │   ├── layout.tsx          # Root layout
│   │   ├── globals.css         # Global styles
│   │   ├── api/users/          # API routes
│   │   ├── (auth)/             # Auth routes (login, register)
│   │   ├── (dashboard)/        # Dashboard routes (profile, badges)
│   │   ├── test-firebase/      # Firebase test page
│   │   └── test-users/         # Users API test page
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── layout/             # Layout (navbar, footer)
│   │   └── features/           # Feature components
│   ├── lib/                    # Utilities (firebase, utils)
│   ├── public/                 # Static assets
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.ts
│   └── .env.local              # Firebase config
│
├── backend/                     # Express.js Backend
│   ├── src/
│   │   ├── server.ts           # Entry point
│   │   ├── api/
│   │   │   ├── auth/           # Authentication endpoints
│   │   │   ├── users/          # User management endpoints
│   │   │   └── badges/         # Badge management endpoints
│   │   ├── services/           # Business logic
│   │   └── models/             # TypeScript interfaces
│   ├── config/                 # Firebase Admin config
│   ├── package.json
│   └── tsconfig.json
│
├── ai/                          # Python AI Services
│   ├── services/
│   │   ├── skill-analyzer/     # Skill analysis ML service
│   │   └── badge-recommender/  # Badge recommendation ML service
│   └── requirements.txt        # Python dependencies
│
├── .gitignore
├── README.md
├── PROJECT_STRUCTURE.md
└── skill-wallet-system.md
```

---

## Getting Started

### 1. Frontend
```bash
cd frontend
npm install
npm run dev
```
Visit: http://localhost:3000

### 2. Backend
```bash
cd backend
npm install
npm run dev
```
API: http://localhost:8000

### 3. AI Services
```bash
cd ai
python -m venv venv
venv\Scripts\activate       # Windows
pip install -r requirements.txt
uvicorn main:app --reload
```
API: http://localhost:8001

---

## Environment Variables

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

### Backend (`backend/.env`)
```env
PORT=8000
NODE_ENV=development
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

### AI Services (`ai/.env`)
```env
PORT=8001
FIREBASE_CREDENTIALS_PATH=../backend/config/firebase-admin.json
```
