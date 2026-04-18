import { useState, useEffect, useCallback } from 'react'
import { 
  fetchUserSkills as fetchSkillsFromAPI, 
  type Skill 
} from '@/lib/services/skills.service'
import { type Badge, fetchUserBadges as fetchBadgesFromAPI } from '@/lib/services/badges.service';
import { type Endorsement, fetchMyEndorsements as fetchEndorsementsFromAPI } from '@/lib/services/endorsements.service';
import { useAuth } from './useAuth'

/**
 * Hook to fetch user's skills
 */
export const useUserSkills = (userId?: string) => {
  const [skills, setSkills] = useState<Skill[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    const fetchSkills = async () => {
      if (!userId && !user?.uid) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const data = await fetchSkillsFromAPI(userId || user?.uid || '')
        setSkills(data || [])
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch skills')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSkills()
  }, [userId, user?.uid])

  return { skills, isLoading, error }
}

/**
 * Hook to fetch user's badges
 */
export const useUserBadges = (userId?: string) => {
  const [badges, setBadges] = useState<Badge[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    const fetchBadges = async () => {
      if (!userId && !user?.uid) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const data = await fetchBadgesFromAPI(userId || user?.uid || '')
        setBadges(data || [])
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch badges')
      } finally {
        setIsLoading(false)
      }
    }

    fetchBadges()
  }, [userId, user?.uid])

  return { badges, isLoading, error }
}

/**
 * Hook to fetch user's endorsements
 */
export const useMyEndorsements = () => {
  const [endorsements, setEndorsements] = useState<Endorsement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const userId = user?.uid

  const fetchEndorsements = useCallback(async (background = false) => {
    if (!userId) {
      if (!background) setIsLoading(false)
      return
    }

    if (!background) setIsLoading(true)
    try {
      // fetchAPI handles the token automatically
      const data = await fetchEndorsementsFromAPI()
      setEndorsements(data || [])
      setError(null)
    } catch (err) {
      if (!background) setError(err instanceof Error ? err.message : 'Failed to fetch endorsements')
    } finally {
      if (!background) setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchEndorsements()
    // 🔔 Real-time Background Polling every 5 seconds
    const interval = setInterval(() => {
      fetchEndorsements(true)
    }, 5000)
    
    return () => clearInterval(interval)
  }, [fetchEndorsements])

  return { endorsements, isLoading, error, refetch: () => fetchEndorsements(false) }
}
