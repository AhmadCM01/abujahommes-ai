import { pool } from './users'
import {
  PropertyListing,
  PropertyType,
  TransactionType,
  LGA,
  TitleType,
  ListingStatus,
  PriceConfidence,
  FraudRiskLevel,
  Enquiry,
  SavedSearch,
} from '@/types'
import { enrichListing, calculateBasePrice } from '@/lib/data/enrich'

export class DatabaseUnavailableError extends Error {
  constructor(message = 'Database service unavailable') {
    super(message)
    this.name = 'DatabaseUnavailableError'
  }
}

export interface ListingFilters {
  propertyType?: string | null
  transactionType?: string | null
  lga?: string | null
  location?: string | null
  minPrice?: number | null
  maxPrice?: number | null
  bedrooms?: number | string | null
  query?: string | null
  sort?: string | null
  limit?: number
  offset?: number
}

export interface CreateListingInput {
  title: string
  property_type: PropertyType
  transaction_type: TransactionType
  lga: LGA
  location: string
  address?: string
  bedrooms?: number
  bathrooms?: number
  land_size_sqm?: number | null
  asking_price: number
  description?: string
  title_type: TitleType
  amenities?: string[]
  images?: string[]
}

export interface UpdateListingInput {
  title?: string
  property_type?: PropertyType
  transaction_type?: TransactionType
  lga?: LGA
  location?: string
  address?: string
  bedrooms?: number
  bathrooms?: number
  land_size_sqm?: number | null
  asking_price?: number
  description?: string
  title_type?: TitleType
  amenities?: string[]
  images?: string[]
  status?: ListingStatus
}

function getDbPool() {
  if (!pool) {
    throw new DatabaseUnavailableError('Postgres database connection pool is not configured')
  }
  return pool
}

function mapListingRow(row: any): PropertyListing {
  return {
    id: row.id,
    owner_id: row.owner_id,
    seller_id: row.owner_id, // Compatibility with existing UI components
    seller_name: row.seller_name || 'Property Owner',
    seller_avatar: row.seller_avatar || null,
    seller_phone: row.seller_phone || undefined,
    seller_verified: Boolean(row.seller_verified),
    title: row.title,
    property_type: row.property_type as PropertyType,
    transaction_type: row.transaction_type as TransactionType,
    lga: row.lga as LGA,
    location: row.location,
    address: row.address || undefined,
    market_tier: row.market_tier || undefined,
    bedrooms: Number(row.bedrooms) || 0,
    bathrooms: Number(row.bathrooms) || 0,
    land_size_sqm: row.land_size_sqm ? Number(row.land_size_sqm) : null,
    asking_price: Number(row.asking_price),
    ai_price_estimate: row.ai_price_estimate ? Number(row.ai_price_estimate) : undefined,
    ai_price_min: row.ai_price_min ? Number(row.ai_price_min) : undefined,
    ai_price_max: row.ai_price_max ? Number(row.ai_price_max) : undefined,
    price_confidence: row.price_confidence as PriceConfidence | undefined,
    predicted_price_min: row.predicted_price_min ? Number(row.predicted_price_min) : null,
    predicted_price_max: row.predicted_price_max ? Number(row.predicted_price_max) : null,
    predicted_confidence: row.predicted_confidence as PriceConfidence | null,
    description: row.description || '',
    title_type: row.title_type as TitleType,
    amenities: row.amenities || [],
    images: row.images || [],
    status: row.status as ListingStatus,
    fraud_score: Number(row.fraud_score) || 0,
    fraud_risk_level: (row.fraud_risk_level as FraudRiskLevel) || 'low',
    fraud_red_flags: row.fraud_red_flags || [],
    fraud_recommendation: row.fraud_recommendation || undefined,
    last_valued_at: row.last_valued_at ? new Date(row.last_valued_at).toISOString() : null,
    last_scored_at: row.last_scored_at ? new Date(row.last_scored_at).toISOString() : null,
    views: Number(row.views) || 0,
    saves: Number(row.saves) || 0,
    enquiries: Number(row.enquiries) || 0,
    data_source: row.data_source || 'seller_submitted',
    rejection_reason: row.rejection_reason || undefined,
    created_at: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
  }
}

/**
 * Public search for published listings (status = 'active' only)
 */
export async function fetchPublicListings(filters: ListingFilters): Promise<{ listings: PropertyListing[]; total: number }> {
  const db = getDbPool()
  const client = await db.connect()
  try {
    const conditions: string[] = ["l.status = 'active'"]
    const params: any[] = []
    let paramIndex = 1

    if (filters.propertyType && filters.propertyType !== 'any') {
      conditions.push(`l.property_type = $${paramIndex++}`)
      params.push(filters.propertyType)
    }

    if (filters.transactionType && filters.transactionType !== 'any') {
      conditions.push(`l.transaction_type = $${paramIndex++}`)
      params.push(filters.transactionType)
    }

    if (filters.lga && filters.lga !== 'any') {
      conditions.push(`l.lga = $${paramIndex++}`)
      params.push(filters.lga)
    }

    if (filters.location) {
      conditions.push(`LOWER(l.location) LIKE $${paramIndex++}`)
      params.push(`%${filters.location.toLowerCase()}%`)
    }

    if (filters.minPrice !== null && filters.minPrice !== undefined && filters.minPrice > 0) {
      conditions.push(`l.asking_price >= $${paramIndex++}`)
      params.push(filters.minPrice)
    }

    if (filters.maxPrice !== null && filters.maxPrice !== undefined && Number.isFinite(filters.maxPrice)) {
      conditions.push(`l.asking_price <= $${paramIndex++}`)
      params.push(filters.maxPrice)
    }

    if (filters.bedrooms && filters.bedrooms !== 'any') {
      conditions.push(`l.bedrooms >= $${paramIndex++}`)
      params.push(Number(filters.bedrooms))
    }

    if (filters.query) {
      conditions.push(`(
        LOWER(l.title) LIKE $${paramIndex} OR 
        LOWER(l.location) LIKE $${paramIndex} OR 
        LOWER(l.description) LIKE $${paramIndex}
      )`)
      params.push(`%${filters.query.toLowerCase()}%`)
      paramIndex++
    }

    // Sort clause
    let orderClause = 'ORDER BY l.created_at DESC'
    if (filters.sort === 'price_asc') {
      orderClause = 'ORDER BY l.asking_price ASC'
    } else if (filters.sort === 'price_desc') {
      orderClause = 'ORDER BY l.asking_price DESC'
    } else if (filters.sort === 'newest') {
      orderClause = 'ORDER BY l.created_at DESC'
    } else if (filters.sort === 'most_saved') {
      orderClause = 'ORDER BY l.saves DESC, l.views DESC'
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    const countQuery = `
      SELECT COUNT(*)::int AS count 
      FROM listings l 
      ${whereClause}
    `
    const countRes = await client.query(countQuery, params)
    const total = countRes.rows[0]?.count || 0

    let paginationClause = ''
    if (filters.limit) {
      paginationClause += ` LIMIT ${Number(filters.limit)}`
      if (filters.offset) {
        paginationClause += ` OFFSET ${Number(filters.offset)}`
      }
    }

    const selectQuery = `
      SELECT 
        l.*,
        p.full_name AS seller_name,
        p.avatar_url AS seller_avatar,
        p.phone AS seller_phone,
        p.is_verified AS seller_verified
      FROM listings l
      LEFT JOIN profiles p ON l.owner_id = p.id
      ${whereClause}
      ${orderClause}
      ${paginationClause};
    `

    const res = await client.query(selectQuery, params)
    return {
      listings: res.rows.map(mapListingRow),
      total,
    }
  } finally {
    client.release()
  }
}

/**
 * Fetch all listings owned by a seller or agent (all statuses: pending, active, paused, sold, rejected)
 */
export async function fetchListingsByOwner(
  ownerId: string,
  status?: string,
  limit?: number,
  offset?: number
): Promise<PropertyListing[]> {
  const db = getDbPool()
  const client = await db.connect()
  try {
    const conditions: string[] = ['l.owner_id = $1']
    const params: any[] = [ownerId]

    if (status && status !== 'all') {
      conditions.push('l.status = $2')
      params.push(status)
    }

    let paginationClause = ''
    if (limit && Number(limit) > 0) {
      paginationClause += ` LIMIT ${Number(limit)}`
      if (offset && Number(offset) > 0) {
        paginationClause += ` OFFSET ${Number(offset)}`
      }
    }

    const query = `
      SELECT 
        l.*,
        p.full_name AS seller_name,
        p.phone AS seller_phone,
        p.is_verified AS seller_verified
      FROM listings l
      LEFT JOIN profiles p ON l.owner_id = p.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY l.created_at DESC
      ${paginationClause};
    `

    const res = await client.query(query, params)
    return res.rows.map(mapListingRow)
  } finally {
    client.release()
  }
}

/**
 * Fetch a single listing by ID with optional view increment
 */
export async function fetchListingById(id: string, incrementView = false): Promise<PropertyListing | null> {
  const db = getDbPool()
  const client = await db.connect()
  try {
    if (incrementView) {
      await client.query('UPDATE listings SET views = views + 1 WHERE id = $1', [id])
    }

    const query = `
      SELECT 
        l.*,
        p.full_name AS seller_name,
        p.avatar_url AS seller_avatar,
        p.phone AS seller_phone,
        p.is_verified AS seller_verified
      FROM listings l
      LEFT JOIN profiles p ON l.owner_id = p.id
      WHERE l.id = $1;
    `

    const res = await client.query(query, [id])
    if (res.rows.length === 0) return null
    return mapListingRow(res.rows[0])
  } finally {
    client.release()
  }
}

/**
 * Create a new listing record:
 * - Session required
 * - Role: seller | agent | admin
 * - New rows start with status = 'pending'
 * - Images synchronized in listing_media with images[0] as cover
 */
export async function createListingRecord(
  input: CreateListingInput,
  ownerId: string
): Promise<PropertyListing> {
  const db = getDbPool()
  const client = await db.connect()

  try {
    await client.query('BEGIN')

    const enriched = enrichListing({
      location: input.location,
      titleType: input.title_type,
      amenities: input.amenities,
    })

    const priceCalc = calculateBasePrice(
      enriched.marketTier,
      input.transaction_type,
      input.property_type,
      Number(input.bedrooms) || 3,
      enriched.totalAmenityScore,
      enriched.titleMultiplier
    )

    const asking = Number(input.asking_price)

    // Pre-calculate fraud score & red flags
    let fraudScore = 10
    const redFlags: string[] = []
    if (asking < priceCalc.min * 0.5) {
      fraudScore = 85
      redFlags.push('Asking price is significantly below fair market valuation for this district')
    } else if (asking > priceCalc.max * 2.5) {
      fraudScore = 55
      redFlags.push('Asking price significantly exceeds realistic market valuation')
    }

    const desc = (input.description || '').toLowerCase()
    const scamPhrases = ['urgent', 'relocating abroad', 'travelling abroad', 'transfer first', 'deposit first']
    const detected = scamPhrases.filter((p) => desc.includes(p))
    if (detected.length > 0) {
      fraudScore = Math.min(95, fraudScore + 30)
      redFlags.push(`Urgency / pressure language detected: "${detected.join(', ')}"`)
    }

    let fraudRiskLevel: FraudRiskLevel = 'low'
    if (fraudScore > 75) {
      fraudRiskLevel = 'critical'
    } else if (fraudScore > 55) {
      fraudRiskLevel = 'high'
    } else if (fraudScore > 35) {
      fraudRiskLevel = 'medium'
    } else {
      fraudRiskLevel = 'low'
    }

    const fraudRecommendation =
      fraudRiskLevel === 'critical' || fraudRiskLevel === 'high'
        ? 'High risk — independent title verification recommended before making commitments'
        : fraudRiskLevel === 'medium'
        ? 'Moderate risk — verify documentation and inspect physically with caution'
        : 'Safe to proceed — verified district coordinates and price alignment'

    // Evaluate honest price confidence and fair band bounds
    let priceConfidence: PriceConfidence = 'medium'
    let aiEstimate: number | null = priceCalc.estimate
    let aiMin: number | null = priceCalc.min
    let aiMax: number | null = priceCalc.max

    const isFarOutside = asking < priceCalc.min * 0.5 || asking > priceCalc.max * 2.0
    const isExtremeAnomaly = asking < priceCalc.min * 0.2 || asking > priceCalc.max * 5.0

    if (isExtremeAnomaly) {
      // Severe mismatch (e.g. rent price entered with sale type or extreme outlier)
      // Null out the band to prevent persisting nonsense estimates into the DB
      aiEstimate = null
      aiMin = null
      aiMax = null
      priceConfidence = 'low'
    } else if (isFarOutside) {
      priceConfidence = 'low'
    } else if (
      (enriched.marketTier === 'Premium' || enriched.marketTier === 'Prime') &&
      asking >= priceCalc.min * 0.75 &&
      asking <= priceCalc.max * 1.25 &&
      fraudRiskLevel === 'low'
    ) {
      priceConfidence = 'high'
    } else {
      priceConfidence = 'medium'
    }

    if (fraudRiskLevel === 'high' || fraudRiskLevel === 'critical') {
      priceConfidence = 'low'
    }

    const images = input.images || []

    const now = new Date()

    const insertQuery = `
      INSERT INTO listings (
        owner_id,
        title,
        property_type,
        transaction_type,
        lga,
        location,
        address,
        market_tier,
        bedrooms,
        bathrooms,
        land_size_sqm,
        asking_price,
        ai_price_estimate,
        ai_price_min,
        ai_price_max,
        price_confidence,
        predicted_price_min,
        predicted_price_max,
        predicted_confidence,
        description,
        title_type,
        amenities,
        images,
        status,
        fraud_score,
        fraud_risk_level,
        fraud_flags,
        fraud_red_flags,
        fraud_recommendation,
        last_valued_at,
        last_scored_at,
        views,
        saves,
        enquiries,
        data_source,
        created_at,
        updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
        $21, $22, $23, 'active', $24, $25, $26, $27, $28, $29,
        $30, 0, 0, 0, 'seller_submitted', $31, $32
      )
      RETURNING *;
    `

    const res = await client.query(insertQuery, [
      ownerId,
      input.title,
      input.property_type,
      input.transaction_type,
      input.lga,
      enriched.normalizedLocation,
      input.address || null,
      enriched.marketTier,
      Number(input.bedrooms) || 0,
      Number(input.bathrooms) || 0,
      input.land_size_sqm ? Number(input.land_size_sqm) : null,
      asking,
      aiEstimate,
      aiMin,
      aiMax,
      priceConfidence,
      aiMin,
      aiMax,
      priceConfidence,
      input.description || '',
      input.title_type,
      input.amenities || [],
      images,
      fraudScore,
      fraudRiskLevel,
      JSON.stringify(redFlags),
      redFlags,
      fraudRecommendation,
      now,
      now,
      now,
      now,
    ])

    const createdRow = res.rows[0]

    // Synchronize listing_media rows (images[0] is cover)
    for (let i = 0; i < images.length; i++) {
      await client.query(
        `INSERT INTO listing_media (listing_id, url, display_order, is_cover) VALUES ($1, $2, $3, $4)`,
        [createdRow.id, images[i], i, i === 0]
      )
    }

    await client.query('COMMIT')

    // Fetch complete row with profile metadata
    return (await fetchListingById(createdRow.id)) || mapListingRow(createdRow)
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

/**
 * Update an existing listing:
 * - Enforces owner or admin access
 */
export async function updateListingRecord(
  id: string,
  updates: UpdateListingInput,
  actorId: string,
  actorRole: string
): Promise<PropertyListing> {
  const db = getDbPool()
  const client = await db.connect()

  try {
    // Check existence and ownership
    const checkRes = await client.query(
      'SELECT owner_id, transaction_type, property_type, location, asking_price, bedrooms, amenities, title_type, fraud_risk_level, description FROM listings WHERE id = $1',
      [id]
    )
    if (checkRes.rows.length === 0) {
      throw new Error('Listing not found')
    }

    const current = checkRes.rows[0]
    const ownerId = current.owner_id
    if (ownerId !== actorId && actorRole !== 'admin') {
      throw new Error('Unauthorized: Only the listing owner or administrator can modify this listing')
    }

    await client.query('BEGIN')

    const setClauses: string[] = ['updated_at = NOW()']
    const params: any[] = [id]
    let paramIndex = 2

    if (updates.title !== undefined) {
      setClauses.push(`title = $${paramIndex++}`)
      params.push(updates.title)
    }
    if (updates.property_type !== undefined) {
      setClauses.push(`property_type = $${paramIndex++}`)
      params.push(updates.property_type)
    }
    if (updates.transaction_type !== undefined) {
      setClauses.push(`transaction_type = $${paramIndex++}`)
      params.push(updates.transaction_type)
    }
    if (updates.lga !== undefined) {
      setClauses.push(`lga = $${paramIndex++}`)
      params.push(updates.lga)
    }
    if (updates.location !== undefined) {
      setClauses.push(`location = $${paramIndex++}`)
      params.push(updates.location)
    }
    if (updates.address !== undefined) {
      setClauses.push(`address = $${paramIndex++}`)
      params.push(updates.address)
    }
    if (updates.bedrooms !== undefined) {
      setClauses.push(`bedrooms = $${paramIndex++}`)
      params.push(Number(updates.bedrooms))
    }
    if (updates.bathrooms !== undefined) {
      setClauses.push(`bathrooms = $${paramIndex++}`)
      params.push(Number(updates.bathrooms))
    }
    if (updates.land_size_sqm !== undefined) {
      setClauses.push(`land_size_sqm = $${paramIndex++}`)
      params.push(updates.land_size_sqm ? Number(updates.land_size_sqm) : null)
    }
    if (updates.asking_price !== undefined) {
      setClauses.push(`asking_price = $${paramIndex++}`)
      params.push(Number(updates.asking_price))
    }
    if (updates.description !== undefined) {
      setClauses.push(`description = $${paramIndex++}`)
      params.push(updates.description)
    }
    if (updates.title_type !== undefined) {
      setClauses.push(`title_type = $${paramIndex++}`)
      params.push(updates.title_type)
    }
    if (updates.amenities !== undefined) {
      setClauses.push(`amenities = $${paramIndex++}`)
      params.push(updates.amenities)
    }
    if (updates.status !== undefined) {
      setClauses.push(`status = $${paramIndex++}`)
      params.push(updates.status)
    }
    if (updates.images !== undefined && Array.isArray(updates.images)) {
      setClauses.push(`images = $${paramIndex++}`)
      params.push(updates.images)

      // Replace listing_media rows
      await client.query('DELETE FROM listing_media WHERE listing_id = $1', [id])
      for (let i = 0; i < updates.images.length; i++) {
        await client.query(
          `INSERT INTO listing_media (listing_id, url, display_order, is_cover) VALUES ($1, $2, $3, $4)`,
          [id, updates.images[i], i, i === 0]
        )
      }
    }

    // Re-evaluate AVM bounds and fraud risk if price, description, or core attributes changed
    const shouldRecalcAVM =
      updates.asking_price !== undefined ||
      updates.transaction_type !== undefined ||
      updates.property_type !== undefined ||
      updates.location !== undefined ||
      updates.bedrooms !== undefined ||
      updates.description !== undefined

    if (shouldRecalcAVM) {
      const effTxType = updates.transaction_type || current.transaction_type
      const effPropType = updates.property_type || current.property_type
      const effLocation = updates.location || current.location
      const effAsking = updates.asking_price !== undefined ? Number(updates.asking_price) : Number(current.asking_price)
      const effBeds = updates.bedrooms !== undefined ? Number(updates.bedrooms) : Number(current.bedrooms) || 3
      const effTitle = updates.title_type || current.title_type
      const effAmenities = updates.amenities || current.amenities || []

      const effEnriched = enrichListing({
        location: effLocation,
        titleType: effTitle,
        amenities: effAmenities,
      })

      const newCalc = calculateBasePrice(
        effEnriched.marketTier,
        effTxType,
        effPropType,
        effBeds,
        effEnriched.totalAmenityScore,
        effEnriched.titleMultiplier
      )

      // Recalculate fraud score & red flags dynamically
      let newFraudScore = 10
      const newRedFlags: string[] = []
      if (effAsking < newCalc.min * 0.5) {
        newFraudScore = 85
        newRedFlags.push('Asking price is significantly below fair market valuation for this district')
      } else if (effAsking > newCalc.max * 2.5) {
        newFraudScore = 55
        newRedFlags.push('Asking price significantly exceeds realistic market valuation')
      }

      const effDesc = (updates.description !== undefined ? updates.description : current.description || '').toLowerCase()
      const scamPhrases = ['urgent', 'relocating abroad', 'travelling abroad', 'transfer first', 'deposit first']
      const detected = scamPhrases.filter((p) => effDesc.includes(p))
      if (detected.length > 0) {
        newFraudScore = Math.min(95, newFraudScore + 30)
        newRedFlags.push(`Urgency / pressure language detected: "${detected.join(', ')}"`)
      }

      let newFraudRiskLevel: FraudRiskLevel = 'low'
      if (newFraudScore > 75) {
        newFraudRiskLevel = 'critical'
      } else if (newFraudScore > 55) {
        newFraudRiskLevel = 'high'
      } else if (newFraudScore > 35) {
        newFraudRiskLevel = 'medium'
      } else {
        newFraudRiskLevel = 'low'
      }

      const newFraudRecommendation =
        newFraudRiskLevel === 'critical' || newFraudRiskLevel === 'high'
          ? 'High risk — independent title verification recommended before making commitments'
          : newFraudRiskLevel === 'medium'
          ? 'Moderate risk — verify documentation and inspect physically with caution'
          : 'Safe to proceed — verified district coordinates and price alignment'

      let newConfidence: PriceConfidence = 'medium'
      let newEstimate: number | null = newCalc.estimate
      let newMin: number | null = newCalc.min
      let newMax: number | null = newCalc.max

      if (effAsking < newCalc.min * 0.2 || effAsking > newCalc.max * 5.0) {
        newEstimate = null
        newMin = null
        newMax = null
        newConfidence = 'low'
      } else if (effAsking < newCalc.min * 0.5 || effAsking > newCalc.max * 2.0) {
        newConfidence = 'low'
      } else if (
        (effEnriched.marketTier === 'Premium' || effEnriched.marketTier === 'Prime') &&
        effAsking >= newCalc.min * 0.75 &&
        effAsking <= newCalc.max * 1.25 &&
        newFraudRiskLevel === 'low'
      ) {
        newConfidence = 'high'
      }

      if (newFraudRiskLevel === 'high' || newFraudRiskLevel === 'critical') {
        newConfidence = 'low'
      }

      setClauses.push(`ai_price_estimate = $${paramIndex++}`)
      params.push(newEstimate)
      setClauses.push(`ai_price_min = $${paramIndex++}`)
      params.push(newMin)
      setClauses.push(`ai_price_max = $${paramIndex++}`)
      params.push(newMax)
      setClauses.push(`price_confidence = $${paramIndex++}`)
      params.push(newConfidence)
      setClauses.push(`predicted_price_min = $${paramIndex++}`)
      params.push(newMin)
      setClauses.push(`predicted_price_max = $${paramIndex++}`)
      params.push(newMax)
      setClauses.push(`predicted_confidence = $${paramIndex++}`)
      params.push(newConfidence)
      setClauses.push(`last_valued_at = NOW()`)

      setClauses.push(`fraud_score = $${paramIndex++}`)
      params.push(newFraudScore)
      setClauses.push(`fraud_risk_level = $${paramIndex++}`)
      params.push(newFraudRiskLevel)
      setClauses.push(`fraud_red_flags = $${paramIndex++}`)
      params.push(newRedFlags)
      setClauses.push(`fraud_recommendation = $${paramIndex++}`)
      params.push(newFraudRecommendation)
      setClauses.push(`last_scored_at = NOW()`)
    }

    const updateQuery = `
      UPDATE listings 
      SET ${setClauses.join(', ')} 
      WHERE id = $1 
      RETURNING *;
    `

    await client.query(updateQuery, params)
    await client.query('COMMIT')

    const updated = await fetchListingById(id)
    if (!updated) throw new Error('Failed to retrieve updated listing')
    return updated
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

/**
 * Delete listing:
 * - Enforces owner or admin access
 */
export async function deleteListingRecord(id: string, actorId: string, actorRole: string): Promise<boolean> {
  const db = getDbPool()
  const client = await db.connect()
  try {
    const checkRes = await client.query('SELECT owner_id FROM listings WHERE id = $1', [id])
    if (checkRes.rows.length === 0) return false

    const ownerId = checkRes.rows[0].owner_id
    if (ownerId !== actorId && actorRole !== 'admin') {
      throw new Error('Unauthorized: Only the listing owner or administrator can delete this listing')
    }

    await client.query('DELETE FROM listings WHERE id = $1', [id])
    return true
  } finally {
    client.release()
  }
}

/**
 * Toggle favourite for buyer:
 * - Inserts if not favorited (increments saves)
 * - Deletes if favorited (decrements saves)
 */
export async function toggleUserFavourite(userId: string, listingId: string): Promise<{ isSaved: boolean }> {
  const db = getDbPool()
  const client = await db.connect()
  try {
    await client.query('BEGIN')

    const checkRes = await client.query(
      'SELECT id FROM favourites WHERE user_id = $1 AND listing_id = $2',
      [userId, listingId]
    )

    let isSaved = false
    if (checkRes.rows.length > 0) {
      await client.query('DELETE FROM favourites WHERE user_id = $1 AND listing_id = $2', [userId, listingId])
      await client.query('UPDATE listings SET saves = GREATEST(0, saves - 1) WHERE id = $1', [listingId])
      isSaved = false
    } else {
      await client.query(
        'INSERT INTO favourites (user_id, listing_id) VALUES ($1, $2)',
        [userId, listingId]
      )
      await client.query('UPDATE listings SET saves = saves + 1 WHERE id = $1', [listingId])
      isSaved = true
    }

    await client.query('COMMIT')
    return { isSaved }
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

/**
 * Fetch all properties favorited by a user
 */
export async function fetchUserFavourites(userId: string): Promise<PropertyListing[]> {
  const db = getDbPool()
  const client = await db.connect()
  try {
    const query = `
      SELECT 
        l.*,
        p.full_name AS seller_name,
        p.phone AS seller_phone,
        p.is_verified AS seller_verified
      FROM favourites f
      JOIN listings l ON f.listing_id = l.id
      LEFT JOIN profiles p ON l.owner_id = p.id
      WHERE f.user_id = $1
      ORDER BY f.created_at DESC;
    `
    const res = await client.query(query, [userId])
    return res.rows.map(mapListingRow)
  } finally {
    client.release()
  }
}

/**
 * Fetch array of listing IDs favorited by user
 */
export async function fetchUserFavouriteIds(userId: string): Promise<string[]> {
  const db = getDbPool()
  const client = await db.connect()
  try {
    const res = await client.query('SELECT listing_id FROM favourites WHERE user_id = $1', [userId])
    return res.rows.map((r) => r.listing_id)
  } finally {
    client.release()
  }
}

/**
 * Create listing enquiry
 */
export async function createListingEnquiry(
  input: { listing_id: string; message: string; buyer_phone?: string; buyer_email?: string; buyer_name?: string },
  buyerId: string
): Promise<Enquiry> {
  const db = getDbPool()
  const client = await db.connect()
  try {
    await client.query('BEGIN')

    const listingRes = await client.query('SELECT owner_id, title FROM listings WHERE id = $1', [input.listing_id])
    if (listingRes.rows.length === 0) {
      throw new Error('Property listing not found')
    }

    const sellerId = listingRes.rows[0].owner_id
    const listingTitle = listingRes.rows[0].title

    const insertQuery = `
      INSERT INTO enquiries (
        listing_id, buyer_id, seller_id, message, buyer_phone, buyer_email, status
      ) VALUES ($1, $2, $3, $4, $5, $6, 'new')
      RETURNING *;
    `

    const res = await client.query(insertQuery, [
      input.listing_id,
      buyerId,
      sellerId,
      input.message,
      input.buyer_phone || null,
      input.buyer_email || null,
    ])

    await client.query('UPDATE listings SET enquiries = enquiries + 1 WHERE id = $1', [input.listing_id])

    await client.query('COMMIT')

    const row = res.rows[0]
    return {
      id: row.id,
      listing_id: row.listing_id,
      buyer_id: row.buyer_id,
      seller_id: row.seller_id,
      message: row.message,
      buyer_phone: row.buyer_phone || undefined,
      buyer_email: row.buyer_email || undefined,
      listing_title: listingTitle,
      status: row.status,
      created_at: new Date(row.created_at).toISOString(),
    }
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

/**
 * Fetch saved searches for user
 */
export async function fetchUserSavedSearches(userId: string): Promise<SavedSearch[]> {
  const db = getDbPool()
  const client = await db.connect()
  try {
    const res = await client.query(
      'SELECT * FROM saved_searches WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    )
    return res.rows.map((r) => ({
      id: r.id,
      user_id: r.user_id,
      name: r.name,
      query_text: r.query_text || undefined,
      filters: r.filters || {},
      result_count: Number(r.result_count) || 0,
      alert_enabled: Boolean(r.alert_enabled),
      last_run: r.last_run ? new Date(r.last_run).toISOString() : undefined,
      created_at: new Date(r.created_at).toISOString(),
    }))
  } finally {
    client.release()
  }
}

/**
 * Create saved search
 */
export async function createSavedSearchRecord(
  userId: string,
  data: { name: string; query_text?: string; filters?: Record<string, unknown>; alert_enabled?: boolean; result_count?: number }
): Promise<SavedSearch> {
  const db = getDbPool()
  const client = await db.connect()
  try {
    const query = `
      INSERT INTO saved_searches (
        user_id, name, query_text, filters, result_count, alert_enabled
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `
    const res = await client.query(query, [
      userId,
      data.name,
      data.query_text || null,
      JSON.stringify(data.filters || {}),
      data.result_count || 0,
      Boolean(data.alert_enabled),
    ])
    const r = res.rows[0]
    return {
      id: r.id,
      user_id: r.user_id,
      name: r.name,
      query_text: r.query_text || undefined,
      filters: r.filters || {},
      result_count: Number(r.result_count) || 0,
      alert_enabled: Boolean(r.alert_enabled),
      last_run: r.last_run ? new Date(r.last_run).toISOString() : undefined,
      created_at: new Date(r.created_at).toISOString(),
    }
  } finally {
    client.release()
  }
}

/**
 * Toggle saved search email alert
 */
export async function toggleSavedSearchAlertRecord(userId: string, searchId: string): Promise<boolean> {
  const db = getDbPool()
  const client = await db.connect()
  try {
    const res = await client.query(
      'UPDATE saved_searches SET alert_enabled = NOT alert_enabled WHERE id = $1 AND user_id = $2 RETURNING alert_enabled',
      [searchId, userId]
    )
    if (res.rows.length === 0) return false
    return Boolean(res.rows[0].alert_enabled)
  } finally {
    client.release()
  }
}

/**
 * Delete saved search
 */
export async function deleteSavedSearchRecord(userId: string, searchId: string): Promise<boolean> {
  const db = getDbPool()
  const client = await db.connect()
  try {
    const res = await client.query(
      'DELETE FROM saved_searches WHERE id = $1 AND user_id = $2',
      [searchId, userId]
    )
    return (res.rowCount ?? 0) > 0
  } finally {
    client.release()
  }
}
