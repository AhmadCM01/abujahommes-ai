import React from 'react'
import { cn } from '@/lib/utils'
import { Spinner } from './Spinner'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'amber'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98] whitespace-nowrap'

    const variantStyles = {
      primary:
        'bg-[#2D5A3D] text-white hover:bg-[#1E3D29] active:bg-[#122416] focus:ring-[#2D5A3D] shadow-sm hover:shadow-md',
      secondary:
        'bg-[#F0F4EC] text-[#2D5A3D] hover:bg-[#D4E0C8] active:bg-[#A8C192] focus:ring-[#2D5A3D]',
      amber:
        'bg-[#C9962A] text-white hover:bg-[#A67A1E] active:bg-[#7A5A16] focus:ring-[#C9962A] shadow-sm',
      outline:
        'border border-[#D6C9A8] bg-transparent text-[#1A1A1A] hover:bg-[#FDFAF4] hover:border-[#2D5A3D] focus:ring-[#2D5A3D]',
      ghost:
        'bg-transparent text-[#5C5C5C] hover:bg-[#F0F4EC] hover:text-[#2D5A3D] focus:ring-[#2D5A3D]',
      danger:
        'bg-[#C1121F] text-white hover:bg-[#9B0D18] focus:ring-[#C1121F] shadow-sm',
    }

    const sizeStyles = {
      sm: 'h-9 px-3 text-xs gap-1.5',
      md: 'h-11 px-4 text-sm gap-2',
      lg: 'h-13 px-6 text-base gap-2.5 font-semibold',
      icon: 'h-10 w-10 p-0',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading ? (
          <Spinner size={size === 'sm' ? 'sm' : 'md'} className="text-current" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    )
  }
)

Button.displayName = 'Button'
