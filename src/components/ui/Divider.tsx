import React from 'react'
import { cn } from '@/lib/utils'

export interface DividerProps {
  label?: string
  className?: string
  color?: 'subtle' | 'default' | 'strong' | 'olive'
}

export const Divider: React.FC<DividerProps> = ({
  label,
  className,
  color = 'default',
}) => {
  const colorMap = {
    subtle: 'border-[#EDE0C4]',
    default: 'border-[#D6C9A8]',
    strong: 'border-[#C2A97A]',
    olive: 'border-[#7DA35B]/40',
  }

  if (label) {
    return (
      <div className={cn('relative flex items-center w-full my-4', className)}>
        <div className={cn('grow border-t', colorMap[color])} />
        <span className="shrink-0 mx-3 text-xs font-semibold uppercase tracking-wider text-[#5C5C5C]">
          {label}
        </span>
        <div className={cn('grow border-t', colorMap[color])} />
      </div>
    )
  }

  return <hr className={cn('border-0 border-t w-full my-3', colorMap[color], className)} />
}
