export type UserRole = 'buyer' | 'seller' | 'agent' | 'admin'
export type UserStatus = 'pending' | 'active' | 'suspended'

export interface UserProfile {
  id: string
  full_name: string
  email?: string
  phone?: string
  role: UserRole
  status: UserStatus
  is_verified?: boolean
  is_suspended?: boolean
  email_verified_at?: string | null
  avatar_url?: string
  locale?: string
  timezone?: string
  marketing_opt_in?: boolean
  budget_min?: number
  budget_max?: number
  preferred_lgas?: string[]
  preferred_property_types?: string[]
  preferred_transaction_type?: 'rent' | 'sale' | 'any'
  search_count?: number
  last_login_at?: string | null
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
}

export interface AuthSession {
  user: {
    id: string
    email: string
    role: UserRole
    status?: UserStatus
    full_name: string
    avatar_url?: string
  } | null
  token?: string | null
}
