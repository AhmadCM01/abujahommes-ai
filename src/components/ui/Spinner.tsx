import React from 'react'
import { cn } from '@/lib/utils'

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className }) => {
  const sizeMap = {
    sm: 'w-4 h-4 border-2',
    md: 'w-5 h-5 border-2',
    lg: 'w-8 h-8 border-3',
  }

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-current border-t-transparent inline-block shrink-0',
        sizeMap[size],
        className
      )}
      role="status"
      aria-label="Loading"
    />
  )
}
