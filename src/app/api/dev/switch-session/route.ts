import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

const secret = process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET || 'UiBf/CBH+Pbo5j139cuCYITqgq8y7EMVhX3BlZ2e3sY='

function signToken(token: string, secretKey: string) {
  const hmac = crypto.createHmac('sha256', secretKey)
  hmac.update(token)
  const signature = hmac.digest('base64')
  return `${token}.${signature}`
}

const TOKENS: Record<string, { token: string; target: string }> = {
  anabel: {
    token: '1eQHeP6V0tZ2Sc8wXLKqBpWIFofoEONF',
    target: '/dashboard/seller/chat',
  },
  ahmad: {
    token: 'kzy05043XEvaXA6KOsX2J72cfcMFAuGF',
    target: '/dashboard/buyer/chat',
  },
}

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 })
  }

  const { searchParams } = new URL(req.url)
  const userKey = searchParams.get('user') || 'anabel'
  const config = TOKENS[userKey.toLowerCase()]

  if (!config) {
    return NextResponse.json({ error: 'User not found' }, { status: 400 })
  }

  const signedToken = signToken(config.token, secret)
  const redirectUrl = new URL(config.target, req.url)

  const response = NextResponse.redirect(redirectUrl)
  response.cookies.set('better-auth.session_token', signedToken, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
  })

  return response
}
