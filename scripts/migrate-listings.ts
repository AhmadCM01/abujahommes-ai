#!/usr/bin/env tsx
/**
 * AbujaHommes AI — Phase 2 Listings Database Migration Runner
 * 
 * Runs `supabase/migrations/20260914_phase2_listings_and_relations.sql` against
 * DIRECT_DATABASE_URL (or DATABASE_URL) in .env.local.
 *
 * Usage:
 *   npx tsx scripts/migrate-listings.ts
 */

import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { Pool } from 'pg'

// 1. Load environment variables
const envLocalPath = resolve(process.cwd(), '.env.local')
const envPath = resolve(process.cwd(), '.env')

if (typeof process.loadEnvFile === 'function') {
  if (existsSync(envLocalPath)) {
    process.loadEnvFile(envLocalPath)
    console.log('[MIGRATION] Loaded environment from .env.local')
  } else if (existsSync(envPath)) {
    process.loadEnvFile(envPath)
    console.log('[MIGRATION] Loaded environment from .env')
  }
}

const connectionString = process.env.DATABASE_URL || process.env.DIRECT_DATABASE_URL

if (!connectionString || connectionString.includes('placeholder')) {
  console.error('[MIGRATION] Error: DATABASE_URL is not set in environment.')
  process.exit(1)
}

async function runMigration() {
  console.log('[MIGRATION] Connecting to PostgreSQL via pooler...')
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  })

  const client = await pool.connect()
  try {
    const sqlPath = resolve(process.cwd(), 'supabase/migrations/20260914_phase2_listings_and_relations.sql')
    console.log(`[MIGRATION] Reading SQL from ${sqlPath}...`)
    const sql = readFileSync(sqlPath, 'utf8')

    console.log('[MIGRATION] Executing migration script...')
    await client.query(sql)
    console.log('[MIGRATION] Successfully executed migration!')

    // Verify created tables
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('listings', 'listing_media', 'favourites', 'saved_searches', 'enquiries')
      ORDER BY table_name;
    `)

    console.log('[MIGRATION] Verified public tables:', res.rows.map((r) => r.table_name))

    // Check columns of listings table
    const cols = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'listings'
      ORDER BY ordinal_position;
    `)
    console.log(`[MIGRATION] Verified listings table has ${cols.rows.length} columns:`)
    console.log(cols.rows.map((c) => `  - ${c.column_name} (${c.data_type})`).join('\n'))

  } catch (err) {
    console.error('[MIGRATION] Migration failed:', err)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

runMigration()
