# API Test Reference — JSON ตัวอย่างสำหรับเทสแต่ละ Endpoint

**Base URL**: `http://localhost:8000`  
**Swagger UI**: `http://localhost:8000/swagger`

> [!TIP]
> สามารถไปเทสผ่าน Swagger UI ได้เลย หรือจะใช้ curl / Postman ก็ได้

---

## 🟢 Health Check

```
GET /health
```
ไม่ต้องส่ง body — แค่เรียกเฉยๆ

---

## 🔐 Auth

### 1. GitHub OAuth Callback
```
POST /auth/github/callback
```
```json
{
  "code": "abc123def456"
}
```
> `code` ได้มาจาก GitHub OAuth redirect — ต้องเป็น code จริงถึงจะ pass

### 2. Verify Token
```
POST /auth/verify
```
**Header**:
```
Authorization: Bearer <Firebase_ID_Token>
```
ไม่ต้องส่ง body

### 3. Logout
```
DELETE /auth/logout
```
**Header**:
```
Authorization: Bearer <Firebase_ID_Token>
```
ไม่ต้องส่ง body

---

## 👤 Users

### 4. Get My Profile
```
GET /users/me
```
**Header**:
```
Authorization: Bearer <Firebase_ID_Token>
```

### 5. Update My Profile
```
PUT /users/me
```
**Header**:
```
Authorization: Bearer <Firebase_ID_Token>
```
```json
{
  "displayName": "John Doe",
  "title": "Full Stack Developer",
  "bio": "I love coding with TypeScript and Bun",
  "location": "Bangkok, Thailand",
  "linkedinUrl": "https://linkedin.com/in/johndoe"
}
```
> ส่งเฉพาะ field ที่ต้องการแก้ก็ได้ ไม่ต้องส่งครบทุกตัว เช่น:
```json
{
  "bio": "Updated bio only"
}
```

### 6. Get Public Profile
```
GET /users/{username}
```
ไม่ต้อง login — เปลี่ยน `{username}` เป็น username จริง เช่น `/users/johndoe`

### 7. Get Portfolio (CV/Resume)
```
GET /users/{username}/portfolio
```
ไม่ต้อง login — ดึงข้อมูลครบทุกอย่าง (profile + skills + badges + repos + endorsements)

---

## 🛠 Skills

### 8. Get Skills by User
```
GET /skills/{userId}
```
เปลี่ยน `{userId}` เป็น uid จริง เช่น `/skills/gh_12345678`

### 9. Add Skill
```
POST /skills/
```
**Header**:
```
Authorization: Bearer <Firebase_ID_Token>
```
```json
{
  "name": "TypeScript",
  "category": "language",
  "level": 3
}
```
> `level` = 1-5 (ถ้าไม่ใส่จะเป็น 1)  
> `category` ตัวอย่าง: `"language"`, `"framework"`, `"tool"`, `"soft-skill"`

### 10. Update Skill
```
PUT /skills/{skillId}
```
**Header**:
```
Authorization: Bearer <Firebase_ID_Token>
```
```json
{
  "name": "TypeScript",
  "category": "language",
  "level": 4
}
```
> ส่งเฉพาะ field ที่ต้องการแก้ก็ได้

### 11. Delete Skill
```
DELETE /skills/{skillId}
```
**Header**:
```
Authorization: Bearer <Firebase_ID_Token>
```
ไม่ต้องส่ง body

---

## 🤝 Endorsements

### 12. Request Endorsement
```
POST /endorsements/request
```
**Header**:
```
Authorization: Bearer <Firebase_ID_Token>
```
```json
{
  "recipientName": "Jane Smith",
  "recipientEmail": "jane@example.com"
}
```
> `recipientEmail` เป็น optional — ยังไม่ได้ส่ง email จริง (TODO)  
> Response จะได้ link กลับมา เช่น `http://localhost:3000/endorse/abc123...`

### 13. Verify Endorsement Token
```
GET /endorsements/verify/{token}
```
ไม่ต้อง login — ใส่ `token` ที่ได้จากข้อ 12

### 14. Submit Endorsement
```
POST /endorsements/submit/{token}
```
ไม่ต้อง login — ใส่ `token` ที่ได้จากข้อ 12
```json
{
  "fromName": "Jane Smith",
  "fromRole": "Senior Developer at Google",
  "fromAvatarUrl": "https://example.com/avatar.jpg",
  "message": "John is an excellent TypeScript developer with great problem-solving skills.",
  "skills": ["TypeScript", "React"]
}
```
> `skills` = array ของ skill name ที่ต้องการ endorse  
> `fromRole` และ `fromAvatarUrl` เป็น optional  
> ถ้า skill ได้ 3 endorsements → auto-mint badge!

### 15. Get My Endorsements
```
GET /endorsements/{userId}
```
**Header**:
```
Authorization: Bearer <Firebase_ID_Token>
```
> ต้องเป็น owner เท่านั้น (uid ต้อง match กับ `{userId}`)

---

## 🐙 GitHub

### 16. Sync GitHub Data
```
POST /github/sync
```
**Header**:
```
Authorization: Bearer <Firebase_ID_Token>
```
ไม่ต้องส่ง body — ระบบจะดึง repos + contributions จาก GitHub API อัตโนมัติ

### 17. Get GitHub Repos
```
GET /github/repos
```
**Header**:
```
Authorization: Bearer <Firebase_ID_Token>
```

### 18. Get Dashboard Data
```
GET /github/dashboard
```
**Header**:
```
Authorization: Bearer <Firebase_ID_Token>
```
> ดึงข้อมูลครบในครั้งเดียว: profile + github stats + skills + repos + endorsements

---

## 🏅 Badges

### 19. Get User Badges
```
GET /badges/{userId}
```
ไม่ต้อง login — เปลี่ยน `{userId}` เป็น uid จริง

---

## ⚡ วิธีได้ Bearer Token สำหรับเทส

1. เรียก `POST /auth/github/callback` ด้วย GitHub OAuth code → ได้ `customToken`
2. ใช้ `customToken` แลก Firebase ID Token ในฝั่ง frontend ผ่าน `signInWithCustomToken()`
3. เอา ID Token มาใส่ Header: `Authorization: Bearer <ID_Token>`

> [!IMPORTANT]
> **ถ้าเทสแค่ public endpoints ไม่ต้อง login:**
> - `GET /users/{username}`
> - `GET /users/{username}/portfolio`
> - `GET /skills/{userId}`
> - `GET /badges/{userId}`
> - `GET /endorsements/verify/{token}`
> - `POST /endorsements/submit/{token}`
