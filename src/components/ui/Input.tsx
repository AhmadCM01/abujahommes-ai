import React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  rightElement?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      rightElement,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold text-[#1A1A1A] tracking-wide"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-[#5C5C5C]">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full h-12 bg-white text-[#1A1A1A] placeholder-[#9A9A9A] text-sm rounded-xl border transition-all duration-150',
              'border-[#D6C9A8] hover:border-[#2D5A3D] focus:border-[#2D5A3D] focus:ring-2 focus:ring-[#2D5A3D]/20 outline-none shadow-xs',
              'disabled:bg-[#FDFAF4] disabled:text-[#9A9A9A] disabled:cursor-not-allowed disabled:hover:border-[#D6C9A8]',
              leftIcon ? 'pl-11' : 'pl-4',
              rightIcon || rightElement ? 'pr-11' : 'pr-4',
              error && 'border-[#C1121F] hover:border-[#C1121F] focus:border-[#C1121F] focus:ring-[#C1121F]/20',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 flex items-center pointer-events-none text-[#5C5C5C]">
              {rightIcon}
            </div>
          )}
          {rightElement && (
            <div className="absolute right-2 flex items-center">
              {rightElement}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-[#C1121F] mt-0.5">{error}</p>}
        {helperText && !error && (
          <p className="text-xs text-[#5C5C5C] mt-0.5">{helperText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
