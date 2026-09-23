'use client'

import React from 'react'
import {
  CheckCircle,
  X,
  HouseSimple,
  TrendDown,
  ShieldWarning,
  ChatCircle,
  BookmarkSimple,
  Info,
} from '@phosphor-icons/react'
import { AppNotification } from '@/types'
import { formatRelativeTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

export interface NotificationItemProps {
  notification: AppNotification
  onRead?: (id: string) => void
  onDismiss?: (id: string) => void
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onRead,
  onDismiss,
}) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'listing_approved':
        return <CheckCircle size={18} weight="fill" className="text-[#2D6A4F]" />
      case 'listing_rejected':
        return <X size={18} weight="bold" className="text-[#C1121F]" />
      case 'new_listing_match':
        return <HouseSimple size={18} weight="fill" className="text-[#2D5A3D]" />
      case 'price_drop':
        return <TrendDown size={18} weight="bold" className="text-[#C9962A]" />
      case 'fraud_alert':
        return <ShieldWarning size={18} weight="fill" className="text-[#C1121F]" />
      case 'enquiry_received':
        return <ChatCircle size={18} weight="fill" className="text-[#2D5A3D]" />
      case 'saved_search_match':
        return <BookmarkSimple size={18} weight="fill" className="text-[#2D5A3D]" />
      default:
        return <Info size={18} weight="fill" className="text-[#1D4ED8]" />
    }
  }

  const getIconBg = () => {
    switch (notification.type) {
      case 'listing_approved':
      case 'new_listing_match':
      case 'saved_search_match':
      case 'enquiry_received':
        return 'bg-[#E8F5EF]'
      case 'price_drop':
        return 'bg-[#FDF8EC]'
      case 'listing_rejected':
      case 'fraud_alert':
        return 'bg-[#FEE2E2]'
      default:
        return 'bg-[#DBEAFE]'
    }
  }

  return (
    <div
      onClick={() => onRead?.(notification.id)}
      className={cn(
        'p-3.5 rounded-xl transition-all cursor-pointer flex items-start gap-3 text-left border relative',
        notification.is_read
          ? 'bg-white/80 border-[#EDE0C4] hover:bg-[#FDFAF4]'
          : 'bg-[#F0F4EC]/60 border-[#D4E0C8] hover:bg-[#F0F4EC]'
      )}
    >
      <div
        className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
          getIconBg()
        )}
      >
        {getIcon()}
      </div>

      <div className="flex-1 min-w-0 pr-4">
        <div className="flex items-center justify-between">
          <h4
            className={cn(
              'text-xs tracking-tight truncate',
              notification.is_read ? 'font-semibold text-[#1A1A1A]' : 'font-bold text-[#1A1A1A]'
            )}
          >
            {notification.title}
          </h4>
        </div>
        <p className="text-[11px] text-[#5C5C5C] mt-0.5 leading-relaxed line-clamp-2">
          {notification.message}
        </p>
        <span className="text-[10px] text-[#9A9A9A] mt-1 inline-block font-medium">
          {formatRelativeTime(notification.created_at)}
        </span>
      </div>

      {!notification.is_read && (
        <span className="absolute top-4 right-3.5 w-2 h-2 rounded-full bg-[#2D5A3D]" />
      )}
    </div>
  )
}
