/**
 * Reusable Loading Spinner Component
 */
import { memo } from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
}

const LoadingSpinner = memo(({ size = 'md', label }: LoadingSpinnerProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`animate-spin rounded-full border-2 border-gray-700 border-t-blue-500 ${sizeMap[size]}`} />
      {label && <p className="text-sm text-gray-400">{label}</p>}
    </div>
  )
})

LoadingSpinner.displayName = 'LoadingSpinner'

export default LoadingSpinner
