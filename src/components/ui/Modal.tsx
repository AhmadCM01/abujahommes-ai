'use client'

import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  className?: string
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
  className,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
            className={cn(
              'relative z-10 w-full bg-white rounded-2xl shadow-4 border border-[#D6C9A8] overflow-hidden max-h-[90vh] flex flex-col',
              maxWidthStyles[maxWidth],
              className
            )}
          >
            {(title || description) && (
              <div className="flex items-start justify-between p-5 border-b border-[#EDE0C4]">
                <div>
                  {title && <h2 className="text-lg font-bold text-[#1A1A1A]">{title}</h2>}
                  {description && (
                    <p className="text-xs text-[#5C5C5C] mt-0.5">{description}</p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-1 rounded-lg text-[#5C5C5C] hover:bg-[#F0F4EC] hover:text-[#2D5A3D] transition-colors"
                  aria-label="Close dialog"
                >
                  <X size={20} />
                </button>
              </div>
            )}
            <div className="p-5 overflow-y-auto flex-1">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
