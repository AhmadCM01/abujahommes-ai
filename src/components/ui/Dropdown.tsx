'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface DropdownItem {
  id: string
  label: string
  icon?: React.ReactNode
  onClick?: () => void
  danger?: boolean
  divider?: boolean
}

export interface DropdownProps {
  trigger: React.ReactNode
  items: DropdownItem[]
  align?: 'left' | 'right'
  className?: string
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  align = 'right',
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute z-50 mt-2 w-56 rounded-xl bg-white p-1.5 shadow-4 border border-[#D6C9A8] focus:outline-none',
              align === 'right' ? 'right-0' : 'left-0',
              className
            )}
          >
            {items.map((item, index) => {
              if (item.divider) {
                return <div key={`div-${index}`} className="h-px bg-[#EDE0C4] my-1" />
              }
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    item.onClick?.()
                    setIsOpen(false)
                  }}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors text-left',
                    item.danger
                      ? 'text-[#C1121F] hover:bg-[#FEE2E2]'
                      : 'text-[#1A1A1A] hover:bg-[#F0F4EC] hover:text-[#2D5A3D]'
                  )}
                >
                  {item.icon && <span className="text-base shrink-0">{item.icon}</span>}
                  <span>{item.label}</span>
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
