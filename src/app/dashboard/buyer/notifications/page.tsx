'use client'

import React, { useState } from 'react'
import {
  Bell,
  CheckCircle,
  Tag,
  TrendDown,
  ShieldWarning,
  ChatCircle,
  Info,
} from '@phosphor-icons/react'
import { Tabs, Button, Card, EmptyState } from '@/components/ui'
import { NotificationItem } from '@/components/notifications/NotificationItem'
import { useNotificationStore } from '@/store/notifications'
import { useToast } from '@/components/ui/Toast'

export default function BuyerNotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } =
    useNotificationStore()
  const { addToast } = useToast()

  const [activeTab, setActiveTab] = useState('all')

  const filteredNotifs = notifications.filter((item) => {
    if (activeTab === 'unread') return !item.is_read
    if (activeTab === 'alerts')
      return item.type === 'price_drop' || item.type === 'fraud_alert'
    if (activeTab === 'listings')
      return item.type === 'new_listing_match' || item.type === 'saved_search_match'
    return true
  })

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1A1A1A] tracking-tight">
            Notifications &amp; Alerts
          </h1>
          <p className="text-xs text-[#5C5C5C] mt-0.5">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
              : 'All notifications are up to date'}
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              markAllAsRead()
              addToast({ title: 'Marked all as read', type: 'info' })
            }}
            leftIcon={<CheckCircle size={16} />}
          >
            Mark All as Read
          </Button>
        )}
      </div>

      <Tabs
        tabs={[
          { id: 'all', label: 'All', count: notifications.length },
          { id: 'unread', label: 'Unread', count: unreadCount },
          {
            id: 'alerts',
            label: 'Price & Safety Alerts',
            count: notifications.filter(
              (n) => n.type === 'price_drop' || n.type === 'fraud_alert'
            ).length,
          },
          {
            id: 'listings',
            label: 'Listings Matches',
            count: notifications.filter(
              (n) => n.type === 'new_listing_match' || n.type === 'saved_search_match'
            ).length,
          },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {filteredNotifs.length === 0 ? (
        <EmptyState
          icon={<Bell size={28} />}
          title="No notifications found"
          description="You are completely caught up. We will notify you when price changes occur or new matches are listed."
        />
      ) : (
        <Card elevation="1" className="p-4 bg-white border border-[#D6C9A8] space-y-2">
          {filteredNotifs.map((notif) => (
            <NotificationItem
              key={notif.id}
              notification={notif}
              onRead={markAsRead}
              onDismiss={removeNotification}
            />
          ))}
        </Card>
      )}
    </div>
  )
}
