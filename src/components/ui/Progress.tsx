import React from 'react'
import { cn } from '@/lib/utils'

export interface ProgressProps {
  value: number
  max?: number
  variant?: 'olive' | 'amber' | 'risk'
  height?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  variant = 'olive',
  height = 'md',
  showLabel = false,
  className,
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))

  const heightStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  }

  const getVariantBg = () => {
    if (variant === 'risk') {
      if (percentage > 70) return 'bg-[#C1121F]'
      if (percentage > 40) return 'bg-[#C9962A]'
      return 'bg-[#2D6A4F]'
    }
    if (variant === 'amber') return 'bg-[#C9962A]'
    return 'bg-[#2D5A3D]'
  }

  return (
    <div className={cn('w-full flex flex-col gap-1.5', className)}>
      {showLabel && (
        <div className="flex justify-between text-xs font-semibold text-[#5C5C5C]">
          <span>Progress</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div
        className={cn(
          'w-full bg-[#EDE0C4] rounded-full overflow-hidden',
          heightStyles[height]
        )}
      >
        <div
          className={cn('h-full transition-all duration-300 rounded-full', getVariantBg())}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
