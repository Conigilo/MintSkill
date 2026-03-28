/**
 * useNotification Hook - Manage temporary notifications
 */

'use client'

import { useState, useCallback } from 'react'
import { generateId } from '@/lib/utils/validators'
import type { Notification, NotificationType } from '@/lib/types'

export const useNotification = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const addNotification = useCallback(
    (
      type: NotificationType,
      message: string,
      duration: number = 5000,
      action?: { label: string; onClick: () => void },
    ) => {
      const id = generateId()
      const notification: Notification = { id, type, message, duration, action }

      setNotifications((prev) => [...prev, notification])

      if (duration > 0) {
        setTimeout(() => {
          removeNotification(id)
        }, duration)
      }

      return id
    },
    [removeNotification],
  )

  const success = useCallback(
    (message: string, duration?: number) => addNotification('success', message, duration),
    [addNotification],
  )

  const error = useCallback(
    (message: string, duration?: number) => addNotification('error', message, duration),
    [addNotification],
  )

  const warning = useCallback(
    (message: string, duration?: number) => addNotification('warning', message, duration),
    [addNotification],
  )

  const info = useCallback(
    (message: string, duration?: number) => addNotification('info', message, duration),
    [addNotification],
  )

  return {
    notifications,
    addNotification,
    removeNotification,
    success,
    error,
    warning,
    info,
  }
}
