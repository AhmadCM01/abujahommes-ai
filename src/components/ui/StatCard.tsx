import React from 'react'
import { Card } from './Card'
import { cn } from '@/lib/utils'

export interface StatCardProps {
  label: string
  value: string | number
  subValue?: string
  trend?: string
  trendDirection?: 'up' | 'down' | 'neutral'
  icon?: React.ReactNode
  iconBg?: 'olive' | 'amber' | 'sand' | 'danger'
  className?: string
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subValue,
  trend,
  trendDirection = 'up',
  icon,
  iconBg = 'olive',
  className,
}) => {
  const iconBgStyles = {
    olive: 'bg-[#F0F4EC] text-[#2D5A3D]',
    amber: 'bg-[#FDF8EC] text-[#C9962A]',
    sand: 'bg-[#FDFAF4] text-[#A8895A]',
    danger: 'bg-[#FEE2E2] text-[#C1121F]',
  }

  return (
    <Card elevation="1" hoverEffect className={cn('p-5 flex flex-col justify-between', className)}>
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#5C5C5C]">
          {label}
        </span>
        {icon && (
          <div
            className={cn(
              'w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0',
              iconBgStyles[iconBg]
            )}
          >
            {icon}
          </div>
        )}
      </div>
      <div className="mt-3">
        <div className="text-2xl font-bold text-[#1A1A1A] tracking-tight">{value}</div>
        {(subValue || trend) && (
          <div className="flex items-center gap-2 mt-1">
            {trend && (
              <span
                className={cn(
                  'text-xs font-bold px-1.5 py-0.5 rounded',
                  trendDirection === 'up' && 'text-[#2D6A4F] bg-[#E8F5EF]',
                  trendDirection === 'down' && 'text-[#C1121F] bg-[#FEE2E2]',
                  trendDirection === 'neutral' && 'text-[#5C5C5C] bg-[#EDE0C4]'
                )}
              >
                {trend}
              </span>
            )}
            {subValue && (
              <span className="text-xs text-[#5C5C5C] truncate">{subValue}</span>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
