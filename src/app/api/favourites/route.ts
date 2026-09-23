import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import {
  fetchUserFavourites,
  fetchUserFavouriteIds,
  toggleUserFavourite,
  DatabaseUnavailableError,
} from '@/lib/db/listings'

export async function GET(req: NextRequest) {
  try {
    const reqHeaders = await headers()
    const session = await auth.api.getSession({ headers: reqHeaders })

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const idsOnly = searchParams.get('idsOnly') === 'true'

    if (idsOnly) {
      const ids = await fetchUserFavouriteIds(session.user.id)
      return NextResponse.json({ favouriteIds: ids })
    }

    const favourites = await fetchUserFavourites(session.user.id)
    return NextResponse.json({
      favourites,
      total: favourites.length,
    })
  } catch (error) {
    if (error instanceof DatabaseUnavailableError) {
      return NextResponse.json({ error: 'Database service unavailable' }, { status: 503 })
    }
    return NextResponse.json(
      { error: 'Failed to fetch favourites', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const reqHeaders = await headers()
    const session = await auth.api.getSession({ headers: reqHeaders })

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Authentication required to save favourites' }, { status: 401 })
    }

    const body = await req.json()
    if (!body.listingId) {
      return NextResponse.json({ error: 'Missing listingId' }, { status: 400 })
    }

    const result = await toggleUserFavourite(session.user.id, body.listingId)
    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof DatabaseUnavailableError) {
      return NextResponse.json({ error: 'Database service unavailable' }, { status: 503 })
    }
    return NextResponse.json(
      { error: 'Failed to update favourite', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
