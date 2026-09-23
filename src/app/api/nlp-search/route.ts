import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { checkRateLimit } from '@/lib/rate-limit'
import { getLocationLGA } from '@/lib/data/locations'

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1'
    const rateCheck = await checkRateLimit('nlp-search', ip)
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again in 1 minute.' },
        { status: 429 }
      )
    }

    const { query } = await req.json()
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY

    if (apiKey && !apiKey.includes('placeholder')) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

        const prompt = `You are a Nigerian real estate search assistant for the Abuja property market.
The user may write in standard English or Nigerian Pidgin English.

Pidgin patterns to recognise:
- "I wan" = "I want"
- "make I" = "let me"
- "e dey" = "it is"
- "no go pass" = "not more than"
- "e go fit" = "it can"
- "how e be" = "how is it"
- Price shorthand: 500k = 500000, 2M = 2000000, 1.5M = 1500000

User search query: "${query}"

Extract search intent and return ONLY valid JSON, no explanation, no markdown, no backticks:
{
  "propertyType": "duplex" | "terrace" | "bungalow" | "flat" | "detached" | "semi-detached" | "land" | "commercial" | "any",
  "transactionType": "rent" | "sale" | "any",
  "lga": "AMAC" | "Bwari" | "Gwagwalada" | "Kuje" | "Kwali" | "Abaji" | "any",
  "location": "string or null",
  "bedrooms": number or null,
  "minPrice": number or null,
  "maxPrice": number or null,
  "titleType": "C of O" | "Right of Occupancy" | "Deed of Assignment" | "any",
  "amenities": [],
  "detectedLanguage": "english" | "pidgin",
  "confidence": "high" | "medium" | "low",
  "interpretation": "one sentence in English summarising what you understood"
}`

        const result = await model.generateContent(prompt)
        const responseText = result.response.text().trim()
        const cleanedJson = responseText
          .replace(/```json/gi, '')
          .replace(/```/g, '')
          .trim()

        const parsed = JSON.parse(cleanedJson)
        if (parsed.location) {
          const canonicalLGA = getLocationLGA(parsed.location)
          if (canonicalLGA) {
            parsed.lga = canonicalLGA
          }
        }
        return NextResponse.json(parsed)
      } catch (geminiError) {
        console.warn('Gemini NLP call failed, using intelligent rule parser:', geminiError)
      }
    }

    // Intelligent Fallback Pidgin/English Rule Engine
    const text = query.toLowerCase()
    const isPidgin =
      text.includes('i wan') ||
      text.includes('make i') ||
      text.includes('no go pass') ||
      text.includes('e dey') ||
      text.includes('wetin') ||
      text.includes('k') ||
      text.includes('m')

    let propertyType = 'any'
    if (text.includes('flat') || text.includes('apartment')) propertyType = 'flat'
    else if (text.includes('duplex')) propertyType = 'duplex'
    else if (text.includes('terrace')) propertyType = 'terrace'
    else if (text.includes('bungalow')) propertyType = 'bungalow'
    else if (text.includes('detached') || text.includes('mansion')) {
      propertyType = text.includes('semi') ? 'semi-detached' : 'detached'
    } else if (text.includes('land') || text.includes('plot')) propertyType = 'land'
    else if (text.includes('office') || text.includes('shop') || text.includes('commercial')) {
      propertyType = 'commercial'
    }

    let transactionType = 'any'
    if (text.includes('rent') || text.includes('lease')) transactionType = 'rent'
    else if (text.includes('buy') || text.includes('sale') || text.includes('purchase')) {
      transactionType = 'sale'
    }

    let location: string | null = null
    let lga = 'any'
    if (text.includes('wuse 2') || text.includes('wuse ii') || text.includes('wuse')) location = 'Wuse 2'
    else if (text.includes('gwarinpa')) location = 'Gwarinpa'
    else if (text.includes('maitama')) location = 'Maitama'
    else if (text.includes('guzape')) location = 'Guzape'
    else if (text.includes('lokogoma')) location = 'Lokogoma'
    else if (text.includes('lugbe')) location = 'Lugbe'
    else if (text.includes('kubwa')) location = 'Kubwa'
    else if (text.includes('dawaki')) location = 'Dawaki'
    else if (text.includes('mpape')) location = 'Mpape'
    else if (text.includes('dutse')) location = 'Dutse Alhaji'
    else if (text.includes('katampe')) location = 'Katampe Extension'
    else if (text.includes('asokoro')) location = 'Asokoro'
    else if (text.includes('jabi')) location = 'Jabi'
    else if (text.includes('utako')) location = 'Utako'
    else if (text.includes('apo')) location = 'Apo'
    else if (text.includes('zuba')) location = 'Zuba'
    else if (text.includes('gwagwalada')) location = 'Gwagwalada Central'
    else if (text.includes('kuje')) location = 'Kuje Town'
    else if (text.includes('kwali')) location = 'Kwali Central'
    else if (text.includes('abaji')) location = 'Abaji Central'

    if (location) {
      const canonicalLGA = getLocationLGA(location)
      if (canonicalLGA) {
        lga = canonicalLGA
      }
    }

    let bedrooms: number | null = null
    const bedMatch = text.match(/(\d+)\s*(?:bed|bedroom|bdr)/)
    if (bedMatch) {
      bedrooms = parseInt(bedMatch[1], 10)
    }

    let maxPrice: number | null = null
    const priceMillionMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:m|million)/)
    const priceKoboMatch = text.match(/(\d+)\s*(?:k|thousand)/)
    if (priceMillionMatch) {
      maxPrice = parseFloat(priceMillionMatch[1]) * 1000000
    } else if (priceKoboMatch) {
      maxPrice = parseInt(priceKoboMatch[1], 10) * 1000
    }

    return NextResponse.json({
      propertyType,
      transactionType,
      lga,
      location,
      bedrooms,
      minPrice: null,
      maxPrice,
      titleType: 'any',
      amenities: [],
      detectedLanguage: isPidgin ? 'pidgin' : 'english',
      confidence: 'high',
      interpretation: `Looking for ${bedrooms ? bedrooms + '-bedroom ' : ''}${
        propertyType !== 'any' ? propertyType : 'property'
      } in ${location || 'Abuja'} for ${transactionType !== 'any' ? transactionType : 'rent/sale'}${
        maxPrice ? ` under NGN ${maxPrice.toLocaleString()}` : ''
      }.`,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to parse search query', details: String(error) },
      { status: 500 }
    )
  }
}
