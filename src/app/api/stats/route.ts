import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { pool, getCanonicalUserById, DatabaseUnavailableError } from '@/lib/db/users'

export const dynamic = 'force-dynamic'

function getDbPool() {
  if (!pool) {
    throw new DatabaseUnavailableError('Postgres database connection pool is not configured')
  }
  return pool
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const scope = searchParams.get('scope') || 'buyer'

    const reqHeaders = await headers()
    const session = await auth.api.getSession({ headers: reqHeaders })

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const userId = session.user.id
    const db = getDbPool()
    const client = await db.connect()

    try {
      if (scope === 'buyer') {
        let favouritesCount = 0
        let savedSearchesCount = 0
        let activeAlertsCount = 0
        let enquiriesCount = 0

        try {
          const favRes = await client.query(
            'SELECT COUNT(*)::int AS count FROM favourites WHERE user_id = $1',
            [userId]
          )
          favouritesCount = favRes.rows[0]?.count || 0
        } catch {
          // graceful fallback if table query fails
        }

        try {
          const ssRes = await client.query(
            'SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE alert_enabled = true)::int AS alerts FROM saved_searches WHERE user_id = $1',
            [userId]
          )
          savedSearchesCount = ssRes.rows[0]?.total || 0
          activeAlertsCount = ssRes.rows[0]?.alerts || 0
        } catch {
          // graceful fallback
        }

        try {
          const enqRes = await client.query(
            'SELECT COUNT(*)::int AS count FROM enquiries WHERE buyer_id = $1',
            [userId]
          )
          enquiriesCount = enqRes.rows[0]?.count || 0
        } catch {
          // graceful fallback
        }

        return NextResponse.json({
          favouritesCount,
          savedSearchesCount,
          activeAlertsCount,
          enquiriesCount,
        })
      }

      if (scope === 'seller') {
        const statsRes = await client.query(
          `SELECT 
             COUNT(*) FILTER (WHERE status = 'active')::int AS active_count,
             COUNT(*) FILTER (WHERE status = 'pending')::int AS pending_count,
             COALESCE(SUM(views), 0)::int AS total_views,
             COALESCE(SUM(saves), 0)::int AS total_saves,
             COALESCE(SUM(enquiries), 0)::int AS total_enquiries
           FROM listings 
           WHERE owner_id = $1`,
          [userId]
        )

        const row = statsRes.rows[0] || {}

        return NextResponse.json({
          activeCount: row.active_count || 0,
          pendingCount: row.pending_count || 0,
          totalViews: row.total_views || 0,
          totalSaves: row.total_saves || 0,
          totalEnquiries: row.total_enquiries || 0,
        })
      }

      if (scope === 'admin') {
        const userProfile = await getCanonicalUserById(userId)
        if (userProfile?.role !== 'admin') {
          return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
        }

        // Listings aggregates
        const listRes = await client.query(
          `SELECT 
             COUNT(*) FILTER (WHERE status = 'active')::int AS active_count,
             COUNT(*) FILTER (WHERE status = 'pending')::int AS pending_count,
             COUNT(*) FILTER (WHERE fraud_score > 70 OR fraud_risk_level IN ('high', 'critical'))::int AS high_risk_count
           FROM listings`
        )
        const listRow = listRes.rows[0] || {}

        // Users aggregates
        const userRes = await client.query(
          `SELECT 
             COUNT(*)::int AS total_users,
             COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE)::int AS new_today
           FROM profiles 
           WHERE deleted_at IS NULL`
        )
        const userRow = userRes.rows[0] || {}

        // Scraped records (graceful: returns 0 if table does not exist)
        let scrapedCount = 0
        try {
          const scrapedRes = await client.query(
            'SELECT COUNT(*)::int AS count FROM scraped_listings'
          )
          scrapedCount = scrapedRes.rows[0]?.count || 0
        } catch {
          scrapedCount = 0
        }

        // Pending queue for moderation
        let pendingQueue: any[] = []
        try {
          const queueRes = await client.query(
            `SELECT l.*, p.full_name AS seller_name, p.is_verified AS seller_verified 
             FROM listings l 
             LEFT JOIN profiles p ON l.owner_id = p.id 
             WHERE l.status = 'pending' 
             ORDER BY l.created_at DESC 
             LIMIT 50`
          )
          pendingQueue = queueRes.rows.map((r) => ({
            ...r,
            asking_price: Number(r.asking_price),
            views: Number(r.views) || 0,
            saves: Number(r.saves) || 0,
            enquiries: Number(r.enquiries) || 0,
            created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
          }))
        } catch {
          pendingQueue = []
        }

        // High risk listings for admin inspection
        let highRiskListings: any[] = []
        try {
          const riskRes = await client.query(
            `SELECT l.*, p.full_name AS seller_name, p.is_verified AS seller_verified 
             FROM listings l 
             LEFT JOIN profiles p ON l.owner_id = p.id 
             WHERE l.fraud_score > 70 OR l.fraud_risk_level IN ('high', 'critical') 
             ORDER BY l.fraud_score DESC 
             LIMIT 10`
          )
          highRiskListings = riskRes.rows.map((r) => ({
            ...r,
            asking_price: Number(r.asking_price),
            views: Number(r.views) || 0,
            saves: Number(r.saves) || 0,
            enquiries: Number(r.enquiries) || 0,
            created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
          }))
        } catch {
          highRiskListings = []
        }

        return NextResponse.json({
          activeCount: listRow.active_count || 0,
          pendingCount: listRow.pending_count || 0,
          highRiskCount: listRow.high_risk_count || 0,
          totalUsers: userRow.total_users || 0,
          newUsersToday: userRow.new_today || 0,
          scrapedCount,
          pendingQueue,
          highRiskListings,
        })
      }

      return NextResponse.json({ error: `Unknown scope: ${scope}` }, { status: 400 })
    } finally {
      client.release()
    }
  } catch (error) {
    if (error instanceof DatabaseUnavailableError) {
      return NextResponse.json({ error: 'Database service unavailable' }, { status: 503 })
    }
    console.error('[API /api/stats GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
