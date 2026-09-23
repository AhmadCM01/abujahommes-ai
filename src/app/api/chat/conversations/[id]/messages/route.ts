import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { DatabaseUnavailableError } from '@/lib/db/users'
import { fetchMessagesForConversation, createMessage } from '@/lib/db/chat'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/chat/conversations/[id]/messages
 * Retrieve messages for a conversation (only if user is a participant)
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const reqHeaders = await headers()
    const session = await auth.api.getSession({ headers: reqHeaders })

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const messages = await fetchMessagesForConversation(id, session.user.id)
    return NextResponse.json({ messages })
  } catch (error) {
    if (error instanceof DatabaseUnavailableError) {
      return NextResponse.json({ error: 'Database service unavailable' }, { status: 503 })
    }
    const message = error instanceof Error ? error.message : String(error)
    if (message.includes('Forbidden')) {
      return NextResponse.json({ error: message }, { status: 403 })
    }
    if (message.includes('not found')) {
      return NextResponse.json({ error: message }, { status: 404 })
    }
    console.error('[API /api/chat/conversations/[id]/messages GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages', details: message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/chat/conversations/[id]/messages
 * Post a new message to a conversation
 * - Rule 4: Empty message body -> 400. Trim body. Max length ~2000 chars.
 * - Enforces that session user is a participant in this conversation.
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const reqHeaders = await headers()
    const session = await auth.api.getSession({ headers: reqHeaders })

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const bodyData = await req.json().catch(() => ({}))
    const rawBody = bodyData.body

    if (typeof rawBody !== 'string') {
      return NextResponse.json({ error: 'Field "body" must be a string' }, { status: 400 })
    }

    const trimmedBody = rawBody.trim()

    // Rule 4: Empty message body -> 400
    if (!trimmedBody || trimmedBody.length === 0) {
      return NextResponse.json({ error: 'Message body cannot be empty' }, { status: 400 })
    }

    // Rule 4: Max length ~2000 chars -> 400
    if (trimmedBody.length > 2000) {
      return NextResponse.json(
        { error: 'Message body exceeds maximum length of 2000 characters' },
        { status: 400 }
      )
    }

    const created = await createMessage(id, session.user.id, trimmedBody)
    return NextResponse.json({ success: true, message: created }, { status: 201 })
  } catch (error) {
    if (error instanceof DatabaseUnavailableError) {
      return NextResponse.json({ error: 'Database service unavailable' }, { status: 503 })
    }
    const message = error instanceof Error ? error.message : String(error)
    if (message.includes('Forbidden')) {
      return NextResponse.json({ error: message }, { status: 403 })
    }
    if (message.includes('not found')) {
      return NextResponse.json({ error: message }, { status: 404 })
    }
    console.error('[API /api/chat/conversations/[id]/messages POST] Error:', error)
    return NextResponse.json(
      { error: 'Failed to send message', details: message },
      { status: 500 }
    )
  }
}
