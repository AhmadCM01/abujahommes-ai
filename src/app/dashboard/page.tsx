import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getCanonicalUserById } from '@/lib/db/users'
import { UserRole } from '@/types'

export const dynamic = 'force-dynamic'

/**
 * Universal /dashboard landing page.
 * Resolves the authenticated user's role authoritatively from the DB profiles table
 * and redirects to the appropriate role-based dashboard:
 * - admin  -> /dashboard/admin
 * - agent  -> /dashboard/agent
 * - seller -> /dashboard/seller
 * - buyer  -> /dashboard/buyer
 */
export default async function DashboardLandingPage() {
  const reqHeaders = await headers()
  const session = await auth.api.getSession({
    headers: reqHeaders,
  })

  if (!session?.user) {
    redirect('/auth/login?redirect=/dashboard')
  }

  // Authoritatively query profiles.role from the database
  let role: UserRole = 'buyer'
  try {
    const profile = await getCanonicalUserById(session.user.id)
    if (profile?.role) {
      role = profile.role
    }
  } catch (err) {
    console.error('[DASHBOARD ROUTING] Error fetching canonical profile from DB:', err)
  }

  if (role === 'admin') {
    redirect('/dashboard/admin')
  } else if (role === 'agent' || role === 'seller') {
    redirect('/dashboard/seller')
  } else {
    redirect('/dashboard/buyer')
  }
}
