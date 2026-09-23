import { Pool } from 'pg'
import { UserProfile, UserRole, UserStatus } from '@/types'

const connectionString = process.env.DATABASE_URL

export const pool = connectionString && !connectionString.includes('placeholder')
  ? new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
    })
  : null

export class DatabaseUnavailableError extends Error {
  constructor(message = 'Database service unavailable') {
    super(message)
    this.name = 'DatabaseUnavailableError'
  }
}

function getDbPool(): Pool {
  if (!pool) {
    throw new DatabaseUnavailableError('Postgres database connection pool is not configured')
  }
  return pool
}

export interface CanonicalUserInput {
  id: string
  email: string
  full_name: string
  avatar_url?: string | null
  phone?: string | null
  role?: UserRole
  status?: UserStatus
  email_verified_at?: string | null
  is_verified?: boolean
  locale?: string
  timezone?: string
  marketing_opt_in?: boolean
}

function mapProfileRow(row: any): UserProfile {
  return {
    id: row.id,
    email: row.email,
    email_verified_at: row.email_verified_at ? row.email_verified_at.toISOString() : null,
    full_name: row.full_name,
    phone: row.phone || undefined,
    role: row.role as UserRole,
    status: row.status as UserStatus,
    is_verified: row.is_verified,
    is_suspended: row.is_suspended,
    avatar_url: row.avatar_url || undefined,
    locale: row.locale,
    timezone: row.timezone,
    marketing_opt_in: row.marketing_opt_in,
    budget_min: row.budget_min ? Number(row.budget_min) : undefined,
    budget_max: row.budget_max ? Number(row.budget_max) : undefined,
    preferred_lgas: row.preferred_lgas,
    preferred_property_types: row.preferred_property_types,
    preferred_transaction_type: row.preferred_transaction_type,
    search_count: row.search_count || 0,
    last_login_at: row.last_login_at ? row.last_login_at.toISOString() : null,
    created_at: row.created_at ? row.created_at.toISOString() : undefined,
    updated_at: row.updated_at ? row.updated_at.toISOString() : undefined,
    deleted_at: row.deleted_at ? row.deleted_at.toISOString() : null,
  }
}

/**
 * Synchronizes an authenticated user into the canonical profiles table in PostgreSQL.
 * Adheres to:
 * - Default role: 'buyer'
 * - Email/password default status: 'pending' (unless email_verified_at is set)
 * - Google OAuth default status: 'active' with email_verified_at set
 * - Case-insensitive unique email
 * - Soft delete aware
 */
export async function syncCanonicalUser(input: CanonicalUserInput): Promise<UserProfile> {
  const normalizedEmail = input.email.toLowerCase().trim()
  const role: UserRole = input.role || 'buyer'
  const isVerified = Boolean(input.is_verified || input.email_verified_at)
  const status: UserStatus = input.status || (isVerified ? 'active' : 'pending')
  const locale = input.locale || 'en-NG'
  const timezone = input.timezone || 'Africa/Lagos'
  const marketingOptIn = Boolean(input.marketing_opt_in)

  const db = getDbPool()
  const client = await db.connect()
  try {
    const query = `
      INSERT INTO profiles (
        id,
        email,
        email_verified_at,
        full_name,
        phone,
        role,
        status,
        is_verified,
        is_suspended,
        avatar_url,
        locale,
        timezone,
        marketing_opt_in,
        created_at,
        updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, false, $9, $10, $11, $12, NOW(), NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
        phone = COALESCE(EXCLUDED.phone, profiles.phone),
        email_verified_at = COALESCE(profiles.email_verified_at, EXCLUDED.email_verified_at),
        status = CASE
          WHEN EXCLUDED.status = 'active' THEN 'active'
          WHEN profiles.email_verified_at IS NOT NULL OR EXCLUDED.email_verified_at IS NOT NULL THEN 'active'
          ELSE profiles.status
        END,
        is_verified = (profiles.is_verified OR EXCLUDED.is_verified),
        updated_at = NOW()
      RETURNING *;
    `

    const res = await client.query(query, [
      input.id,
      normalizedEmail,
      input.email_verified_at ? new Date(input.email_verified_at) : null,
      input.full_name,
      input.phone || null,
      role,
      status,
      isVerified,
      input.avatar_url || null,
      locale,
      timezone,
      marketingOptIn,
    ])

    return mapProfileRow(res.rows[0])
  } finally {
    client.release()
  }
}

/**
 * Retrieve active canonical user profile by ID from PostgreSQL
 */
export async function getCanonicalUserById(id: string): Promise<UserProfile | null> {
  const db = getDbPool()
  const client = await db.connect()
  try {
    const res = await client.query(
      'SELECT * FROM profiles WHERE id = $1 AND deleted_at IS NULL',
      [id]
    )
    if (res.rows.length === 0) return null
    return mapProfileRow(res.rows[0])
  } finally {
    client.release()
  }
}

/**
 * Retrieve active canonical user profile by email (case-insensitive) from PostgreSQL
 */
export async function getCanonicalUserByEmail(email: string): Promise<UserProfile | null> {
  const normalizedEmail = email.toLowerCase().trim()
  const db = getDbPool()
  const client = await db.connect()
  try {
    const res = await client.query(
      'SELECT * FROM profiles WHERE LOWER(email) = $1 AND deleted_at IS NULL',
      [normalizedEmail]
    )
    if (res.rows.length === 0) return null
    return mapProfileRow(res.rows[0])
  } finally {
    client.release()
  }
}

/**
 * Update active canonical user profile fields strictly in PostgreSQL
 */
export async function updateCanonicalUserProfile(
  id: string,
  updates: Partial<UserProfile>
): Promise<UserProfile> {
  const db = getDbPool()
  const client = await db.connect()
  try {
    const fields: string[] = []
    const values: any[] = []
    let idx = 1

    if (updates.full_name !== undefined) {
      fields.push(`full_name = $${idx++}`)
      values.push(updates.full_name)
    }
    if (updates.phone !== undefined) {
      fields.push(`phone = $${idx++}`)
      values.push(updates.phone)
    }
    if (updates.avatar_url !== undefined) {
      fields.push(`avatar_url = $${idx++}`)
      values.push(updates.avatar_url)
    }
    if (updates.budget_min !== undefined) {
      fields.push(`budget_min = $${idx++}`)
      values.push(updates.budget_min)
    }
    if (updates.budget_max !== undefined) {
      fields.push(`budget_max = $${idx++}`)
      values.push(updates.budget_max)
    }
    if (updates.preferred_lgas !== undefined) {
      fields.push(`preferred_lgas = $${idx++}`)
      values.push(updates.preferred_lgas)
    }
    if (updates.preferred_property_types !== undefined) {
      fields.push(`preferred_property_types = $${idx++}`)
      values.push(updates.preferred_property_types)
    }
    if (updates.preferred_transaction_type !== undefined) {
      fields.push(`preferred_transaction_type = $${idx++}`)
      values.push(updates.preferred_transaction_type)
    }

    fields.push(`updated_at = NOW()`)
    values.push(id)

    const query = `
      UPDATE profiles
      SET ${fields.join(', ')}
      WHERE id = $${idx} AND deleted_at IS NULL
      RETURNING *;
    `

    const res = await client.query(query, values)
    if (res.rows.length === 0) {
      throw new Error(`User profile with ID ${id} not found`)
    }
    return mapProfileRow(res.rows[0])
  } finally {
    client.release()
  }
}

/**
 * Soft delete canonical user in PostgreSQL
 */
export async function softDeleteCanonicalUser(id: string): Promise<boolean> {
  const db = getDbPool()
  const client = await db.connect()
  try {
    const res = await client.query(
      'UPDATE profiles SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1',
      [id]
    )
    return (res.rowCount ?? 0) > 0
  } finally {
    client.release()
  }
}
