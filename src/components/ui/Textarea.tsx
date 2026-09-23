import React from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
  charCount?: number
  minChars?: number
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      charCount,
      minChars,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        <div className="flex items-center justify-between">
          {label && (
            <label
              htmlFor={inputId}
              className="text-xs font-semibold text-[#1A1A1A] tracking-wide"
            >
              {label}
            </label>
          )}
          {minChars !== undefined && (
            <span
              className={cn(
                'text-xs font-mono',
                (charCount || 0) < minChars ? 'text-[#C9962A]' : 'text-[#2D6A4F]'
              )}
            >
              {charCount || 0} / {minChars} minimum
            </span>
          )}
        </div>
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'w-full min-h-[100px] p-3.5 bg-white text-[#1A1A1A] placeholder-[#9A9A9A] text-sm rounded-lg border transition-all duration-150',
            'border-[#D6C9A8] focus:border-[#2D5A3D] focus:ring-1 focus:ring-[#2D5A3D] outline-none resize-y',
            'disabled:bg-[#FDFAF4] disabled:text-[#9A9A9A] disabled:cursor-not-allowed',
            error && 'border-[#C1121F] focus:border-[#C1121F] focus:ring-[#C1121F]',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-[#C1121F] mt-0.5">{error}</p>}
        {helperText && !error && (
          <p className="text-xs text-[#5C5C5C] mt-0.5">{helperText}</p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
