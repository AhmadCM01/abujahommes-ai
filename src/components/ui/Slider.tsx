import React from 'react'
import { cn } from '@/lib/utils'

export interface SliderProps {
  min: number
  max: number
  step?: number
  value: number
  onChange: (value: number) => void
  label?: string
  valueFormatter?: (val: number) => string
  className?: string
}

export const Slider: React.FC<SliderProps> = ({
  min,
  max,
  step = 1,
  value,
  onChange,
  label,
  valueFormatter = (v) => v.toString(),
  className,
}) => {
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100))

  return (
    <div className={cn('w-full flex flex-col gap-2', className)}>
      <div className="flex justify-between items-center text-xs">
        {label && <span className="font-semibold text-[#1A1A1A]">{label}</span>}
        <span className="font-bold text-[#2D5A3D] bg-[#F0F4EC] px-2 py-0.5 rounded-md">
          {valueFormatter(value)}
        </span>
      </div>
      <div className="relative flex items-center w-full">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-[#EDE0C4] rounded-lg appearance-none cursor-pointer accent-[#2D5A3D] focus:outline-none"
          style={{
            background: `linear-gradient(to right, #2D5A3D 0%, #2D5A3D ${percentage}%, #EDE0C4 ${percentage}%, #EDE0C4 100%)`,
          }}
        />
      </div>
    </div>
  )
}
