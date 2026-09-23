import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { getCanonicalUserById } from '@/lib/db/users'
import {
  fetchListingById,
  updateListingRecord,
  deleteListingRecord,
  DatabaseUnavailableError,
} from '@/lib/db/listings'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const listing = await fetchListingById(id, true)
    if (!listing) {
      return NextResponse.json({ error: 'Property listing not found' }, { status: 404 })
    }
    return NextResponse.json({ listing })
  } catch (error) {
    if (error instanceof DatabaseUnavailableError) {
      return NextResponse.json(
        { error: 'Database service unavailable' },
        { status: 503 }
      )
    }
    return NextResponse.json(
      { error: 'Error fetching listing', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const reqHeaders = await headers()
    const session = await auth.api.getSession({ headers: reqHeaders })
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { id } = await params
    const updates = await req.json()

    const userProfile = await getCanonicalUserById(session.user.id)
    const userRole = userProfile?.role || 'buyer'

    const updated = await updateListingRecord(id, updates, session.user.id, userRole)
    return NextResponse.json({ success: true, listing: updated })
  } catch (error) {
    if (error instanceof DatabaseUnavailableError) {
      return NextResponse.json(
        { error: 'Database service unavailable' },
        { status: 503 }
      )
    }
    const msg = error instanceof Error ? error.message : String(error)
    if (msg.includes('Unauthorized')) {
      return NextResponse.json({ error: msg }, { status: 403 })
    }
    if (msg.includes('not found')) {
      return NextResponse.json({ error: msg }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update listing', details: msg }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const reqHeaders = await headers()
    const session = await auth.api.getSession({ headers: reqHeaders })
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { id } = await params
    const userProfile = await getCanonicalUserById(session.user.id)
    const userRole = userProfile?.role || 'buyer'

    const deleted = await deleteListingRecord(id, session.user.id, userRole)
    if (!deleted) {
      return NextResponse.json({ error: 'Listing not found or already deleted' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: `Listing ${id} deleted` })
  } catch (error) {
    if (error instanceof DatabaseUnavailableError) {
      return NextResponse.json(
        { error: 'Database service unavailable' },
        { status: 503 }
      )
    }
    const msg = error instanceof Error ? error.message : String(error)
    if (msg.includes('Unauthorized')) {
      return NextResponse.json({ error: msg }, { status: 403 })
    }
    return NextResponse.json({ error: 'Failed to delete listing', details: msg }, { status: 500 })
  }
}
