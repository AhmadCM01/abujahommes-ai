import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db/users'

export const dynamic = 'force-dynamic'

/**
 * Dev-only endpoint to retrieve the latest pending or failed verification URL
 * for a specific email address from the email_messages table.
 *
 * Rules:
 * 1. Strictly returns 404 when NODE_ENV === 'production'.
 * 2. Only returns payload.url if a 'queued' or 'failed' row exists for that recipient.
 */
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 })
  }

  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')

  if (!email || !email.trim() || email === 'your email address') {
    return NextResponse.json({ url: null })
  }

  const normalizedEmail = email.trim().toLowerCase()

  if (!pool) {
    return NextResponse.json({ url: null, error: 'Database pool unavailable' }, { status: 503 })
  }

  try {
    const res = await pool.query<{ payload: any; status: string }>(
      `SELECT payload, status
       FROM email_messages
       WHERE LOWER(recipient) = $1
         AND status IN ('queued', 'failed')
       ORDER BY created_at DESC
       LIMIT 1`,
      [normalizedEmail]
    )

    if (res.rows.length === 0) {
      return NextResponse.json({ url: null })
    }

    const row = res.rows[0]
    let payload = row.payload
    if (typeof payload === 'string') {
      try {
        payload = JSON.parse(payload)
      } catch {
        // ignore parse error
      }
    }

    const url =
      typeof payload === 'object' && payload !== null && 'url' in payload
        ? (payload as { url?: string }).url || null
        : null

    return NextResponse.json({ url })
  } catch (error) {
    console.error('[DEV VERIFICATION LINK] Database query error:', error)
    return NextResponse.json({ url: null, error: 'Database error' }, { status: 500 })
  }
}
