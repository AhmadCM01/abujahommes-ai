import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import {
  createListingEnquiry,
  DatabaseUnavailableError,
} from '@/lib/db/listings'

export async function POST(req: NextRequest) {
  try {
    const reqHeaders = await headers()
    const session = await auth.api.getSession({ headers: reqHeaders })

    const body = await req.json()
    if (!body.listing_id || !body.message) {
      return NextResponse.json({ error: 'Missing required enquiry fields (listing_id, message)' }, { status: 400 })
    }

    // If unauthenticated, use guest ID or require session
    const buyerId = session?.user?.id || body.buyer_id || 'guest-buyer'

    const enquiry = await createListingEnquiry(
      {
        listing_id: body.listing_id,
        message: body.message,
        buyer_phone: body.buyer_phone,
        buyer_email: body.buyer_email || session?.user?.email,
        buyer_name: body.buyer_name || session?.user?.name,
      },
      buyerId
    )

    return NextResponse.json({ enquiry, message: 'Enquiry sent successfully' }, { status: 201 })
  } catch (error) {
    if (error instanceof DatabaseUnavailableError) {
      return NextResponse.json({ error: 'Database service unavailable' }, { status: 503 })
    }
    return NextResponse.json(
      { error: 'Failed to send enquiry', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
