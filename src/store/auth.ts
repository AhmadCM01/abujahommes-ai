import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { UserProfile } from '@/types'

interface AuthState {
  user: UserProfile | null
  isLoading: boolean
  setUser: (user: UserProfile | null) => void
  updateUserProfile: (updates: Partial<UserProfile>) => void
  logout: () => void
}

/**
 * Client auth store: caches only the read-only public profile received from the server.
 * Security Rules:
 * - Never stores passwords or tokens.
 * - Role is read-only from the verified server session, never modifiable by the client.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,

      setUser: (user) => set({ user }),

      updateUserProfile: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      logout: () => set({ user: null }),
    }),
    {
      name: 'abujahommes-auth-profile',
      partialize: (state) => ({ user: state.user }),
    }
  )
)
