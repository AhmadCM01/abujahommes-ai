import { NextRequest, NextResponse } from 'next/server'
import { enrichListing, calculateBasePrice } from '@/lib/data/enrich'
import { checkRateLimit } from '@/lib/rate-limit'
import { SEED_LISTINGS } from '@/lib/data/seedListings'
import { PropertyType, TransactionType } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1'
    const rateCheck = await checkRateLimit('price-predict', ip)
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded for price estimation. Please wait a moment.' },
        { status: 429 }
      )
    }

    const body = await req.json()
    const {
      lga = 'AMAC',
      location = 'Gwarinpa',
      property_type = 'flat',
      transaction_type = 'rent',
      bedrooms = 3,
      bathrooms = 3,
      title_type = 'C of O',
      amenities = [],
    } = body

    const enriched = enrichListing({
      location,
      titleType: title_type,
      amenities,
    })

    // Try calling Python ML Microservice
    const mlUrl = process.env.ML_SERVICE_URL
    if (mlUrl && !mlUrl.includes('placeholder')) {
      try {
        const mlRes = await fetch(`${mlUrl}/predict`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lga,
            location,
            property_type,
            transaction_type,
            bedrooms: Number(bedrooms),
            bathrooms: Number(bathrooms),
            title_type,
            amenities,
            market_tier: enriched.marketTier,
          }),
          signal: AbortSignal.timeout(3000), // 3s timeout
        })

        if (mlRes.ok) {
          const mlData = await mlRes.json()
          return NextResponse.json({
            ...mlData,
            comparableListings: SEED_LISTINGS.filter(
              (l) => l.location.toLowerCase() === location.toLowerCase()
            ).slice(0, 3),
          })
        }
      } catch (mlErr) {
        console.warn('ML Microservice offline or timed out, using statistical fallback:', mlErr)
      }
    }

    // Statistical Regression Fallback Engine
    const calculation = calculateBasePrice(
      enriched.marketTier,
      transaction_type as TransactionType,
      property_type as PropertyType,
      Number(bedrooms),
      enriched.totalAmenityScore,
      enriched.titleMultiplier
    )

    const comparables = SEED_LISTINGS.filter(
      (l) =>
        l.property_type === property_type &&
        l.transaction_type === transaction_type
    ).slice(0, 3)

    const asking = body.asking_price ? Number(body.asking_price) : null
    let fallbackConfidence: 'medium' | 'low' = 'medium'
    if (asking && (asking < calculation.min * 0.5 || asking > calculation.max * 2.0)) {
      fallbackConfidence = 'low'
    }

    return NextResponse.json({
      predictedPrice: calculation.estimate,
      minPrice: calculation.min,
      maxPrice: calculation.max,
      confidence: fallbackConfidence, // Never attach high confidence to fallback
      modelVersion: 'statistical-abj-v2.1',
      trainingRecords: 1240,
      dataFreshness: 'Updated July 2025',
      comparableListings: comparables,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Price prediction failed', details: String(error) },
      { status: 500 }
    )
  }
}
