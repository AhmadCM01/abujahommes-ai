import React from 'react'
import { cn } from '@/lib/utils'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'raised' | 'olive' | 'sand' | 'outline'
  elevation?: 'none' | '1' | '2' | '3' | '4'
  hoverEffect?: boolean
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'default',
      elevation = '1',
      hoverEffect = false,
      children,
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      default: 'bg-white border border-[#D6C9A8]',
      raised: 'bg-[#FDFAF4] border border-[#EDE0C4]',
      olive: 'bg-[#F0F4EC] border border-[#A8C192]',
      sand: 'bg-[#F5EDD6] border border-[#D6C9A8]',
      outline: 'bg-transparent border border-[#D6C9A8]',
    }

    const elevationStyles = {
      none: '',
      '1': 'shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]',
      '2': 'shadow-[0_4px_12px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.04)]',
      '3': 'shadow-[0_8px_24px_rgba(0,0,0,0.10),0_4px_8px_rgba(0,0,0,0.06)]',
      '4': 'shadow-[0_16px_48px_rgba(0,0,0,0.14),0_8px_16px_rgba(0,0,0,0.08)]',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl p-5 transition-all duration-250',
          variantStyles[variant],
          elevationStyles[elevation],
          hoverEffect && 'hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)] hover:-translate-y-0.5',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'
