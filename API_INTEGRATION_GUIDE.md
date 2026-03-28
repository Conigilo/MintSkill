# API Integration Guide for Backend

This document outlines all the API endpoints expected by the frontend, with their request/response formats.

## Authentication

All protected endpoints require:
```
Authorization: Bearer {firebaseIdToken}
```

The Firebase ID token is obtained from Firebase Authentication and sent with each request.

## Base URL
```
http://localhost:3001/api
```

---

## 1. Users (Profile & Portfolio)

### GET /users/me
Get current logged-in user's profile

**Headers:**
```
Authorization: Bearer {idToken}
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "data": {
    "id": "user-123",
    "uid": "firebase-uid",
    "email": "user@example.com",
    "displayName": "John Doe",
    "photoURL": "https://...",
    "title": "Full Stack Developer",
    "bio": "Passionate developer...",
    "location": "Bangkok, Thailand",
    "linkedinUrl": "https://linkedin.com/in/johndoe",
    "contributions": 420,
    "projects": ["project1", "project2"],
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "success": true
}
```

### PUT /users/me
Update current user's profile

**Headers:**
```
Authorization: Bearer {idToken}
Content-Type: application/json
```

**Request Body:**
```json
{
  "displayName": "John Updated",
  "title": "Senior Full Stack Developer",
  "bio": "Updated bio",
  "location": "Chiang Mai, Thailand",
  "linkedinUrl": "https://linkedin.com/in/johndoe"
}
```

**Response (200 OK):**
```json
{
  "data": {
    "id": "user-123",
    ...updated fields...
  },
  "success": true
}
```

### GET /users/search
Search for developers with filtering

**Query Parameters:**
- `q` (optional): Search query string
- `skills` (optional, repeatable): Filter by skills - `?skills=React&skills=TypeScript`
- `minEndorsements` (optional): Minimum endorsement count
- `limit` (optional, default=20): Number of results
- `offset` (optional, default=0): Pagination offset

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "user-456",
      "displayName": "Jane Developer",
      "photoURL": "https://...",
      "title": "Frontend Engineer",
      "bio": "React specialist",
      "matchScore": 85,
      "topSkills": [
        { "name": "React", "level": 9, "verified": true },
        { "name": "TypeScript", "level": 8, "verified": true }
      ],
      "endorsements": 24
    }
  ],
  "success": true
}
```

---

## 2. Skills

### GET /skills/:userId
Get all skills for a user

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "skill-1",
      "name": "JavaScript",
      "category": "Languages",
      "level": 8,
      "endorsed": true,
      "endorsementCount": 3,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "success": true
}
```

### POST /skills
Add a new skill

**Headers:**
```
Authorization: Bearer {idToken}
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "React",
  "category": "Frameworks",
  "level": 7
}
```

**Response (201 Created):**
```json
{
  "data": {
    "id": "skill-new",
    "name": "React",
    "category": "Frameworks",
    "level": 7
  },
  "success": true
}
```

### PUT /skills/:skillId
Update an existing skill

**Headers:**
```
Authorization: Bearer {idToken}
Content-Type: application/json
```

**Request Body:**
```json
{
  "level": 8,
  "name": "React.js"
}
```

### DELETE /skills/:skillId
Delete a skill

**Headers:**
```
Authorization: Bearer {idToken}
```

**Response (200 OK):**
```json
{
  "success": true
}
```

---

## 3. Badges

### GET /badges/:userId
Get all badges for a user

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "badge-1",
      "name": "React Expert",
      "description": "Earned 3+ endorsements for React",
      "icon": "🏆",
      "color": "gold",
      "category": "Frontend",
      "requiredSkills": ["React"],
      "earnedAt": "2024-06-15T14:20:00Z",
      "endorsementCount": 5
    }
  ],
  "success": true
}
```

---

## 4. Endorsements

### POST /endorsements/request
Request an endorsement link (currently logged-in user asking for endorsements)

**Headers:**
```
Authorization: Bearer {idToken}
Content-Type: application/json
```

**Request Body (optional):**
```json
{
  "skillId": "skill-123",
  "expiresIn": 604800
}
```

**Response (200 OK):**
```json
{
  "data": {
    "token": "unique-token-123",
    "link": "https://skill-wallet.com/endorse?token=unique-token-123",
    "expiresAt": "2024-12-25T00:00:00Z"
  },
  "success": true
}
```

### GET /endorsements/verify/:token
Verify if an endorsement token is valid (public endpoint)

**Response (200 OK):**
```json
{
  "data": {
    "valid": true,
    "availableSkills": ["JavaScript", "React", "Node.js"],
    "userInfo": {
      "displayName": "John Doe",
      "photoURL": "https://..."
    }
  },
  "success": true
}
```

### POST /endorsements/submit/:token
Submit an endorsement via link (public endpoint)

**Request Body:**
```json
{
  "skillId": "skill-123",
  "endorserName": "Jane Endorser"
}
```

**Response (200 OK):**
```json
{
  "data": {
    "success": true,
    "badgeEarned": true,
    "badgeName": "React Expert"
  },
  "success": true
}
```

### GET /endorsements/:userId
Get all endorsements for a user

**Headers:**
```
Authorization: Bearer {idToken}
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "endorsement-1",
      "skill": "React",
      "endorsedBy": "user-456",
      "endorserName": "Jane Developer",
      "createdAt": "2024-11-20T10:00:00Z",
      "status": "verified"
    }
  ],
  "success": true
}
```

---

## 5. Jobs (NEW - To be implemented)

### GET /jobs/recommendations
Get personalized job recommendations based on user's skills

**Headers:**
```
Authorization: Bearer {idToken}
```

**Query Parameters:**
- `location` (optional): Filter by location
- `minMatchScore` (optional): Minimum match percentage
- `skills` (optional, repeatable): Specific skills to match
- `limit` (optional, default=20): Number of recommendations

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "job-1",
      "title": "Senior React Developer",
      "company": "Tech Corp",
      "location": "Bangkok, Thailand",
      "salary": "฿100,000 - ฿150,000",
      "description": "We're looking for a senior React developer...",
      "requiredSkills": ["React", "TypeScript", "Node.js"],
      "preferredSkills": ["GraphQL", "AWS"],
      "matchScore": 92,
      "matchStatus": "Highly Recommended",
      "postedAt": "2024-11-20T00:00:00Z",
      "link": "https://job-board.com/job/1"
    }
  ],
  "success": true
}
```

### GET /jobs
Get all available jobs with optional filters

**Query Parameters:**
- `location` (optional): Filter by location
- `skills` (optional, repeatable): Filter by required skills
- `limit` (optional, default=20): Number of results
- `offset` (optional, default=0): Pagination offset

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "job-1",
      "title": "Backend Developer",
      "company": "StartUp XYZ",
      ...same fields as /jobs/recommendations...
    }
  ],
  "success": true
}
```

### POST /jobs/:jobId/apply
Apply for a specific job

**Headers:**
```
Authorization: Bearer {idToken}
Content-Type: application/json
```

**Request Body:**
```json
{
  "coverLetter": "I'm very interested in this position..."
}
```

**Response (200 OK):**
```json
{
  "data": {
    "applied": true,
    "applicationId": "app-123"
  },
  "success": true
}
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid or expired token",
  "error": "unauthorized"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found",
  "error": "not_found"
}
```

### 400 Bad Request
```json
{
  "success": false,
  "message": "Invalid input data",
  "error": "validation_error",
  "details": {
    "name": "Name is required"
  }
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "server_error"
}
```

---

## Implementation Checklist

### Must Implement
- [ ] GET /users/me
- [ ] PUT /users/me
- [ ] GET /users/search
- [ ] GET /jobs/recommendations
- [ ] GET /jobs
- [ ] POST /jobs/:jobId/apply

### Already Implemented (Verify)
- [ ] GET /skills/:userId
- [ ] POST /skills
- [ ] PUT /skills/:skillId
- [ ] DELETE /skills/:skillId
- [ ] GET /badges/:userId
- [ ] POST /endorsements/request
- [ ] GET /endorsements/verify/:token
- [ ] POST /endorsements/submit/:token
- [ ] GET /endorsements/:userId

---

## Testing Recommendations

1. Use Postman/Insomnia with Firebase ID token
2. Test all error scenarios (401, 404, 400)
3. Verify response structures match exactly
4. Test pagination with various limit/offset values
5. Test search/filter functionality thoroughly
6. Validate JWT token handling and expiration
