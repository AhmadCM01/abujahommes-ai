import React from 'react'
import { cn } from '@/lib/utils'

export interface TabItem {
  id: string
  label: string
  count?: number
  icon?: React.ReactNode
}

export interface TabsProps {
  tabs: TabItem[]
  activeTab: string
  onChange: (id: string) => void
  variant?: 'pills' | 'underline'
  className?: string
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'pills',
  className,
}) => {
  if (variant === 'underline') {
    return (
      <div
        className={cn(
          'flex items-center gap-6 border-b border-[#D6C9A8] overflow-x-auto no-scrollbar',
          className
        )}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                'pb-3 text-sm font-semibold flex items-center gap-2 relative transition-colors whitespace-nowrap',
                isActive
                  ? 'text-[#2D5A3D]'
                  : 'text-[#5C5C5C] hover:text-[#1A1A1A]'
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={cn(
                    'text-xs px-1.5 py-0.5 rounded-full font-bold',
                    isActive
                      ? 'bg-[#2D5A3D] text-white'
                      : 'bg-[#EDE0C4] text-[#5C5C5C]'
                  )}
                >
                  {tab.count}
                </span>
              )}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2D5A3D] rounded-full" />
              )}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'inline-flex p-1 bg-[#EDE0C4]/70 rounded-xl gap-1 overflow-x-auto no-scrollbar max-w-full',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap select-none',
              isActive
                ? 'bg-white text-[#2D5A3D] shadow-xs'
                : 'text-[#5C5C5C] hover:text-[#1A1A1A] hover:bg-white/40'
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  'text-[10px] px-1.5 py-0.2 rounded-full font-bold',
                  isActive
                    ? 'bg-[#F0F4EC] text-[#2D5A3D]'
                    : 'bg-[#D6C9A8] text-[#1A1A1A]'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
