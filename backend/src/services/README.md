# Services

This directory contains business logic and service layer code.

## Structure
```
services/
├── auth.service.ts       # Authentication business logic
├── user.service.ts       # User management logic
├── badge.service.ts      # Badge management logic
└── ai.service.ts         # AI integration service
```

## Guidelines
- Keep controllers thin, move business logic to services
- Services should be reusable across different controllers
- Handle database operations in services
- Implement error handling and validation
