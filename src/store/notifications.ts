import { create } from 'zustand'
import { AppNotification } from '@/types'

interface NotificationState {
  notifications: AppNotification[]
  unreadCount: number
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  addNotification: (notification: Omit<AppNotification, 'id' | 'created_at' | 'is_read'>) => void
  removeNotification: (id: string) => void
}

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    user_id: 'demo-user-1',
    type: 'listing_approved',
    title: 'Listing Approved & Published',
    message: 'Your property "Luxury 4-Bedroom Detached Duplex with BQ" is now active.',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
  },
  {
    id: 'notif-2',
    user_id: 'demo-user-1',
    type: 'new_listing_match',
    title: 'New Matching Property in Gwarinpa',
    message: 'A 3-bedroom flat matching your budget was just listed on 3rd Avenue.',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: 'notif-3',
    user_id: 'demo-user-1',
    type: 'price_drop',
    title: 'Price Drop Alert',
    message: 'Serviced 3-bed in Wuse 2 reduced from NGN 7.0M to NGN 6.5M/yr.',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
  {
    id: 'notif-4',
    user_id: 'demo-user-1',
    type: 'enquiry_received',
    title: 'New Enquiry Received',
    message: 'Emeka O. sent an enquiry regarding Mississippi Street, Maitama.',
    is_read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'notif-5',
    user_id: 'demo-user-1',
    type: 'fraud_alert',
    title: 'Safety Warning Flag',
    message: 'A listing in Maitama with distress pricing was flagged by AI as High Risk.',
    is_read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
]

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: INITIAL_NOTIFICATIONS,
  unreadCount: INITIAL_NOTIFICATIONS.filter((n) => !n.is_read).length,

  markAsRead: (id) =>
    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === id ? { ...n, is_read: true } : n
      )
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.is_read).length,
      }
    }),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
      unreadCount: 0,
    })),

  addNotification: (item) =>
    set((state) => {
      const newNotif: AppNotification = {
        ...item,
        id: `notif-${Date.now()}`,
        is_read: false,
        created_at: new Date().toISOString(),
      }
      const updated = [newNotif, ...state.notifications]
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.is_read).length,
      }
    }),

  removeNotification: (id) =>
    set((state) => {
      const updated = state.notifications.filter((n) => n.id !== id)
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.is_read).length,
      }
    }),
}))
