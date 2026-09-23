'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { BuyerSidebar } from './BuyerSidebar'
import { SellerSidebar } from './SellerSidebar'
import { AdminSidebar } from './AdminSidebar'
import { TopBar } from './TopBar'
import { BottomNav } from './BottomNav'
import { ToastProvider } from '@/components/ui/Toast'
import { useAuthStore } from '@/store/auth'
import { UserRole } from '@/types'

export interface DashboardShellProps {
  children: React.ReactNode
  role?: UserRole
  pageTitle?: string
}

export const DashboardShell: React.FC<DashboardShellProps> = ({
  children,
  role = 'buyer',
  pageTitle,
}) => {
  const router = useRouter()
  const { user } = useAuthStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Enforce role security: prevent non-admins from accessing other role dashboards
  useEffect(() => {
    if (user && user.role !== 'admin') {
      const isAgentOnSeller = user.role === 'agent' && role === 'seller'
      if (role !== user.role && !isAgentOnSeller) {
        router.replace(`/dashboard/${user.role}`)
      }
    }
  }, [user, role, router])

  const renderSidebar = (onClose?: () => void) => {
    if (role === 'admin') return <AdminSidebar onCloseMobile={onClose} />
    if (role === 'seller' || role === 'agent') return <SellerSidebar onCloseMobile={onClose} />
    return <BuyerSidebar onCloseMobile={onClose} />
  }

  return (
    <ToastProvider>
      <div className="min-h-screen flex bg-[#F5EDD6] text-[#1A1A1A] font-sans antialiased overflow-x-hidden">
        {/* Desktop Fixed Sidebar */}
        <div className="hidden lg:block fixed inset-y-0 left-0 z-30 w-64">
          {renderSidebar()}
        </div>

        {/* Mobile Sidebar Overlay Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <div className="lg:hidden fixed inset-0 z-50 flex">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/50 backdrop-blur-xs"
              />
              <motion.div
                initial={{ x: -260 }}
                animate={{ x: 0 }}
                exit={{ x: -260 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="relative z-10 w-64 max-w-[80vw] h-full"
              >
                {renderSidebar(() => setMobileMenuOpen(false))}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Main Content Workspace */}
        <div className="flex-1 lg:pl-64 flex flex-col min-h-screen w-full min-w-0">
          <TopBar
            title={pageTitle}
            role={role}
            onMenuClick={() => setMobileMenuOpen(true)}
          />

          <main className="flex-1 p-4 md:p-6 lg:p-8 pb-24 lg:pb-8 max-w-7xl w-full mx-auto">
            {children}
          </main>

          {/* Mobile Bottom Navigation */}
          <BottomNav role={role} />
        </div>
      </div>
    </ToastProvider>
  )
}

export default DashboardShell
