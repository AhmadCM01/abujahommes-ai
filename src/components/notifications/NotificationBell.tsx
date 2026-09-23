'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Bell, CheckCircle } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotificationStore } from '@/store/notifications'
import { NotificationItem } from './NotificationItem'

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotificationStore()

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-[#5C5C5C] hover:text-[#2D5A3D] hover:bg-[#F0F4EC] transition-colors focus:outline-none"
        aria-label="Open notifications"
      >
        <Bell size={22} weight={unreadCount > 0 ? 'fill' : 'regular'} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 px-1.5 py-0.2 min-w-[18px] h-[18px] bg-[#2D5A3D] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white p-4 shadow-4 border border-[#D6C9A8] z-50 flex flex-col max-h-[460px]"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#EDE0C4]">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#1A1A1A]">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-[11px] font-bold bg-[#F0F4EC] text-[#2D5A3D] px-2 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs font-semibold text-[#2D5A3D] hover:underline flex items-center gap-1"
                >
                  <CheckCircle size={14} />
                  <span>Mark all read</span>
                </button>
              )}
            </div>

            <div className="overflow-y-auto space-y-2 py-3 flex-1 no-scrollbar">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#5C5C5C]">
                  All caught up! No notifications.
                </div>
              ) : (
                notifications.slice(0, 5).map((notif) => (
                  <NotificationItem
                    key={notif.id}
                    notification={notif}
                    onRead={markAsRead}
                  />
                ))
              )}
            </div>

            <div className="pt-2 border-t border-[#EDE0C4] text-center">
              <Link
                href="/dashboard/buyer/notifications"
                onClick={() => setIsOpen(false)}
                className="text-xs font-bold text-[#2D5A3D] hover:underline block py-1"
              >
                View all notifications →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
