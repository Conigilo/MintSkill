# Backend - Skill Badge Platform

## Overview
Backend API server for the Skill Badge Platform.

## Tech Stack
- **Runtime**: Node.js / Bun (TBD)
- **Framework**: Express.js / Fastify (TBD)
- **Language**: TypeScript
- **Database**: Firebase Firestore
- **Authentication**: Firebase Admin SDK
- **API Style**: RESTful / GraphQL (TBD)

## Folder Structure
```
backend/
├── src/
│   ├── api/              # API endpoints
│   │   ├── auth/        # Authentication routes
│   │   ├── users/       # User management
│   │   └── badges/      # Badge management
│   ├── services/        # Business logic
│   ├── models/          # Data models & types
│   ├── middleware/      # Express middleware
│   └── utils/           # Utilities
├── config/              # Configuration files
└── server.ts            # Entry point
```

## Getting Started

### Install Dependencies
```bash
npm install
```

### Environment Variables
Create a `.env` file:
```
PORT=8000
NODE_ENV=development
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
npm start
```

## API Endpoints (Planned)

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `GET /api/users/:id/badges` - Get user badges

### Badges
- `GET /api/badges` - Get all badges
- `GET /api/badges/:id` - Get badge details
- `POST /api/badges/:id/claim` - Claim a badge
