import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1'
    const rateCheck = await checkRateLimit('fraud', ip)
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded for fraud evaluation' },
        { status: 429 }
      )
    }

    const { listing, marketAverage, marketMin, marketMax } = await req.json()
    if (!listing) {
      return NextResponse.json({ error: 'Listing payload is required' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY

    if (apiKey && !apiKey.includes('placeholder')) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

        const prompt = `You are a Nigerian real estate fraud detection AI specialising in the Abuja property market.

Analyse this listing against the market data provided and return ONLY valid JSON:
Listing Title: ${listing.title}
Location: ${listing.location}, LGA: ${listing.lga}
Property Type: ${listing.property_type}
Asking Price: NGN ${listing.asking_price}
Market Average: NGN ${marketAverage || 'Unknown'} (Min: NGN ${marketMin}, Max: NGN ${marketMax})
Title Type: ${listing.title_type || 'None specified'}
Description: ${listing.description || ''}

Return ONLY valid JSON matching this schema, no markdown, no backticks:
{
  "fraudScore": number between 0-100,
  "riskLevel": "low" | "medium" | "high" | "critical",
  "redFlags": ["array of specific issues found"],
  "recommendation": "Safe to proceed" | "Proceed with caution" | "Verify title before payment" | "Do not proceed - high fraud risk",
  "analysis": "two sentence explanation of the assessment"
}`

        const result = await model.generateContent(prompt)
        const responseText = result.response.text().trim()
        const cleanedJson = responseText
          .replace(/```json/gi, '')
          .replace(/```/g, '')
          .trim()

        const parsed = JSON.parse(cleanedJson)
        return NextResponse.json(parsed)
      } catch (geminiError) {
        console.warn('Gemini fraud scoring failed, running rule engine:', geminiError)
      }
    }

    // Rule-Based Fallback Fraud Analyzer
    const redFlags: string[] = []
    let score = 10

    const desc = (listing.description || '').toLowerCase()
    const price = listing.asking_price || 0
    const avg = marketAverage || price

    // 1. Price Anomaly
    if (avg > 0 && price < avg * 0.55) {
      score += 45
      redFlags.push(
        `Price (NGN ${price.toLocaleString()}) is more than 45% below area median (NGN ${avg.toLocaleString()})`
      )
    } else if (avg > 0 && price > avg * 2.2) {
      score += 25
      redFlags.push('Asking price significantly exceeds realistic Abuja market valuation')
    }

    // 2. Pressure Language
    const pressureKeywords = ['urgent', 'relocating abroad', 'travelling abroad', 'transfer first', 'deposit first', 'no agents']
    const foundKeywords = pressureKeywords.filter((k) => desc.includes(k))
    if (foundKeywords.length > 0) {
      score += 35
      redFlags.push(`Pressure/urgency phrases detected: "${foundKeywords.join(', ')}"`)
    }

    // 3. Title Verification
    if (!listing.title_type || listing.title_type === 'Other') {
      score += 20
      redFlags.push('No recognized statutory title (C of O / Governor Consent / R of O) provided')
    }

    // 4. Short Description
    const words = desc.trim().split(/\s+/).filter(Boolean).length
    if (words < 25) {
      score += 15
      redFlags.push('Description is extremely brief and lacks verifiable coordinates')
    }

    score = Math.min(95, Math.max(5, score))

    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'
    let recommendation = 'Safe to proceed'

    if (score > 75) {
      riskLevel = 'critical'
      recommendation = 'Do not proceed — high fraud risk'
    } else if (score > 55) {
      riskLevel = 'high'
      recommendation = 'Verify title and owner identity before payment'
    } else if (score > 30) {
      riskLevel = 'medium'
      recommendation = 'Proceed with caution'
    }

    return NextResponse.json({
      fraudScore: score,
      riskLevel,
      redFlags,
      recommendation,
      analysis:
        redFlags.length > 0
          ? `Listing flagged due to ${redFlags.length} safety warnings. Exercise caution before making financial commitments.`
          : 'Listing demonstrates consistent market pricing and verified title documentation.',
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to score listing fraud risk', details: String(error) },
      { status: 500 }
    )
  }
}
