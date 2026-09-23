import React from 'react'
import { cn } from '@/lib/utils'
import { Button, ButtonProps } from './Button'

export interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  actionVariant?: ButtonProps['variant']
  className?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  actionVariant = 'primary',
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 md:p-12 text-center rounded-xl bg-white border border-[#D6C9A8] max-w-lg mx-auto shadow-sm',
        className
      )}
    >
      {icon && (
        <div className="w-14 h-14 rounded-full bg-[#F0F4EC] text-[#2D5A3D] flex items-center justify-center mb-4 text-2xl">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-bold text-[#1A1A1A] mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-[#5C5C5C] max-w-sm mb-6 leading-relaxed">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button variant={actionVariant} onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
