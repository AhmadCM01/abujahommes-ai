import { betterAuth } from 'better-auth'
import { cookies } from 'next/headers'
import { pool, syncCanonicalUser } from '@/lib/db/users'
import { queueEmail } from '@/lib/email/queue'
import { UserRole } from '@/types'

const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.AUTH_URL || 'http://localhost:3000'

/**
 * Helper to extract and strictly validate the intended user role during user creation.
 * Whitelist ONLY 'buyer' | 'seller' | 'agent'.
 * Default: 'buyer'.
 * NEVER allow 'admin' under any circumstances from client payload, query, or cookie.
 */
async function resolveIntendedRole(context: unknown): Promise<UserRole> {
  let candidate: string | null = null
  const ctx = context as Record<string, unknown> | null | undefined

  // 1. Direct body payload (used by email/password registration)
  if (ctx?.body && typeof ctx.body === 'object') {
    const reqBody = ctx.body as Record<string, unknown>
    if (typeof reqBody.role === 'string') {
      candidate = reqBody.role
    }
  }

  // 2. EndpointContext getCookie helper (Better-Call / Better-Auth)
  if (!candidate && ctx && typeof (ctx as any).getCookie === 'function') {
    try {
      const val = (ctx as any).getCookie('ah_intended_role')
      if (typeof val === 'string' && val.trim()) {
        candidate = val.trim()
      }
    } catch {}
  }

  // 3. Request Cookie header from Better Auth context
  if (!candidate && ctx) {
    try {
      const rawHeader =
        (typeof (ctx as any).getHeader === 'function' ? (ctx as any).getHeader('cookie') : null) ||
        (ctx.headers && typeof (ctx.headers as any).get === 'function' ? (ctx.headers as any).get('cookie') : null) ||
        ((ctx as any).request?.headers && typeof (ctx as any).request.headers.get === 'function' ? (ctx as any).request.headers.get('cookie') : null)

      if (typeof rawHeader === 'string' && rawHeader) {
        const match = rawHeader.match(/(?:^|;\s*)ah_intended_role=([^;]+)/)
        if (match && match[1]) {
          candidate = decodeURIComponent(match[1].trim())
        }
      }
    } catch {}
  }

  // 4. Next.js cookies() API (App Router server runtime fallback)
  if (!candidate) {
    try {
      const cookieStore = await cookies()
      const c = cookieStore.get('ah_intended_role')
      if (c?.value) {
        candidate = decodeURIComponent(c.value.trim())
      }
    } catch {}
  }

  // Strict whitelist: buyer | seller | agent. NEVER admin. Default: buyer.
  if (candidate === 'seller' || candidate === 'agent') {
    return candidate
  }
  return 'buyer'
}

export const auth = betterAuth({
  database: pool || undefined,
  secret: process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET || 'dev-secret-at-least-32-characters-long-abujahommes-auth',
  baseURL: appUrl,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    autoSignIn: false,
    minPasswordLength: 10, // Non-negotiable policy: minimum 10 characters
    revokeSessionsOnPasswordReset: true, // Single-use reset revokes all existing sessions
    resetPasswordTokenExpiresIn: 3600, // 1 hour token expiration
    sendResetPassword: async ({ user, url, token }) => {
      await queueEmail({
        userId: user.id,
        recipient: user.email,
        template: 'password-reset',
        payload: {
          url,
          token,
          name: user.name,
        },
      })
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }) => {
      await queueEmail({
        userId: user.id,
        recipient: user.email,
        template: 'verify-email',
        payload: {
          url,
          token,
          name: user.name,
        },
      })
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      redirectURI: `${appUrl}/api/auth/callback/google`,
      scope: ['openid', 'email', 'profile'],
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      requireLocalEmailVerified: true, // Non-negotiable: Existing UNVERIFIED email + Google cannot steal account
      trustedProviders: ['google'],
    },
  },
  databaseHooks: {
    user: {
      update: {
        after: async (user) => {
          // When an email is marked verified, activate the canonical user profile
          if (user.emailVerified) {
            try {
              await syncCanonicalUser({
                id: user.id,
                email: user.email,
                full_name: user.name || user.email.split('@')[0],
                avatar_url: user.image || null,
                status: 'active',
                is_verified: true,
                email_verified_at: new Date().toISOString(),
              })
            } catch (err) {
              console.error('[BETTER-AUTH HOOK] Failed to activate canonical user on email verification:', err)
            }
          }
        },
      },
      create: {
        after: async (user, context) => {
          /**
           * PHASE 1 TASK 1 HOOK:
           * Sync to canonical app profiles table when an auth user is created.
           * Rules:
           * 1. Whitelist only 'buyer' | 'seller' | 'agent' from client registration.
           *    Anything else (including 'admin' or missing) defaults to 'buyer'.
           *    Admin role is seed/SQL only.
           * 2. Email/password users start status = 'pending'.
           * 3. Google OAuth users start status = 'active' with email_verified_at set.
           * 4. Unique case-insensitive email.
           * 5. If syncCanonicalUser fails, fail the signup and remove the auth user.
           */
          const isVerifiedAtStart = Boolean(user.emailVerified)

          // Client role whitelist: ONLY 'buyer' | 'seller' | 'agent'.
          // Admin cannot be registered via client payload or cookie; defaults to 'buyer'.
          const assignedRole = await resolveIntendedRole(context)

          try {
            await syncCanonicalUser({
              id: user.id,
              email: user.email,
              full_name: user.name || user.email.split('@')[0],
              avatar_url: user.image || null,
              role: assignedRole,
              status: isVerifiedAtStart ? 'active' : 'pending',
              email_verified_at: isVerifiedAtStart ? new Date().toISOString() : null,
              is_verified: isVerifiedAtStart,
            })
          } catch (error) {
            console.error('[BETTER-AUTH HOOK] Profile sync failed, rolling back auth user:', error)
            // Roll back the auth user record so no orphaned user exists
            if (pool) {
              try {
                await pool.query('DELETE FROM "user" WHERE id = $1', [user.id])
              } catch (cleanupErr) {
                console.error('[BETTER-AUTH HOOK] Failed to clean up auth user:', cleanupErr)
              }
            }
            // Fail the signup immediately
            throw new Error(
              `Registration failed: unable to create canonical user profile (${
                error instanceof Error ? error.message : String(error)
              })`
            )
          }
        },
      },
    },
  },
})

export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.Session.user
