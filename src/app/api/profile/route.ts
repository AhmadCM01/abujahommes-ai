import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { updateCanonicalUserProfile, DatabaseUnavailableError } from '@/lib/db/users'

export const dynamic = 'force-dynamic'

export async function PATCH(req: NextRequest) {
  try {
    const reqHeaders = await headers()
    const session = await auth.api.getSession({ headers: reqHeaders })

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await req.json()
    const updated = await updateCanonicalUserProfile(session.user.id, {
      full_name: body.full_name,
      phone: body.phone,
      avatar_url: body.avatar_url,
      budget_min: body.budget_min !== undefined ? Number(body.budget_min) : undefined,
      budget_max: body.budget_max !== undefined ? Number(body.budget_max) : undefined,
      preferred_lgas: body.preferred_lgas,
      preferred_property_types: body.preferred_property_types,
      preferred_transaction_type: body.preferred_transaction_type,
    })

    return NextResponse.json({
      success: true,
      profile: updated,
    })
  } catch (error) {
    if (error instanceof DatabaseUnavailableError) {
      return NextResponse.json(
        { error: 'Database service unavailable' },
        { status: 503 }
      )
    }
    console.error('[API /api/profile PATCH] Error:', error)
    return NextResponse.json(
      { error: 'Failed to update profile', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
