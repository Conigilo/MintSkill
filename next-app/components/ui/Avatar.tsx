/**
 * Reusable Avatar Component
 */
import { memo } from 'react'
import Image from 'next/image'

interface AvatarProps {
  src?: string
  alt: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  initials?: string
  status?: 'online' | 'offline' | 'away'
}

const sizeMap = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-20 h-20',
  xl: 'w-28 h-28',
}

const Avatar = memo(
  ({ src, alt, size = 'md', initials, status }: AvatarProps) => {
    const sizeClass = sizeMap[size]

    if (src) {
      return (
        <div className={`relative inline-block ${sizeClass} flex-shrink-0`}>
          <Image
            src={src}
            alt={alt}
            fill
            className="rounded-full object-cover border-2 border-slate-200"
          />
          {status && (
            <div
              className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#0d1117] ${
                status === 'online'
                  ? 'bg-green-500'
                  : status === 'away'
                    ? 'bg-yellow-500'
                    : 'bg-gray-500'
              }`}
            />
          )}
        </div>
      )
    }

    return (
      <div
        className={`${sizeClass} flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-slate-900 font-semibold border-2 border-slate-200 flex-shrink-0`}
      >
        {initials || alt.substring(0, 2).toUpperCase()}
      </div>
    )
  },
)

Avatar.displayName = 'Avatar'

export default Avatar
