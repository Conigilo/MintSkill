/**
 * Reusable Alert/Error Message Component
 */
import { memo } from 'react'

type AlertType = 'error' | 'success' | 'warning' | 'info'

interface AlertProps {
  type: AlertType
  message: string
  title?: string
  onClose?: () => void
}

const styleMap: Record<AlertType, { bg: string; border: string; text: string; icon: string }> = {
  error: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-300',
    icon: '❌',
  },
  success: {
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    text: 'text-green-300',
    icon: '✅',
  },
  warning: {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    text: 'text-yellow-300',
    icon: '⚠️',
  },
  info: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-300',
    icon: 'ℹ️',
  },
}

const Alert = memo(({ type, message, title, onClose }: AlertProps) => {
  const styles = styleMap[type]

  return (
    <div className={`${styles.bg} border-l-4 ${styles.border} px-4 py-3 rounded-md flex items-start gap-3`}>
      <span className="text-xl mt-0.5">{styles.icon}</span>
      <div className="flex-1">
        {title && <h3 className={`text-sm font-semibold ${styles.text} mb-1`}>{title}</h3>}
        <p className={`text-sm ${styles.text}`}>{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={`text-xl leading-none ${styles.text} hover:opacity-70 transition-opacity`}
        >
          ×
        </button>
      )}
    </div>
  )
})

Alert.displayName = 'Alert'

export default Alert
