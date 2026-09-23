import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { getCanonicalUserById, DatabaseUnavailableError } from '@/lib/db/users'
import { getOrCreateConversation, fetchConversationsForUser } from '@/lib/db/chat'

export const dynamic = 'force-dynamic'

/**
 * GET /api/chat/conversations
 * Fetch all conversation threads for the authenticated session user
 */
export async function GET(req: NextRequest) {
  try {
    const reqHeaders = await headers()
    const session = await auth.api.getSession({ headers: reqHeaders })

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const conversations = await fetchConversationsForUser(session.user.id)
    return NextResponse.json({ conversations })
  } catch (error) {
    if (error instanceof DatabaseUnavailableError) {
      return NextResponse.json({ error: 'Database service unavailable' }, { status: 503 })
    }
    console.error('[API /api/chat/conversations GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversations', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

/**
 * POST /api/chat/conversations
 * Start or retrieve a conversation thread on a listing
 * - Rule: Only a buyer session may POST /api/chat/conversations.
 * - Rule: seller_id is strictly resolved from listings.owner_id (never from body).
 */
export async function POST(req: NextRequest) {
  try {
    const reqHeaders = await headers()
    const session = await auth.api.getSession({ headers: reqHeaders })

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Rule 3: Only a buyer session may start chat conversations
    const userProfile = await getCanonicalUserById(session.user.id)
    const role = userProfile?.role || 'buyer'

    if (role !== 'buyer') {
      return NextResponse.json(
        { error: 'Forbidden: Only buyer accounts can initiate conversations with sellers' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const listingId = body.listing_id

    if (!listingId || typeof listingId !== 'string') {
      return NextResponse.json(
        { error: 'Missing required field: "listing_id"' },
        { status: 400 }
      )
    }

    // getOrCreateConversation strictly queries listings.owner_id and enforces buyer != seller
    const conversation = await getOrCreateConversation(listingId, session.user.id)

    return NextResponse.json(
      { success: true, conversation },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof DatabaseUnavailableError) {
      return NextResponse.json({ error: 'Database service unavailable' }, { status: 503 })
    }
    const message = error instanceof Error ? error.message : String(error)
    if (message.includes('not found')) {
      return NextResponse.json({ error: message }, { status: 404 })
    }
    if (message.includes('own listing')) {
      return NextResponse.json({ error: message }, { status: 400 })
    }
    console.error('[API /api/chat/conversations POST] Error:', error)
    return NextResponse.json(
      { error: 'Failed to create conversation', details: message },
      { status: 500 }
    )
  }
}
