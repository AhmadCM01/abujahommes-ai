import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { DatabaseUnavailableError } from '@/lib/db/users'
import { fetchConversationById } from '@/lib/db/chat'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const reqHeaders = await headers()
    const session = await auth.api.getSession({ headers: reqHeaders })

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const conversation = await fetchConversationById(id, session.user.id)
    return NextResponse.json({ conversation })
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
    console.error('[API /api/chat/conversations/[id] GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversation', details: message },
      { status: 500 }
    )
  }
}
