/**
 * Utility functions for validation and data handling
 */

// Validation Functions
export const validators = {
  isEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  isUrl: (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  },

  isGitHubHandle: (handle: string): boolean => {
    const githubRegex = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,38}[a-zA-Z0-9])?$/
    return githubRegex.test(handle)
  },

  isValidLength: (text: string, min: number = 1, max: number = Infinity): boolean => {
    return text.length >= min && text.length <= max
  },

  isNotEmpty: (value: string | null | undefined): boolean => {
    return !!value && value.trim().length > 0
  },
}

// String Utilities
export const stringUtils = {
  truncate: (text: string, length: number = 50): string => {
    return text.length > length ? `${text.substring(0, length)}...` : text
  },

  capitalize: (text: string): string => {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
  },

  slugify: (text: string): string => {
    return text
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-')
  },

  toTitleCase: (text: string): string => {
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  },

  formatDate: (date: Date | number): string => {
    const d = new Date(date)
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  },

  formatDateTime: (date: Date | number): string => {
    const d = new Date(date)
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  },

  //use timestamp?
  formatRelativeTime: (date: Date | number): string => {
    const d = new Date(date)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - d.getTime()) / 1000)

    if (seconds < 60) return 'just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d ago`
    const weeks = Math.floor(days / 7)
    if (weeks < 4) return `${weeks}w ago`

    return stringUtils.formatDate(d)
  },
}

// Array Utilities
export const arrayUtils = {
  unique: <T,>(array: T[], key?: (item: T) => string): T[] => {
    if (!key) return [...new Set(array)]
    const seen = new Set<string>()
    return array.filter(item => {
      const k = key(item)
      if (seen.has(k)) return false
      seen.add(k)
      return true
    })
  },

  groupBy: <T,>(array: T[], key: (item: T) => string): Record<string, T[]> => {
    return array.reduce((result, item) => {
      const k = key(item)
      if (!result[k]) result[k] = []
      result[k].push(item)
      return result
    }, {} as Record<string, T[]>)
  },

  sortBy: <T, K extends string | number>(array: T[], key: (item: T) => K, order: 'asc' | 'desc' = 'asc'): T[] => {
    const sorted = [...array].sort((a, b) => {
      const aVal = key(a)
      const bVal = key(b)
      if (aVal < bVal) return order === 'asc' ? -1 : 1
      if (aVal > bVal) return order === 'asc' ? 1 : -1
      return 0
    })
    return sorted
  },

  chunk: <T,>(array: T[], size: number): T[][] => {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  },

  flatten: <T,>(array: T[][]): T[] => {
    return array.reduce((flat, item) => flat.concat(item), [])
  },
}

// Object Utilities
export const objectUtils = {
  isEmpty: (obj: Record<string, unknown>): boolean => {
    return Object.keys(obj).length === 0
  },

  pick: <T extends Record<string, unknown>, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
    return keys.reduce((result, key) => {
      result[key] = obj[key]
      return result
    }, {} as Pick<T, K>)
  },

  omit: <T extends Record<string, unknown>, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
    const keySet = new Set(keys)
    const result = Object.entries(obj).reduce((acc: Record<string, unknown>, [key, value]) => {
      if (!keySet.has(key as K)) {
        acc[key] = value
      }
      return acc
    }, {})
    return result as Omit<T, K>
  },

  merge: <T extends Record<string, unknown>>(target: T, source: Partial<T>): T => {
    return { ...target, ...source }
  },
}

// Number Utilities
export const numberUtils = {
  formatNumber: (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num)
  },

  abbreviateNumber: (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  },

  clamp: (num: number, min: number, max: number): number => {
    return Math.max(min, Math.min(max, num))
  },

  percentage: (value: number, total: number): number => {
    return total === 0 ? 0 : Math.round((value / total) * 100)
  },
}

// Debounce & Throttle
export const createDebounce = <T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number,
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

export const createThrottle = <T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number,
): ((...args: Parameters<T>) => void) => {
  let lastTime = 0

  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastTime >= delay) {
      fn(...args)
      lastTime = now
    }
  }
}

// ID Generation
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Error Utilities
export const createError = (
  message: string,
  code: string = 'ERROR',
  status: number = 500,
): Error & { code: string; status: number } => {
  const error = new Error(message) as Error & { code: string; status: number }
  error.code = code
  error.status = status
  return error
}

export const isAxiosError = (error: unknown): boolean => {
  const err = error as Record<string, unknown>
  return !!(err && err.response && err.config && err.request)
}

export const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'string') return error

  const err = error as Record<string, unknown>
  if (err?.message) return err.message as string
  if ((err?.error as Record<string, unknown>)?.message) return (err.error as Record<string, unknown>).message as string
  if (isAxiosError(error)) {
    const axiosErr = error as Record<string, unknown>
    return (
      ((axiosErr.response as Record<string, unknown>)?.data as Record<string, unknown>)?.message as string ||
      (err.message as string) ||
      'An error occurred'
    )
  }
  return 'An unexpected error occurred'
}
