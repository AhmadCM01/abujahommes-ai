import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

let redisClient: Redis | null = null

if (
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN &&
  !process.env.UPSTASH_REDIS_REST_URL.includes('placeholder')
) {
  try {
    redisClient = Redis.fromEnv()
  } catch (e) {
    console.warn('Redis initialization skipped:', e)
  }
}

export const limits = {
  search: redisClient
    ? new Ratelimit({
        redis: redisClient,
        limiter: Ratelimit.slidingWindow(20, '1 m'),
        prefix: 'rl:search',
      })
    : null,
  auth: redisClient
    ? new Ratelimit({
        redis: redisClient,
        limiter: Ratelimit.fixedWindow(5, '15 m'),
        prefix: 'rl:auth',
      })
    : null,
  listing: redisClient
    ? new Ratelimit({
        redis: redisClient,
        limiter: Ratelimit.fixedWindow(10, '1 h'),
        prefix: 'rl:listing',
      })
    : null,
  fraud: redisClient
    ? new Ratelimit({
        redis: redisClient,
        limiter: Ratelimit.slidingWindow(10, '1 m'),
        prefix: 'rl:fraud',
      })
    : null,
  insights: redisClient
    ? new Ratelimit({
        redis: redisClient,
        limiter: Ratelimit.slidingWindow(10, '1 m'),
        prefix: 'rl:insights',
      })
    : null,
}

export async function checkRateLimit(
  limiter: keyof typeof limits,
  identifier: string
): Promise<{ success: boolean; limit?: number; remaining?: number; reset?: number }> {
  const activeLimiter = limits[limiter]
  if (!activeLimiter) {
    // In dev / unconfigured Redis mode, pass through
    return { success: true, remaining: 999 }
  }

  try {
    const result = await activeLimiter.limit(identifier)
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    }
  } catch {
    return { success: true }
  }
}
