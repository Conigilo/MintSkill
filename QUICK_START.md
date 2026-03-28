# Quick Start Guide - Testing Backend Integration

สำหรับการทดสอบระบบที่เชื่อมต่อแล้ว นี่คือขั้นตอนเร็วๆ

## 1️⃣ Setup Environment (.env.local)

สร้างไฟล์ `next-app/.env.local`:

```env
# Firebase Config (ดูใน Firebase Console)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=web-pro-261e6.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=web-pro-261e6

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## 2️⃣ Install Dependencies

```bash
# Frontend
cd next-app
npm install

# Backend 
cd backend
npm install
# or
bun install
```

## 3️⃣ Start Services

Terminal 1 - Backend:
```bash
cd backend
npm run dev
# or
bun run dev
```

Terminal 2 - Frontend:
```bash
cd next-app
npm run dev
```

## 4️⃣ Test Each Feature

### ✅ Login (Already Working)
- Go to `http://localhost:3000/login`
- Click "Sign in with GitHub"
- Should redirect to dashboard after auth

### ✅ Dashboard Overview (NEW - WORKING)
- Click "Profile" in sidebar
- Stats should show real data from backend:
  - VERIFIED SKILLS = actual skill count
  - ENDORSEMENTS = actual endorsement count
  - CONTRIBUTIONS = from profile
  - PROJECTS = from profile
- Top Skills section shows real skills from API

**Expected Output:**
```
VERIFIED SKILLS: 3
ENDORSEMENTS: 5
CONTRIBUTIONS: 127
PROJECTS: 2
```

### ✅ Explore Developers (NEW - WORKING)
- Click "Explore" in sidebar
- Should show list of developers from backend
- Try searching by skill name
- Click on any developer to see profile
- Shows skill match percentage

**Test Search:**
- Type "React" in search box
- Should filter developers with React skill

### ⏳ Skill-Matched Jobs (UI Ready, Backend Needed)
- Click "Jobs" tab
- Page loads with filters
- **Will show empty until backend creates /jobs/recommendations endpoint**
- Button "Highly Recommended" will work once backend is ready

### ⏳ Skills Tab (Partial Integration)
- Click "Skills" tab on dashboard
- See mock skills with quiz verification
- Pass the quiz = skill marked as verified
- **Will save to backend once fully integrated**

### ⏳ Endorsements Tab (Partial Integration)
- Click "Endorsements" tab on dashboard
- See received endorsements
- Click "+ Request New" button
- Form is ready to connect to API (see COMPONENTS_INTEGRATION_GUIDE.md)

---

## 5️⃣ API Testing (For Developers)

### Test Skills API
```bash
# Get user skills
curl http://localhost:3001/api/skills/USER_ID

# Add skill (needs Bearer token)
curl -X POST http://localhost:3001/api/skills \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"React","category":"Frameworks","level":8}'
```

### Test Badges API
```bash
curl http://localhost:3001/api/badges/USER_ID
```

### Test Users/Me (Will Be Added)
```bash
# This will be created in next step
curl http://localhost:3001/api/users/me \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

---

## 6️⃣ What Works Right Now ✅

| Feature | Status | Location |
|---------|--------|----------|
| GitHub Login | ✅ Working | /login → /dashboard |
| Dashboard Stats | ✅ Real Data | Dashboard → Overview Tab |
| Top Skills Display | ✅ Real Data | Dashboard → Overview Tab |
| Badges Display | ✅ Real Data | Dashboard → Overview Tab |
| Explore Developers | ✅ Real Data | Sidebar → Explore |
| Developer Search | ✅ Working | Explore page search box |
| Skills Tab Quiz | ✅ Working | Dashboard → Skills Tab |
| Endorsements Display | ✅ Working | Dashboard → Endorsements Tab |

## 7️⃣ What Still Needs Backend ❌

| Feature | Status | Backend Endpoint Needed |
|---------|--------|------------------------|
| Job Recommendations | ⏳ UI Only | GET /api/jobs/recommendations |
| Explore Search | ⏳ Partial | GET /api/users/search |
| User Profile Update | ⏳ Limited | PUT /api/users/me |

---

## 8️⃣ Debugging Tips 🔧

### Check API Connection
Open browser console (F12) and check:
```javascript
// In console, test if API is reachable
fetch('http://localhost:3001/api/skills/test')
  .then(r => r.json())
  .then(d => console.log(d))
```

### Check Firebase Token
```javascript
// In any component
import { getIdToken } from '@/lib/services/auth.service'
const token = await getIdToken()
console.log('Token:', token)
```

### Check Environment Variables
```javascript
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL)
console.log('Firebase Project:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)
```

### Check Network Requests
- Open DevTools → Network tab
- Filter by "XHR" to see API calls
- Check response status and data
- Look for CORS errors

---

## 9️⃣ Common Issues & Solutions

### Issue: "Failed to fetch user skills"
**Solution:**
```
1. Check if backend is running on :3001
2. Check NEXT_PUBLIC_API_URL in .env.local
3. Check browser console for CORS errors
4. Verify user is authenticated (check Firebase)
```

### Issue: Services not found
**Solution:**
```typescript
// Make sure imports are correct
import { fetchUserSkills } from '@/lib/services/skills.service'
// NOT
import { fetchUserSkills } from '@/services/skills.service'
```

### Issue: "Not authenticated" errors
**Solution:**
```javascript
// Firebase token might be expired
// The getIdToken() function handles refresh, but verify:
const { user } = useAuth()
console.log('User:', user) // Should not be null
```

---

## 🔟 Next Phase - Backend Completion

Once backend team creates the 6 missing endpoints:

1. Jobs page will show real recommendations
2. Explore search will be full-featured
3. User can edit profile
4. Full end-to-end integration complete

See `API_INTEGRATION_GUIDE.md` for backend implementation details.

---

## Quick Checklist ✨

Run through this to verify integration is working:

- [ ] Set up .env.local with Firebase keys
- [ ] Backend running on localhost:3001
- [ ] Frontend running on localhost:3000
- [ ] Can login with GitHub
- [ ] Dashboard shows real stats (not mock data)
- [ ] Can see real skills in Dashboard
- [ ] Can see developers in Explore
- [ ] Can search developers
- [ ] Endorsements display correctly
- [ ] Skills quiz verification works

If all boxes are checked ✅ → **Integration is working!**

---

## Support Resources

📄 **API_INTEGRATION_GUIDE.md** - Backend implementation spec
📄 **COMPONENTS_INTEGRATION_GUIDE.md** - Frontend component guide
📄 **INTEGRATION_SUMMARY.md** - Overall status and architecture

For issues:
1. Check browser console for errors
2. Check network tab for API responses
3. Check terminal output for backend errors
4. See debugging tips above
