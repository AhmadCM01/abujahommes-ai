export interface ConversationParticipant {
  id: string
  full_name: string
  avatar_url: string | null
}

export interface Conversation {
  id: string
  listing_id: string
  buyer_id: string
  seller_id: string
  created_at: string

  // Enriched listing details
  listing_title?: string
  listing_price?: number
  listing_location?: string
  listing_lga?: string
  listing_image?: string

  // Participant profiles (with buyer.avatar_url & seller.avatar_url)
  buyer?: ConversationParticipant
  seller?: ConversationParticipant

  // Enriched party details (flat aliases for backwards compatibility)
  buyer_name?: string
  buyer_avatar?: string | null
  buyer_avatar_url?: string | null
  seller_name?: string
  seller_avatar?: string | null
  seller_avatar_url?: string | null

  // Latest message info
  last_message?: string
  last_message_at?: string
}

export interface ChatMessage {
  id: string
  conversation_id: string
  sender_id: string
  body: string
  created_at: string
  sender_name?: string
  sender_avatar?: string | null
}
