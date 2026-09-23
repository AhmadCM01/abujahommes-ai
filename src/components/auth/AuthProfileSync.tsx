'use client'

import { useEffect, useRef } from 'react'
import { useAuthStore } from '@/store/auth'
import { UserProfile } from '@/types'

/**
 * Hydrates and synchronizes the authoritative database user profile
 * into the client-side useAuthStore.
 *
 * Ensures client-side components (TopBar, Sidebars, Role guards)
 * immediately reflect profiles.role from the database instead of stale
 * localStorage or uninitialized state.
 */
export function AuthProfileSync({ profile }: { profile: UserProfile }) {
  const syncedRef = useRef(false)

  // Synchronously update store before paint so child components see DB profile immediately
  if (!syncedRef.current) {
    const current = useAuthStore.getState().user
    if (
      !current ||
      current.id !== profile.id ||
      current.role !== profile.role ||
      current.avatar_url !== profile.avatar_url ||
      current.full_name !== profile.full_name
    ) {
      useAuthStore.getState().setUser(profile)
    }
    syncedRef.current = true
  }

  useEffect(() => {
    const current = useAuthStore.getState().user
    if (
      !current ||
      current.id !== profile.id ||
      current.role !== profile.role ||
      current.avatar_url !== profile.avatar_url ||
      current.full_name !== profile.full_name
    ) {
      useAuthStore.getState().setUser(profile)
    }
  }, [profile])

  return null
}
