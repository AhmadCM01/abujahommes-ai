'use client'

import React, { useState, useEffect, useRef, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  PaperPlaneRight,
  HouseSimple,
  CheckCircle,
  User,
  ChatCircleText,
  CaretLeft,
  ArrowRight,
} from '@phosphor-icons/react'
import { Card, Button, Avatar } from '@/components/ui'
import { useAuthStore } from '@/store/auth'
import { formatNGN } from '@/lib/utils'
import { Conversation, ChatMessage } from '@/types'

function SellerChatContent() {
  const { user } = useAuthStore()
  const searchParams = useSearchParams()
  const paramConversationId = searchParams.get('conversationId')

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConvId, setActiveConvId] = useState<string | null>(paramConversationId || null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loadingConvs, setLoadingConvs] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [inputMessage, setInputMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [mobileShowThread, setMobileShowThread] = useState(Boolean(paramConversationId))

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [fetchError, setFetchError] = useState<string | null>(null)

  // 1. Fetch conversations from PostgreSQL
  const loadConversations = async () => {
    try {
      const res = await fetch('/api/chat/conversations')
      if (res.ok) {
        const data = await res.json()
        const convList: Conversation[] = data.conversations || []
        setConversations(convList)

        // Set initial active conversation (preserve current selection if valid)
        setActiveConvId((current) => {
          if (current && convList.some((c) => c.id === current)) {
            return current
          }
          if (paramConversationId && convList.some((c) => c.id === paramConversationId)) {
            return paramConversationId
          }
          return convList.length > 0 ? convList[0].id : null
        })
      }
    } catch (err) {
      console.error('[SELLER CHAT] Error loading conversations:', err)
    } finally {
      setLoadingConvs(false)
    }
  }

  // 2. Fetch messages for active conversation
  const loadMessages = async (convId: string, isSilent = false) => {
    if (!isSilent) setLoadingMessages(true)
    setFetchError(null)
    try {
      const res = await fetch(`/api/chat/conversations/${convId}/messages`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
      } else {
        const err = await res.json().catch(() => ({}))
        if (!isSilent) setFetchError(err.error || 'Failed to load messages')
      }
    } catch (err) {
      console.error('[SELLER CHAT] Error loading messages:', err)
      if (!isSilent) setFetchError('Network error loading messages')
    } finally {
      if (!isSilent) setLoadingMessages(false)
    }
  }

  const handleSelectConversation = (convId: string) => {
    setMobileShowThread(true)
    if (convId === activeConvId) return
    setActiveConvId(convId)
  }

  // Initial load
  useEffect(() => {
    loadConversations()
    if (paramConversationId) {
      setMobileShowThread(true)
    }
  }, [paramConversationId])

  // When active conversation changes, load messages
  useEffect(() => {
    if (activeConvId) {
      loadMessages(activeConvId, false)
    } else {
      setMessages([])
    }
  }, [activeConvId])

  // Live polling every 2.5 seconds (≤3s requirement)
  useEffect(() => {
    if (!activeConvId) return

    const timer = setInterval(() => {
      loadMessages(activeConvId, true)
      // Also silently refresh conversation list for latest previews
      fetch('/api/chat/conversations')
        .then((r) => r.json())
        .then((d) => {
          if (d.conversations) setConversations(d.conversations)
        })
        .catch(() => {})
    }, 2500)

    return () => clearInterval(timer)
  }, [activeConvId])

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  // Send message
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = inputMessage.trim()
    if (!trimmed || !activeConvId || isSending) return

    setIsSending(true)
    try {
      const res = await fetch(`/api/chat/conversations/${activeConvId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: trimmed }),
      })

      if (res.ok) {
        const data = await res.json()
        setMessages((prev) => [...prev, data.message])
        setInputMessage('')
        // Refresh conversation list to update last_message
        loadConversations()
      }
    } catch (err) {
      console.error('[SELLER CHAT] Error sending message:', err)
    } finally {
      setIsSending(false)
    }
  }

  const activeConv = conversations.find((c) => c.id === activeConvId)

  return (
    <div className="space-y-4 text-left animate-fadeIn">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] tracking-tight flex items-center gap-2">
          <ChatCircleText size={32} weight="fill" className="text-[#C9962A]" />
          <span>Buyer Inquiries &amp; Live Messages</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#5C5C5C] mt-0.5">
          Respond directly to prospective buyers, answer property questions, and schedule inspections
        </p>
      </div>

      {/* Main Chat Grid */}
      <Card
        elevation="1"
        className="bg-white border border-[#D6C9A8] rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[550px] h-[calc(100vh-210px)] max-h-[850px]"
      >
        {/* Left Threads List (4 cols) */}
        <div
          className={`lg:col-span-4 border-r border-[#EDE0C4] flex flex-col bg-[#FDFAF4] ${
            mobileShowThread ? 'hidden lg:flex' : 'flex'
          }`}
        >
          <div className="p-4 border-b border-[#EDE0C4] bg-white flex items-center justify-between">
            <h2 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
              Buyer Inquiries ({conversations.length})
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#EDE0C4]">
            {loadingConvs ? (
              <div className="p-8 text-center text-xs text-[#5C5C5C]">
                Loading inquiries from buyers...
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center space-y-2 text-[#5C5C5C]">
                <p className="text-xs font-semibold text-[#1A1A1A]">No buyer inquiries yet</p>
                <p className="text-[11px]">
                  When prospective buyers message you from your active listings, their threads will appear here.
                </p>
              </div>
            ) : (
              conversations.map((conv) => {
                const isActive = conv.id === activeConvId
                const buyerName = conv.buyer?.full_name || conv.buyer_name || 'Interested Buyer'
                const buyerAvatar = conv.buyer?.avatar_url ?? conv.buyer_avatar ?? null
                return (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv.id)}
                    className={`w-full p-3.5 text-left flex items-start gap-3 transition-colors ${
                      isActive ? 'bg-[#FDF8EC] border-l-4 border-[#C9962A]' : 'hover:bg-white'
                    }`}
                  >
                    <Avatar
                      src={buyerAvatar}
                      fallback={buyerName}
                      size="md"
                      className="w-11 h-11 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-xs font-bold text-[#1A1A1A] truncate">
                          {buyerName}
                        </span>
                        <span className="text-[10px] text-[#5C5C5C] shrink-0">
                          {conv.last_message_at
                            ? new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : new Date(conv.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold text-[#C9962A] truncate mb-0.5">
                        {conv.listing_title}
                      </p>
                      <p className="text-xs text-[#5C5C5C] truncate">
                        {conv.last_message || 'New conversation started'}
                      </p>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Right Active Message Window (8 cols) */}
        <div
          className={`lg:col-span-8 flex flex-col h-full bg-[#F5EDD6]/20 ${
            !mobileShowThread ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {activeConv ? (
            <>
              {/* Active Thread Header */}
              <div className="p-3 sm:p-4 bg-white border-b border-[#EDE0C4] flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  {/* Mobile Back button */}
                  <button
                    onClick={() => setMobileShowThread(false)}
                    className="lg:hidden p-1.5 rounded-lg text-[#1A1A1A] hover:bg-[#FDF8EC] shrink-0"
                    aria-label="Back to inquiries"
                  >
                    <CaretLeft size={20} weight="bold" />
                  </button>

                  <Avatar
                    src={activeConv.buyer?.avatar_url ?? activeConv.buyer_avatar ?? null}
                    fallback={activeConv.buyer?.full_name || activeConv.buyer_name || 'Prospective Buyer'}
                    size="md"
                    className="w-10 h-10 shrink-0"
                  />
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-[#1A1A1A] flex items-center gap-1.5 truncate">
                      <span className="truncate">{activeConv.buyer?.full_name || activeConv.buyer_name || 'Prospective Buyer'}</span>
                      <span className="px-2 py-0.5 bg-[#F0F4EC] text-[#2D5A3D] text-[10px] font-bold rounded">
                        Prospective Buyer
                      </span>
                    </h3>
                    <span className="text-[11px] text-[#5C5C5C] truncate block">
                      Inquiring about {activeConv.listing_title}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/dashboard/buyer/property/${activeConv.listing_id}`}
                  className="text-xs font-bold text-[#2D5A3D] hover:underline flex items-center gap-1 shrink-0"
                >
                  <span className="hidden sm:inline">View Listing</span>
                  <ArrowRight size={14} weight="bold" />
                </Link>
              </div>

              {/* Listing Context Banner (photo, title, price, location) */}
              <div className="p-3 bg-[#FDF8EC] border-b border-[#F0CC77] flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  {activeConv.listing_image ? (
                    <img
                      src={activeConv.listing_image}
                      alt={activeConv.listing_title || 'Listing photo'}
                      className="w-11 h-11 rounded-lg object-cover border border-[#F0CC77] shrink-0"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-lg bg-[#EDE0C4] border border-[#D6C9A8] flex items-center justify-center text-[#5C5C5C] shrink-0">
                      <HouseSimple size={18} weight="bold" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <span className="font-bold text-[#1A1A1A] truncate block text-xs">
                      {activeConv.listing_title}
                    </span>
                    <span className="text-[11px] text-[#C9962A] font-bold">
                      {activeConv.listing_price ? formatNGN(activeConv.listing_price) : 'Price on request'}
                      {' • '}
                      {activeConv.listing_location}, {activeConv.listing_lga}
                    </span>
                  </div>
                </div>
              </div>

              {/* Messages Stream */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {loadingMessages && messages.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#5C5C5C]">
                    Loading message history...
                  </div>
                ) : fetchError ? (
                  <div className="p-8 text-center space-y-2 text-[#5C5C5C]">
                    <p className="text-xs font-semibold text-[#8B2500]">{fetchError}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => activeConvId && loadMessages(activeConvId)}
                    >
                      Retry
                    </Button>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="p-8 text-center space-y-2 text-[#5C5C5C]">
                    <p className="text-xs font-semibold text-[#1A1A1A]">No messages in this thread yet</p>
                    <p className="text-[11px]">Reply to the buyer to answer their inquiries.</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMyMessage = msg.sender_id === user?.id
                    const activeBuyerName = activeConv.buyer?.full_name || activeConv.buyer_name || 'Buyer'
                    const activeBuyerAvatar = activeConv.buyer?.avatar_url ?? activeConv.buyer_avatar ?? null
                    const bubbleAvatar = isMyMessage
                      ? (user?.avatar_url || msg.sender_avatar || null)
                      : (msg.sender_avatar || activeBuyerAvatar)
                    const bubbleName = isMyMessage
                      ? (user?.full_name || 'You')
                      : (msg.sender_name || activeBuyerName)

                    return (
                      <div
                        key={msg.id}
                        className={`flex items-end gap-2 ${isMyMessage ? 'flex-row-reverse self-end' : 'flex-row self-start'}`}
                      >
                        <Avatar
                          src={bubbleAvatar}
                          fallback={bubbleName}
                          size="sm"
                          className="w-7 h-7 text-[10px] shrink-0 mb-1"
                        />
                        <div
                          className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'}`}
                        >
                          <div className="flex items-center gap-1.5 mb-1 text-[10px] text-[#5C5C5C]">
                            <span className="font-bold">
                              {isMyMessage ? 'You (Seller)' : bubbleName}
                            </span>
                            <span>•</span>
                            <span>
                              {new Date(msg.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <div
                            className={`max-w-[85%] sm:max-w-[70%] p-3 rounded-2xl text-xs leading-relaxed shadow-xs whitespace-pre-wrap break-words ${
                              isMyMessage
                                ? 'bg-[#C9962A] text-white rounded-tr-none font-medium'
                                : 'bg-white text-[#1A1A1A] border border-[#D6C9A8] rounded-tl-none'
                            }`}
                          >
                            {msg.body}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Bar */}
              <form onSubmit={handleSend} className="p-3 bg-white border-t border-[#EDE0C4] flex items-center gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your response to the buyer..."
                  maxLength={2000}
                  disabled={isSending}
                  className="flex-1 h-11 px-4 text-xs rounded-xl border border-[#D6C9A8] bg-[#FDFAF4] focus:outline-none focus:border-[#C9962A] text-[#1A1A1A]"
                />
                <Button
                  type="submit"
                  variant="amber"
                  size="md"
                  isLoading={isSending}
                  disabled={!inputMessage.trim() || isSending}
                  rightIcon={<PaperPlaneRight size={16} weight="fill" />}
                >
                  Send
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center text-[#5C5C5C]">
              <p className="text-xs">Select an inquiry thread to view messages</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

export default function SellerChatPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs text-[#5C5C5C]">
          Loading messaging center...
        </div>
      }
    >
      <SellerChatContent />
    </Suspense>
  )
}
