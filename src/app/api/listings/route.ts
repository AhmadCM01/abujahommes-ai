import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { getCanonicalUserById } from '@/lib/db/users'
import {
  fetchPublicListings,
  fetchListingsByOwner,
  createListingRecord,
  DatabaseUnavailableError,
} from '@/lib/db/listings'
import { isValidLocationInLGA } from '@/lib/data/locations'
import { LGA } from '@/types'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const isOwnerQuery = searchParams.get('owner') === 'me' || searchParams.get('my') === 'true'
    const requestedOwnerId = searchParams.get('ownerId')

    // If query is for seller's own listings
    if (isOwnerQuery || requestedOwnerId) {
      const reqHeaders = await headers()
      const session = await auth.api.getSession({ headers: reqHeaders })

      if (!session || !session.user) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }

      const ownerId = isOwnerQuery ? session.user.id : requestedOwnerId!
      const profile = await getCanonicalUserById(session.user.id)
      const userRole = profile?.role || 'buyer'

      // Only the owner themselves or admin can see all statuses
      if (ownerId !== session.user.id && userRole !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      const status = searchParams.get('status') || undefined
      const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined
      const offset = searchParams.get('offset') ? Number(searchParams.get('offset')) : undefined
      const ownerListings = await fetchListingsByOwner(ownerId, status, limit, offset)
      return NextResponse.json({
        listings: ownerListings,
        total: ownerListings.length,
      })
    }

    // Public search (active status only)
    const propertyType = searchParams.get('propertyType')
    const transactionType = searchParams.get('transactionType')
    const lga = searchParams.get('lga')
    const location = searchParams.get('location')

    // Validate geography combination if both lga and location are provided
    if (lga && lga !== 'any' && location && location.trim() !== '') {
      if (!isValidLocationInLGA(location, lga as LGA)) {
        return NextResponse.json(
          { error: `Invalid geography combination: Location '${location}' does not belong to Area Council '${lga}'` },
          { status: 400 }
        )
      }
    }

    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : null
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : null
    const bedrooms = searchParams.get('bedrooms')
    const query = searchParams.get('query')
    const sort = searchParams.get('sort') || 'relevance'
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined
    const offset = searchParams.get('offset') ? Number(searchParams.get('offset')) : undefined

    const { listings, total } = await fetchPublicListings({
      propertyType,
      transactionType,
      lga,
      location,
      minPrice,
      maxPrice,
      bedrooms,
      query,
      sort,
      limit,
      offset,
    })

    return NextResponse.json({
      listings,
      total,
    })
  } catch (error) {
    if (error instanceof DatabaseUnavailableError) {
      return NextResponse.json(
        { error: 'Database service unavailable. Please ensure database connection is configured.' },
        { status: 503 }
      )
    }
    console.error('[API /api/listings GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch listings', details: error instanceof Error ? error.message : String(error) },
      { status: 503 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. Session verification
    const reqHeaders = await headers()
    const session = await auth.api.getSession({ headers: reqHeaders })

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Authentication required to create a listing' }, { status: 401 })
    }

    // 2. Role authorization check (seller, agent, or admin)
    const userProfile = await getCanonicalUserById(session.user.id)
    const role = userProfile?.role || 'buyer'

    if (role !== 'seller' && role !== 'agent' && role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Only verified sellers, agents, or admins can create listings' },
        { status: 403 }
      )
    }

    // 3. Body validation
    const body = await req.json()

    if (!body.title || !body.asking_price || !body.lga || !body.location) {
      return NextResponse.json({ error: 'Missing required listing fields (title, asking_price, lga, location)' }, { status: 400 })
    }

    if (!isValidLocationInLGA(body.location, body.lga as LGA)) {
      return NextResponse.json(
        { error: `Invalid geography combination: Location '${body.location}' does not belong to Area Council '${body.lga}'` },
        { status: 400 }
      )
    }

    if (body.images && Array.isArray(body.images) && body.images.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 photos permitted per listing' },
        { status: 400 }
      )
    }

    // 4. Persistence into PostgreSQL
    const newListing = await createListingRecord(
      {
        title: body.title,
        property_type: body.property_type || 'flat',
        transaction_type: body.transaction_type || 'rent',
        lga: body.lga,
        location: body.location,
        address: body.address || '',
        bedrooms: Number(body.bedrooms) || 0,
        bathrooms: Number(body.bathrooms) || 0,
        land_size_sqm: body.land_size_sqm ? Number(body.land_size_sqm) : null,
        asking_price: Number(body.asking_price),
        description: body.description || '',
        title_type: body.title_type || 'C of O',
        amenities: body.amenities || [],
        images: Array.isArray(body.images) ? body.images : [],
      },
      session.user.id
    )

    return NextResponse.json(
      {
        listingId: newListing.id,
        status: newListing.status,
        listing: newListing,
        message: 'Listing published successfully and is now active.',
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof DatabaseUnavailableError) {
      return NextResponse.json(
        { error: 'Database service unavailable' },
        { status: 503 }
      )
    }
    console.error('[API /api/listings POST] Error:', error)
    return NextResponse.json(
      { error: 'Failed to create listing', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
