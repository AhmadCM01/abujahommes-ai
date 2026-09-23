import React from 'react'
import { CaretDown } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  helperText?: string
  options?: SelectOption[]
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, options, children, id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs font-semibold text-[#1A1A1A] tracking-wide"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'w-full h-12 px-4 pr-10 bg-white text-[#1A1A1A] text-sm rounded-xl border transition-all duration-150 appearance-none cursor-pointer',
              'border-[#D6C9A8] hover:border-[#2D5A3D] focus:border-[#2D5A3D] focus:ring-2 focus:ring-[#2D5A3D]/20 outline-none shadow-xs',
              'disabled:bg-[#FDFAF4] disabled:text-[#9A9A9A] disabled:cursor-not-allowed disabled:hover:border-[#D6C9A8]',
              error && 'border-[#C1121F] hover:border-[#C1121F] focus:border-[#C1121F] focus:ring-[#C1121F]/20',
              className
            )}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <div className="absolute right-3.5 pointer-events-none text-[#5C5C5C]">
            <CaretDown size={16} />
          </div>
        </div>
        {error && <p className="text-xs text-[#C1121F] mt-0.5">{error}</p>}
        {helperText && !error && (
          <p className="text-xs text-[#5C5C5C] mt-0.5">{helperText}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'
