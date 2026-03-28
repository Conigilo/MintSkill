/**
 * useFetch Hook - Handle async data fetching with loading and error states
 */

'use client'

import { useState, useEffect, useCallback } from 'react'

interface UseFetchState<T> {
  data: T | null
  isLoading: boolean
  error: Error | null
}

export const useFetch = <T,>(
  url: string | null,
  options?: RequestInit,
): UseFetchState<T> & { refetch: () => Promise<void> } => {
  const [state, setState] = useState<UseFetchState<T>>({
    data: null,
    isLoading: true,
    error: null,
  })

  const fetchData = useCallback(async () => {
    if (!url) {
      setState({ data: null, isLoading: false, error: null })
      return
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await fetch(url, options)

      if (!response.ok) {
        throw new Error(`Fetch failed with status ${response.status}`)
      }

      const data = await response.json()
      setState({ data, isLoading: false, error: null })
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error')
      setState({ data: null, isLoading: false, error: err })
    }
  }, [url, options])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { ...state, refetch: fetchData }
}
