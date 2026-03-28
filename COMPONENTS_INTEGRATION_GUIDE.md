## SkillsTab & EndorsementsTab Integration Guide

These components have complex local state management that should be enhanced gradually. Here's how to integrate them with the backend API.

---

## SkillsTab API Integration

### Current State
- Uses local mock data + localStorage
- Quiz verification is local only
- Skills don't get persisted to backend

### Gradual Integration Steps

#### Step 1: Import API Services
```typescript
import { useUserSkills } from '@/hooks/useProfileData'
import { addSkill, updateSkill, deleteSkill } from '@/lib/services/skills.service'
import { getIdToken } from '@/lib/services/auth.service'
import { useAuth } from '@/hooks/useAuth'
```

#### Step 2: Load Skills from Backend on Mount
```typescript
'use client'
import { useState, useEffect } from "react";
import { useUserSkills } from '@/hooks/useProfileData'
import { useAuth } from '@/hooks/useAuth'

export default function SkillsTab() {
  const { user } = useAuth()
  const { skills, isLoading } = useUserSkills(user?.id)
  
  // Now 'skills' comes from API instead of mock data
  // Maintain local state for quiz UI
  const [quizModal, setQuizModal] = useState({ isOpen: false, skillId: null })
  
  // ... rest of component
}
```

#### Step 3: Save Skills on Quiz Success
```typescript
// In handleAnswer function, after quiz is correct:

const handleAnswer = (optionIndex: number, skillName: string, skillId: number) => {
  const quizData = mockQuiz[skillName] || mockQuiz["Default"];

  if (optionIndex === quizData.answer) {
    setQuizStatus("correct");
    
    setTimeout(async () => {
      try {
        const token = await getIdToken()
        if (!token) throw new Error('Not authenticated')
        
        const activeSkill = skills.find(s => s.id === skillId)
        if (activeSkill) {
          // Add skill to backend
          await addSkill(token, {
            name: activeSkill.name,
            category: activeSkill.category,
            level: activeSkill.level
          })
        }
        
        setQuizModal({ isOpen: false, skillId: null })
        setQuizStatus("idle")
      } catch (error) {
        console.error('Failed to save skill:', error)
        // Still close modal, user can try again
      }
    }, 2500);
  } else {
    setQuizStatus("wrong");
    setTimeout(() => setQuizStatus("idle"), 1500);
  }
};
```

#### Step 4: Add Delete Functionality
```typescript
const handleDeleteSkill = async (skillId: string) => {
  if (!window.confirm('Delete this skill?')) return
  
  try {
    const token = await getIdToken()
    if (!token) throw new Error('Not authenticated')
    
    const success = await deleteSkill(token, skillId)
    if (success) {
      // Skill will be removed from API
      // Hook will automatically refetch
    }
  } catch (error) {
    console.error('Failed to delete skill:', error)
  }
}
```

---

## EndorsementsTab API Integration

### Current State
- Uses mock endorsement data
- Request modal doesn't actually submit request
- No link generation for sharing

### Integration Steps

#### Step 1: Import Required Services
```typescript
import { requestEndorsement } from '@/lib/services/endorsements.service'
import { getIdToken } from '@/lib/services/auth.service'
import { useAuth } from '@/hooks/useAuth'
import { useMyEndorsements } from '@/hooks/useProfileData'
```

#### Step 2: Load Real Endorsements
```typescript
'use client'
import { useState } from "react";
import { useMyEndorsements } from '@/hooks/useProfileData'
import { useAuth } from '@/hooks/useAuth'

export default function EndorsementsTab() {
  const { user } = useAuth()
  const { endorsements, isLoading, refetch } = useMyEndorsements()
  
  // Map endorsements to display format
  const endorsementItems = endorsements.map(e => ({
    name: e.endorserName || 'Anonymous',
    role: 'Endorser',
    verified: true,
    timeAgo: new Date(e.createdAt || '').toLocaleDateString(),
    text: `Endorsed your ${e.skill} skill`,
    skills: [e.skill],
    avatarColor: 'bg-blue-500',
    initial: (e.endorserName || 'E').charAt(0)
  }))
  
  // ... rest of component
}
```

#### Step 3: Connect Request Modal to API
```typescript
const handleRequestEndorsement = async () => {
  try {
    setIsLoading(true)
    const token = await getIdToken()
    if (!token) throw new Error('Not authenticated')
    
    const result = await requestEndorsement(token, {
      skillId: requestForm.skillId, // If you capture this
      expiresIn: 604800 // 7 days
    })
    
    if (result) {
      // Show success message with link
      showSuccessMessage(`
        Endorsement link created!
        Share this link: ${result.link}
      `)
      
      // Copy to clipboard
      navigator.clipboard.writeText(result.link)
      
      // Close modal
      setIsRequestModalOpen(false)
      
      // Optionally refetch endorsements
      refetch()
    }
  } catch (error) {
    console.error('Failed to request endorsement:', error)
    showErrorMessage('Failed to create endorsement link')
  } finally {
    setIsLoading(false)
  }
}
```

#### Step 4: Add Copy-to-Clipboard Feature
```typescript
const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    showNotification('Link copied to clipboard!')
  })
}
```

---

## Complete Updated Request Modal Example

```typescript
{isRequestModalOpen && (
  <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
    <div className="bg-[#0d1117] border border-gray-700 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center bg-[#161b22]">
        <h3 className="font-bold text-white">Request Endorsement</h3>
        <button 
          onClick={() => setIsRequestModalOpen(false)} 
          className="text-gray-500 hover:text-white"
        >
          ✕
        </button>
      </div>
      
      <div className="p-6 space-y-5">
        {/* Skill Selection */}
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
            Which skill?
          </label>
          <select
            className="w-full bg-[#090d14] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500"
            value={requestForm.skillId}
            onChange={(e) => setRequestForm({ ...requestForm, skillId: e.target.value })}
          >
            <option value="">Select a skill</option>
            {skills.map(skill => (
              <option key={skill.id} value={skill.id}>
                {skill.name}
              </option>
            ))}
          </select>
        </div>

        {/* Person to ask */}
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
            Person's GitHub username (Optional)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-3 text-gray-500">@</span>
            <input
              type="text"
              placeholder="github-username"
              className="w-full bg-[#090d14] border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-blue-500"
              value={requestForm.recipient}
              onChange={(e) => setRequestForm({ ...requestForm, recipient: e.target.value })}
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleRequestEndorsement}
          disabled={!requestForm.skillId || isLoading}
          className="w-full mt-6 py-3 rounded-xl text-white font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Creating link...' : '✓ Generate Endorsement Link'}
        </button>

        {/* Info Text */}
        <p className="text-xs text-gray-500 text-center">
          A shareable link will be created. You can send it to anyone to ask for endorsement.
        </p>
      </div>
    </div>
  </div>
)}
```

---

## Testing the Integration

### Test Checklist
- [ ] Skills tab loads real skills from API
- [ ] Quiz verification saves skill to backend
- [ ] New verified skills appear in stats
- [ ] Endorsements tab shows real endorsements
- [ ] Request endorsement creates a valid link
- [ ] Share link works and shows available skills
- [ ] Submitting endorsement from link creates badge

---

## Common Issues & Solutions

### Issue: Skills not loading
```typescript
// Debug: Check if user is authenticated
console.log('User:', user)
// Check if API is running
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL)
```

### Issue: Token expired
```typescript
// The getIdToken() function handles refresh automatically
// But ensure auth state is properly managed in useAuth hook
```

### Issue: CORS errors
```typescript
// Ensure backend has proper CORS headers
// Backend should have:
// headers: {
//   'Access-Control-Allow-Origin': 'http://localhost:3000',
//   'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
//   'Access-Control-Allow-Headers': 'Content-Type, Authorization'
// }
```

---

## Performance Optimization

### Add Caching Pattern
```typescript
const cacheRef = useRef<{ skills: Array, timestamp: number }>({ skills: [], timestamp: 0 })

const fetchSkillsWithCache = useCallback(async () => {
  const now = Date.now()
  const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
  
  if (cacheRef.current.timestamp && (now - cacheRef.current.timestamp) < CACHE_DURATION) {
    return cacheRef.current.skills
  }
  
  const data = await fetchUserSkills(user?.id || '')
  cacheRef.current = { skills: data || [], timestamp: now }
  return data
}, [user?.id])
```

### Add Debouncing for Updates
```typescript
import { useCallback } from 'react'

const debouncedUpdateSkill = useCallback(
  debounce((skillId: string, updates: any) => {
    updateSkill(token, skillId, updates)
  }, 1000),
  [token]
)
```
