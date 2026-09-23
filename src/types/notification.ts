export type NotificationType =
  | 'listing_approved'
  | 'listing_rejected'
  | 'new_listing_match'
  | 'price_drop'
  | 'fraud_alert'
  | 'enquiry_received'
  | 'saved_search_match'
  | 'system_message'

export interface AppNotification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, unknown>
  is_read: boolean
  created_at: string
}

export interface Enquiry {
  id: string
  listing_id: string
  buyer_id: string
  seller_id: string
  message: string
  buyer_name?: string
  buyer_phone?: string
  buyer_email?: string
  listing_title?: string
  status: 'new' | 'read' | 'replied' | 'closed'
  created_at: string
}

export interface SavedSearch {
  id: string
  user_id: string
  name: string
  query_text?: string
  filters?: Record<string, unknown>
  result_count: number
  alert_enabled: boolean
  last_run?: string
  created_at: string
}
