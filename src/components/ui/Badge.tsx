import React from 'react'
import { cn } from '@/lib/utils'
import { FraudRiskLevel, MarketTier, PriceConfidence } from '@/types'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'default'
    | 'olive'
    | 'amber'
    | 'sand'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | 'outline'
  risk?: FraudRiskLevel
  tier?: MarketTier
  confidence?: PriceConfidence
  size?: 'sm' | 'md'
  dot?: boolean
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  risk,
  tier,
  confidence,
  size = 'md',
  dot = false,
  children,
  ...props
}) => {
  let computedVariant = variant
  let label = children

  if (risk) {
    switch (risk) {
      case 'low':
        computedVariant = 'success'
        label = label || 'Low Risk'
        break
      case 'medium':
        computedVariant = 'warning'
        label = label || 'Proceed with caution'
        break
      case 'high':
        computedVariant = 'danger'
        label = label || 'High Risk'
        break
      case 'critical':
        computedVariant = 'danger'
        label = label || 'Critical Risk'
        break
    }
  }

  if (tier) {
    switch (tier) {
      case 'Premium':
        computedVariant = 'amber'
        label = label || 'Premium District'
        break
      case 'Prime':
        computedVariant = 'olive'
        label = label || 'Prime District'
        break
      case 'Mid':
        computedVariant = 'sand'
        label = label || 'Mid-Market'
        break
      case 'Emerging':
        computedVariant = 'default'
        label = label || 'Emerging'
        break
      default:
        computedVariant = 'default'
        label = label || tier
        break
    }
  }

  if (confidence) {
    switch (confidence) {
      case 'high':
        computedVariant = 'success'
        label = label || 'High Confidence'
        break
      case 'medium':
        computedVariant = 'warning'
        label = label || 'Medium Confidence'
        break
      case 'low':
        computedVariant = 'danger'
        label = label || 'Low Confidence'
        break
    }
  }

  const variantStyles = {
    default: 'bg-[#F5EDD6] text-[#5C5C5C] border border-[#D6C9A8]',
    olive: 'bg-[#F0F4EC] text-[#2D5A3D] border border-[#A8C192]',
    amber: 'bg-[#FDF8EC] text-[#A67A1E] border border-[#F0CC77]',
    sand: 'bg-[#FDFAF4] text-[#A8895A] border border-[#EDE0C4]',
    success: 'bg-[#E8F5EF] text-[#2D6A4F] border border-[#A8D5BE]',
    warning: 'bg-[#FDF8EC] text-[#C9962A] border border-[#F0CC77]',
    danger: 'bg-[#FEE2E2] text-[#C1121F] border border-[#FCA5A5]',
    info: 'bg-[#DBEAFE] text-[#1D4ED8] border border-[#93C5FD]',
    outline: 'bg-transparent text-[#1A1A1A] border border-[#D6C9A8]',
  }

  const dotColors = {
    default: 'bg-[#5C5C5C]',
    olive: 'bg-[#2D5A3D]',
    amber: 'bg-[#C9962A]',
    sand: 'bg-[#A8895A]',
    success: 'bg-[#2D6A4F]',
    warning: 'bg-[#C9962A]',
    danger: 'bg-[#C1121F]',
    info: 'bg-[#1D4ED8]',
    outline: 'bg-[#1A1A1A]',
  }

  const sizeStyles = {
    sm: 'h-6 px-2 text-[11px] font-semibold gap-1',
    md: 'h-7 px-2.5 text-xs font-semibold gap-1.5',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full tracking-wide select-none',
        variantStyles[computedVariant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn('w-1.5 h-1.5 rounded-full inline-block shrink-0', dotColors[computedVariant])}
        />
      )}
      {label}
    </span>
  )
}
