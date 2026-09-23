import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ChatMessage {
  id: string
  thread_id: string
  sender_id: string
  sender_name: string
  sender_role: 'buyer' | 'seller' | 'admin'
  message: string
  timestamp: string
  is_read: boolean
}

export interface ChatThread {
  id: string
  property_id: string
  property_title: string
  property_price: number
  property_image: string
  property_location: string
  buyer_id: string
  buyer_name: string
  seller_id: string
  seller_name: string
  last_message: string
  last_updated: string
  unread_count_buyer: number
  unread_count_seller: number
}

interface ChatStore {
  threads: ChatThread[]
  messages: Record<string, ChatMessage[]> // thread_id -> messages
  activeThreadId: string | null
  setActiveThreadId: (id: string | null) => void
  createOrGetThread: (params: {
    property_id: string
    property_title: string
    property_price: number
    property_image: string
    property_location: string
    buyer_id: string
    buyer_name: string
    seller_id: string
    seller_name: string
  }) => string
  sendMessage: (threadId: string, message: string, senderId: string, senderName: string, senderRole: 'buyer' | 'seller' | 'admin') => void
  markThreadRead: (threadId: string, role: 'buyer' | 'seller') => void
  getUnreadCount: (role: 'buyer' | 'seller') => number
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      threads: [],
      messages: {},
      activeThreadId: null,

      setActiveThreadId: (id) => set({ activeThreadId: id }),

      createOrGetThread: (params) => {
        const { threads, messages } = get()
        const existing = threads.find(
          (t) => t.property_id === params.property_id && t.buyer_id === params.buyer_id
        )

        if (existing) {
          set({ activeThreadId: existing.id })
          return existing.id
        }

        const newThreadId = `thread-${Date.now()}`
        const newThread: ChatThread = {
          id: newThreadId,
          property_id: params.property_id,
          property_title: params.property_title,
          property_price: params.property_price,
          property_image: params.property_image,
          property_location: params.property_location,
          buyer_id: params.buyer_id,
          buyer_name: params.buyer_name,
          seller_id: params.seller_id,
          seller_name: params.seller_name,
          last_message: 'Inquiry started',
          last_updated: new Date().toISOString(),
          unread_count_buyer: 0,
          unread_count_seller: 1,
        }

        const initialMsg: ChatMessage = {
          id: `msg-${Date.now()}`,
          thread_id: newThreadId,
          sender_id: params.buyer_id,
          sender_name: params.buyer_name,
          sender_role: 'buyer',
          message: `Hello! I am interested in "${params.property_title}" located in ${params.property_location}. Please confirm availability.`,
          timestamp: new Date().toISOString(),
          is_read: false,
        }

        set({
          threads: [newThread, ...threads],
          messages: { ...messages, [newThreadId]: [initialMsg] },
          activeThreadId: newThreadId,
        })

        return newThreadId
      },

      sendMessage: (threadId, messageText, senderId, senderName, senderRole) => {
        const { threads, messages } = get()
        const newMsg: ChatMessage = {
          id: `msg-${Date.now()}`,
          thread_id: threadId,
          sender_id: senderId,
          sender_name: senderName,
          sender_role: senderRole,
          message: messageText,
          timestamp: new Date().toISOString(),
          is_read: false,
        }

        const threadMessages = messages[threadId] || []
        const updatedMessages = {
          ...messages,
          [threadId]: [...threadMessages, newMsg],
        }

        const updatedThreads = threads.map((t) => {
          if (t.id === threadId) {
            return {
              ...t,
              last_message: messageText,
              last_updated: new Date().toISOString(),
              unread_count_buyer: senderRole === 'seller' ? t.unread_count_buyer + 1 : t.unread_count_buyer,
              unread_count_seller: senderRole === 'buyer' ? t.unread_count_seller + 1 : t.unread_count_seller,
            }
          }
          return t
        })

        set({
          threads: updatedThreads,
          messages: updatedMessages,
        })
      },

      markThreadRead: (threadId, role) => {
        const { threads, messages } = get()
        const updatedThreads = threads.map((t) => {
          if (t.id === threadId) {
            return {
              ...t,
              unread_count_buyer: role === 'buyer' ? 0 : t.unread_count_buyer,
              unread_count_seller: role === 'seller' ? 0 : t.unread_count_seller,
            }
          }
          return t
        })

        const threadMsgs = messages[threadId] || []
        const updatedThreadMsgs = threadMsgs.map((m) =>
          m.sender_role !== role ? { ...m, is_read: true } : m
        )

        set({
          threads: updatedThreads,
          messages: { ...messages, [threadId]: updatedThreadMsgs },
        })
      },

      getUnreadCount: (role) => {
        const { threads } = get()
        return threads.reduce(
          (acc, t) => acc + (role === 'buyer' ? t.unread_count_buyer : t.unread_count_seller),
          0
        )
      },
    }),
    {
      name: 'abujahommes-chat-store',
    }
  )
)
