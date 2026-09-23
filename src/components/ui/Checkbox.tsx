import React from 'react'
import { Check } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode
  description?: string
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, checked, id, ...props }, ref) => {
    const checkId =
      id || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <label
        htmlFor={checkId}
        className={cn(
          'flex items-start gap-3 cursor-pointer select-none group',
          className
        )}
      >
        <div className="relative flex items-center justify-center mt-0.5 shrink-0">
          <input
            ref={ref}
            type="checkbox"
            id={checkId}
            checked={checked}
            className="peer sr-only"
            {...props}
          />
          <div
            className={cn(
              'w-5 h-5 rounded border border-[#D6C9A8] bg-white transition-all duration-150',
              'peer-checked:bg-[#2D5A3D] peer-checked:border-[#2D5A3D] peer-focus:ring-2 peer-focus:ring-[#2D5A3D]/20',
              'group-hover:border-[#2D5A3D] flex items-center justify-center text-white'
            )}
          >
            {checked && <Check size={14} weight="bold" />}
          </div>
        </div>
        {(label || description) && (
          <div className="flex flex-col text-left">
            {label && (
              <span className="text-sm font-medium text-[#1A1A1A] leading-tight">
                {label}
              </span>
            )}
            {description && (
              <span className="text-xs text-[#5C5C5C] mt-0.5">{description}</span>
            )}
          </div>
        )}
      </label>
    )
  }
)

Checkbox.displayName = 'Checkbox'
