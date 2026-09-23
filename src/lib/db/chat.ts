import { pool, DatabaseUnavailableError } from './users'
import { Conversation, ChatMessage } from '@/types'

function getDbPool() {
  if (!pool) {
    throw new DatabaseUnavailableError('Postgres database connection pool is not configured')
  }
  return pool
}

/**
 * Get or create a conversation between a buyer and the listing's verified owner.
 * - Enforces that seller_id is strictly resolved from listings.owner_id (never from user input).
 * - Enforces that buyer cannot start a conversation with themselves.
 * - Strictly persists to PostgreSQL (zero in-memory cache).
 */
export async function getOrCreateConversation(
  listingId: string,
  buyerId: string
): Promise<Conversation> {
  const db = getDbPool()
  const client = await db.connect()
  try {
    // 1. Fetch listing and authoritatively determine owner_id (seller_id)
    const listingRes = await client.query(
      `SELECT id, owner_id, title, asking_price, location, lga, images 
       FROM listings 
       WHERE id = $1`,
      [listingId]
    )

    if (listingRes.rows.length === 0) {
      throw new Error(`Listing with ID '${listingId}' not found`)
    }

    const listing = listingRes.rows[0]
    const sellerId = listing.owner_id

    if (buyerId === sellerId) {
      throw new Error('Cannot start a chat on your own listing')
    }

    // 2. Upsert conversation record with UNIQUE(listing_id, buyer_id)
    const convRes = await client.query(
      `INSERT INTO conversations (listing_id, buyer_id, seller_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (listing_id, buyer_id) 
       DO UPDATE SET listing_id = EXCLUDED.listing_id
       RETURNING *;`,
      [listingId, buyerId, sellerId]
    )

    const conversation = convRes.rows[0]

    // 3. Fetch full enriched details
    return await fetchConversationById(conversation.id, buyerId)
  } finally {
    client.release()
  }
}

/**
 * Fetch all conversations for a user (either as buyer or seller)
 */
export async function fetchConversationsForUser(userId: string): Promise<Conversation[]> {
  const db = getDbPool()
  const client = await db.connect()
  try {
    const query = `
      SELECT 
        c.id,
        c.listing_id,
        c.buyer_id,
        c.seller_id,
        c.created_at,
        l.title AS listing_title,
        l.asking_price AS listing_price,
        l.location AS listing_location,
        l.lga AS listing_lga,
        l.images AS listing_images,
        bp.full_name AS buyer_name,
        bp.avatar_url AS buyer_avatar,
        sp.full_name AS seller_name,
        sp.avatar_url AS seller_avatar,
        lm.body AS last_message,
        lm.created_at AS last_message_at
      FROM conversations c
      JOIN listings l ON c.listing_id = l.id
      LEFT JOIN profiles bp ON c.buyer_id = bp.id
      LEFT JOIN profiles sp ON l.owner_id = sp.id
      LEFT JOIN LATERAL (
        SELECT body, created_at 
        FROM messages m 
        WHERE m.conversation_id = c.id 
        ORDER BY m.created_at DESC 
        LIMIT 1
      ) lm ON true
      WHERE c.buyer_id = $1 OR c.seller_id = $1 OR l.owner_id = $1
      ORDER BY COALESCE(lm.created_at, c.created_at) DESC;
    `

    const res = await client.query(query, [userId])
    return res.rows.map((row) => ({
      id: row.id,
      listing_id: row.listing_id,
      buyer_id: row.buyer_id,
      seller_id: row.seller_id,
      created_at: new Date(row.created_at).toISOString(),
      listing_title: row.listing_title,
      listing_price: Number(row.listing_price),
      listing_location: row.listing_location,
      listing_lga: row.listing_lga,
      listing_image: Array.isArray(row.listing_images) && row.listing_images.length > 0 ? row.listing_images[0] : undefined,
      buyer: {
        id: row.buyer_id,
        full_name: row.buyer_name || 'Prospective Buyer',
        avatar_url: row.buyer_avatar || null,
      },
      seller: {
        id: row.seller_id,
        full_name: row.seller_name || 'Verified Seller',
        avatar_url: row.seller_avatar || null,
      },
      buyer_name: row.buyer_name || 'Prospective Buyer',
      buyer_avatar: row.buyer_avatar || null,
      buyer_avatar_url: row.buyer_avatar || null,
      seller_name: row.seller_name || 'Verified Seller',
      seller_avatar: row.seller_avatar || null,
      seller_avatar_url: row.seller_avatar || null,
      last_message: row.last_message || undefined,
      last_message_at: row.last_message_at ? new Date(row.last_message_at).toISOString() : undefined,
    }))
  } finally {
    client.release()
  }
}

/**
 * Fetch a single conversation by ID, verifying that userId is a participant
 */
export async function fetchConversationById(conversationId: string, userId: string): Promise<Conversation> {
  const db = getDbPool()
  const client = await db.connect()
  try {
    const query = `
      SELECT 
        c.id,
        c.listing_id,
        c.buyer_id,
        c.seller_id,
        c.created_at,
        l.title AS listing_title,
        l.asking_price AS listing_price,
        l.location AS listing_location,
        l.lga AS listing_lga,
        l.images AS listing_images,
        l.owner_id AS listing_owner_id,
        bp.full_name AS buyer_name,
        bp.avatar_url AS buyer_avatar,
        sp.full_name AS seller_name,
        sp.avatar_url AS seller_avatar,
        lm.body AS last_message,
        lm.created_at AS last_message_at
      FROM conversations c
      JOIN listings l ON c.listing_id = l.id
      LEFT JOIN profiles bp ON c.buyer_id = bp.id
      LEFT JOIN profiles sp ON l.owner_id = sp.id
      LEFT JOIN LATERAL (
        SELECT body, created_at 
        FROM messages m 
        WHERE m.conversation_id = c.id 
        ORDER BY m.created_at DESC 
        LIMIT 1
      ) lm ON true
      WHERE c.id = $1;
    `

    const res = await client.query(query, [conversationId])
    if (res.rows.length === 0) {
      throw new Error(`Conversation '${conversationId}' not found`)
    }

    const row = res.rows[0]
    if (row.buyer_id !== userId && row.seller_id !== userId && row.listing_owner_id !== userId) {
      throw new Error('Forbidden: You are not a participant in this conversation')
    }

    return {
      id: row.id,
      listing_id: row.listing_id,
      buyer_id: row.buyer_id,
      seller_id: row.seller_id,
      created_at: new Date(row.created_at).toISOString(),
      listing_title: row.listing_title,
      listing_price: Number(row.listing_price),
      listing_location: row.listing_location,
      listing_lga: row.listing_lga,
      listing_image: Array.isArray(row.listing_images) && row.listing_images.length > 0 ? row.listing_images[0] : undefined,
      buyer: {
        id: row.buyer_id,
        full_name: row.buyer_name || 'Prospective Buyer',
        avatar_url: row.buyer_avatar || null,
      },
      seller: {
        id: row.seller_id,
        full_name: row.seller_name || 'Verified Seller',
        avatar_url: row.seller_avatar || null,
      },
      buyer_name: row.buyer_name || 'Prospective Buyer',
      buyer_avatar: row.buyer_avatar || null,
      buyer_avatar_url: row.buyer_avatar || null,
      seller_name: row.seller_name || 'Verified Seller',
      seller_avatar: row.seller_avatar || null,
      seller_avatar_url: row.seller_avatar || null,
      last_message: row.last_message || undefined,
      last_message_at: row.last_message_at ? new Date(row.last_message_at).toISOString() : undefined,
    }
  } finally {
    client.release()
  }
}

/**
 * Fetch all messages for a conversation, verifying participant authorization
 */
export async function fetchMessagesForConversation(
  conversationId: string,
  userId: string
): Promise<ChatMessage[]> {
  const db = getDbPool()
  const client = await db.connect()
  try {
    // 1. Verify user is party to this conversation
    const convCheck = await client.query(
      `SELECT c.id, c.buyer_id, c.seller_id, l.owner_id 
       FROM conversations c 
       JOIN listings l ON c.listing_id = l.id 
       WHERE c.id = $1`,
      [conversationId]
    )

    if (convCheck.rows.length === 0) {
      throw new Error(`Conversation '${conversationId}' not found`)
    }

    const conv = convCheck.rows[0]
    if (conv.buyer_id !== userId && conv.seller_id !== userId && conv.owner_id !== userId) {
      throw new Error('Forbidden: You are not a participant in this conversation')
    }

    // 2. Query messages chronologically
    const msgRes = await client.query(
      `SELECT 
         m.id,
         m.conversation_id,
         m.sender_id,
         m.body,
         m.created_at,
         p.full_name AS sender_name,
         p.avatar_url AS sender_avatar
       FROM messages m
       LEFT JOIN profiles p ON m.sender_id = p.id
       WHERE m.conversation_id = $1
       ORDER BY m.created_at ASC;`,
      [conversationId]
    )

    return msgRes.rows.map((row) => ({
      id: row.id,
      conversation_id: row.conversation_id,
      sender_id: row.sender_id,
      body: row.body,
      created_at: new Date(row.created_at).toISOString(),
      sender_name: row.sender_name || 'User',
      sender_avatar: row.sender_avatar || null,
    }))
  } finally {
    client.release()
  }
}

/**
 * Insert a new message into a conversation
 * - Validates non-empty trimmed body and max 2000 chars.
 * - Verifies sender is a participant.
 */
export async function createMessage(
  conversationId: string,
  senderId: string,
  rawBody: string
): Promise<ChatMessage> {
  const body = (rawBody || '').trim()

  if (!body) {
    throw new Error('Message body cannot be empty')
  }

  if (body.length > 2000) {
    throw new Error('Message body exceeds maximum length of 2000 characters')
  }

  const db = getDbPool()
  const client = await db.connect()
  try {
    // 1. Verify sender is a participant
    const convCheck = await client.query(
      `SELECT c.id, c.buyer_id, c.seller_id, l.owner_id 
       FROM conversations c 
       JOIN listings l ON c.listing_id = l.id 
       WHERE c.id = $1`,
      [conversationId]
    )

    if (convCheck.rows.length === 0) {
      throw new Error(`Conversation '${conversationId}' not found`)
    }

    const conv = convCheck.rows[0]
    if (conv.buyer_id !== senderId && conv.seller_id !== senderId && conv.owner_id !== senderId) {
      throw new Error('Forbidden: You are not a participant in this conversation')
    }

    // 2. Insert message
    const insertRes = await client.query(
      `INSERT INTO messages (conversation_id, sender_id, body)
       VALUES ($1, $2, $3)
       RETURNING *;`,
      [conversationId, senderId, body]
    )

    const row = insertRes.rows[0]

    // 3. Sender profile
    const profileRes = await client.query(
      'SELECT full_name, avatar_url FROM profiles WHERE id = $1',
      [senderId]
    )
    const profile = profileRes.rows[0]

    return {
      id: row.id,
      conversation_id: row.conversation_id,
      sender_id: row.sender_id,
      body: row.body,
      created_at: new Date(row.created_at).toISOString(),
      sender_name: profile?.full_name || 'User',
      sender_avatar: profile?.avatar_url || null,
    }
  } finally {
    client.release()
  }
}
