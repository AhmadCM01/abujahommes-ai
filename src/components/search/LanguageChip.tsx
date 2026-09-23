import React from 'react'
import { Globe, Sparkle } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

export interface LanguageChipProps {
  language?: 'english' | 'pidgin'
  interpretation?: string
  className?: string
}

export const LanguageChip: React.FC<LanguageChipProps> = ({
  language,
  interpretation,
  className,
}) => {
  if (!language && !interpretation) return null

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1 bg-[#F0F4EC] border border-[#A8C192] text-[#2D5A3D] rounded-full text-xs font-semibold shadow-xs animate-fadeIn',
        className
      )}
    >
      <div className="flex items-center gap-1">
        {language === 'pidgin' ? (
          <Globe size={14} className="text-[#C9962A]" weight="bold" />
        ) : (
          <Sparkle size={14} className="text-[#2D5A3D]" weight="fill" />
        )}
        <span className="font-bold">
          {language === 'pidgin' ? 'Nigerian Pidgin Detected' : 'AI Intent Matched'}
        </span>
      </div>
      {interpretation && (
        <span className="text-[#5C5C5C] font-normal border-l border-[#A8C192] pl-2">
          &quot;{interpretation}&quot;
        </span>
      )}
    </div>
  )
}
