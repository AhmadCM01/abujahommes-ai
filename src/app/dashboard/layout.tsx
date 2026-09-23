import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getCanonicalUserById } from '@/lib/db/users'
import { AuthProfileSync } from '@/components/auth/AuthProfileSync'
import { UserProfile } from '@/types'

/**
 * Authoritative Server-side Root Dashboard Guard.
 * Enforces:
 * 1. Valid authenticated session.
 * 2. Blocks pending users (unverified email) -> redirects to /auth/verify-email.
 * 3. Blocks suspended users -> redirects to /auth/login?error=suspended.
 * 4. Hydrates authoritative DB profile into client useAuthStore via AuthProfileSync.
 */
export default async function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const reqHeaders = await headers()
  const session = await auth.api.getSession({
    headers: reqHeaders,
  })

  if (!session || !session.user) {
    redirect('/auth/login?redirect=/dashboard')
  }

  // 1. Session verification flag check
  if (!session.user.emailVerified) {
    redirect(`/auth/verify-email?email=${encodeURIComponent(session.user.email)}`)
  }

  // 2. Authoritative database profile status check
  let profile: UserProfile | null = null
  try {
    profile = await getCanonicalUserById(session.user.id)
    if (profile) {
      if (profile.status === 'suspended' || profile.is_suspended) {
        redirect('/auth/login?error=suspended')
      }
      if (profile.status === 'pending' || !profile.email_verified_at) {
        redirect(`/auth/verify-email?email=${encodeURIComponent(session.user.email)}`)
      }
    }
  } catch (err) {
    // If database is temporarily unreachable, fallback to the verified session status
    console.error('[DASHBOARD GUARD] Could not fetch canonical profile:', err)
  }

  return (
    <>
      {profile && <AuthProfileSync profile={profile} />}
      {children}
    </>
  )
}
