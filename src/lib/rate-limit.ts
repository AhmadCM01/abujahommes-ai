export interface RateLimitConfig {
  limit: number
  windowMs: number
}

const ROUTE_CONFIGS: Record<string, RateLimitConfig> = {
  auth: { limit: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  'nlp-search': { limit: 20, windowMs: 60 * 1000 }, // 20 searches per minute
  'fraud-score': { limit: 30, windowMs: 60 * 1000 }, // 30 evaluations per minute
  'price-predict': { limit: 30, windowMs: 60 * 1000 }, // 30 predictions per minute
  general: { limit: 120, windowMs: 60 * 1000 }, // 120 general requests per minute
}

// In-memory sliding window cache: key -> timestamp array
const rateLimitCache = new Map<string, number[]>()

export async function checkRateLimit(
  routeType: string = 'general',
  identifier: string = '127.0.0.1'
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const config = ROUTE_CONFIGS[routeType] || ROUTE_CONFIGS.general
  const now = Date.now()
  const windowStart = now - config.windowMs
  const key = `${routeType}:${identifier}`

  // Retrieve existing timestamps and filter out expired ones
  const timestamps = (rateLimitCache.get(key) || []).filter((t) => t > windowStart)

  if (timestamps.length >= config.limit) {
    const oldestTimestamp = timestamps[0]
    const resetTime = oldestTimestamp + config.windowMs
    return {
      success: false,
      limit: config.limit,
      remaining: 0,
      reset: Math.ceil((resetTime - now) / 1000),
    }
  }

  // Record this request timestamp
  timestamps.push(now)
  rateLimitCache.set(key, timestamps)

  return {
    success: true,
    limit: config.limit,
    remaining: config.limit - timestamps.length,
    reset: Math.ceil(config.windowMs / 1000),
  }
}
