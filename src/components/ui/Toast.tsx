'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, WarningCircle, Info, X } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

export interface ToastMessage {
  id: string
  title: string
  message?: string
  type?: 'success' | 'error' | 'warning' | 'info'
}

interface ToastContextType {
  toasts: ToastMessage[]
  addToast: (toast: Omit<ToastMessage, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextType>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
})

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([])

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`
    setToasts((prev) => [...prev, { ...toast, id }])
    setTimeout(() => {
      removeToast(id)
    }, 4000)
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none p-4">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className={cn(
                'pointer-events-auto p-4 rounded-xl shadow-4 border flex items-start gap-3 bg-white',
                toast.type === 'success' && 'border-[#A8D5BE]',
                toast.type === 'error' && 'border-[#FCA5A5]',
                toast.type === 'warning' && 'border-[#F0CC77]',
                (!toast.type || toast.type === 'info') && 'border-[#93C5FD]'
              )}
            >
              <div className="shrink-0 mt-0.5">
                {toast.type === 'success' && (
                  <CheckCircle size={20} className="text-[#2D6A4F]" weight="fill" />
                )}
                {toast.type === 'error' && (
                  <XCircle size={20} className="text-[#C1121F]" weight="fill" />
                )}
                {toast.type === 'warning' && (
                  <WarningCircle size={20} className="text-[#C9962A]" weight="fill" />
                )}
                {(!toast.type || toast.type === 'info') && (
                  <Info size={20} className="text-[#1D4ED8]" weight="fill" />
                )}
              </div>
              <div className="flex-1 text-left">
                <h4 className="text-sm font-bold text-[#1A1A1A]">{toast.title}</h4>
                {toast.message && (
                  <p className="text-xs text-[#5C5C5C] mt-0.5">{toast.message}</p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-[#9A9A9A] hover:text-[#1A1A1A] p-0.5"
              >
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => React.useContext(ToastContext)
