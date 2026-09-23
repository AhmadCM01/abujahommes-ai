import React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

export interface AvatarProps {
  src?: string | null
  alt?: string
  fallback?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'User avatar',
  fallback,
  size = 'md',
  className,
}) => {
  const [imageError, setImageError] = React.useState(false)

  React.useEffect(() => {
    setImageError(false)
  }, [src])

  const sizeStyles = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl font-bold',
  }

  const getInitials = (name?: string) => {
    if (!name) return 'AH'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  return (
    <div
      className={cn(
        'relative rounded-full overflow-hidden shrink-0 flex items-center justify-center font-semibold bg-[#D4E0C8] text-[#2D5A3D] border border-[#EDE0C4] select-none',
        sizeStyles[size],
        className
      )}
    >
      {src && !imageError ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span>{getInitials(fallback || alt)}</span>
      )}
    </div>
  )
}
