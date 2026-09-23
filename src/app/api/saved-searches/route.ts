import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import {
  fetchUserSavedSearches,
  createSavedSearchRecord,
  toggleSavedSearchAlertRecord,
  deleteSavedSearchRecord,
  DatabaseUnavailableError,
} from '@/lib/db/listings'

export async function GET(req: NextRequest) {
  try {
    const reqHeaders = await headers()
    const session = await auth.api.getSession({ headers: reqHeaders })

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const searches = await fetchUserSavedSearches(session.user.id)
    return NextResponse.json({ searches, total: searches.length })
  } catch (error) {
    if (error instanceof DatabaseUnavailableError) {
      return NextResponse.json({ error: 'Database service unavailable' }, { status: 503 })
    }
    return NextResponse.json(
      { error: 'Failed to fetch saved searches', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const reqHeaders = await headers()
    const session = await auth.api.getSession({ headers: reqHeaders })

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await req.json()
    if (!body.name) {
      return NextResponse.json({ error: 'Search name is required' }, { status: 400 })
    }

    const search = await createSavedSearchRecord(session.user.id, {
      name: body.name,
      query_text: body.query_text,
      filters: body.filters,
      alert_enabled: body.alert_enabled ?? true,
      result_count: body.result_count ?? 0,
    })

    return NextResponse.json({ search }, { status: 201 })
  } catch (error) {
    if (error instanceof DatabaseUnavailableError) {
      return NextResponse.json({ error: 'Database service unavailable' }, { status: 503 })
    }
    return NextResponse.json(
      { error: 'Failed to create saved search', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const reqHeaders = await headers()
    const session = await auth.api.getSession({ headers: reqHeaders })

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const searchId = searchParams.get('id')
    if (!searchId) {
      return NextResponse.json({ error: 'Missing searchId' }, { status: 400 })
    }

    const newAlertStatus = await toggleSavedSearchAlertRecord(session.user.id, searchId)
    return NextResponse.json({ success: true, alertEnabled: newAlertStatus })
  } catch (error) {
    if (error instanceof DatabaseUnavailableError) {
      return NextResponse.json({ error: 'Database service unavailable' }, { status: 503 })
    }
    return NextResponse.json(
      { error: 'Failed to toggle alert', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const reqHeaders = await headers()
    const session = await auth.api.getSession({ headers: reqHeaders })

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const searchId = searchParams.get('id')
    if (!searchId) {
      return NextResponse.json({ error: 'Missing searchId' }, { status: 400 })
    }

    const success = await deleteSavedSearchRecord(session.user.id, searchId)
    return NextResponse.json({ success })
  } catch (error) {
    if (error instanceof DatabaseUnavailableError) {
      return NextResponse.json({ error: 'Database service unavailable' }, { status: 503 })
    }
    return NextResponse.json(
      { error: 'Failed to delete saved search', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
