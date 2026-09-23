#!/usr/bin/env tsx
/**
 * AbujaHommes AI — Local Email Queue Processor
 *
 * Usage:
 *   npx tsx scripts/process-email-queue.ts         (drain pending queued emails once)
 *   npx tsx scripts/process-email-queue.ts --watch (poll every 5 seconds)
 */

import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

// 1. Load environment variables before importing modules that inspect process.env
const envLocalPath = resolve(process.cwd(), '.env.local')
const envPath = resolve(process.cwd(), '.env')

if (typeof process.loadEnvFile === 'function') {
  if (existsSync(envLocalPath)) {
    try {
      process.loadEnvFile(envLocalPath)
      console.log('[RUNNER] Loaded environment from .env.local')
    } catch {
      // ignore
    }
  } else if (existsSync(envPath)) {
    try {
      process.loadEnvFile(envPath)
      console.log('[RUNNER] Loaded environment from .env')
    } catch {
      // ignore
    }
  }
}

async function main() {
  // Dynamically import after environment variables are loaded into process.env
  const { pool } = await import('../src/lib/db/users')
  const { processQueuedEmails } = await import('../src/lib/email/processor')

  if (!pool) {
    console.error('[RUNNER] Error: PostgreSQL connection pool is not configured (missing DATABASE_URL in .env.local).')
    process.exit(1)
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey || apiKey.includes('placeholder') || apiKey.trim() === '') {
    console.warn('[RUNNER] Notice: RESEND_API_KEY is not set. Queued emails will be inspected but left in "queued" status.')
  }

  const runDrain = async () => {
    console.log('[RUNNER] Checking email_messages for queued transactional emails...')
    const results = await processQueuedEmails(50)

    if (results.length === 0) {
      console.log('[RUNNER] No pending queued emails found for verify-email or password-reset.')
      return results
    }

    console.log(`[RUNNER] Processed ${results.length} email(s):`)
    for (const r of results) {
      if (r.status === 'sent') {
        console.log(`  ✓ [SENT] ID: ${r.id} | Resend Provider ID: ${r.providerId}`)
      } else if (r.status === 'failed') {
        console.log(`  ✗ [FAILED] ID: ${r.id} | Error: ${r.error}`)
      } else {
        console.log(`  - [QUEUED/SKIPPED] ID: ${r.id} | Reason: ${r.skipped}`)
      }
    }

    return results
  }

  const isWatch = process.argv.includes('--watch')

  if (isWatch) {
    console.log('[RUNNER] Starting email processor in watch mode (polling every 5s)... Press Ctrl+C to stop.')
    await runDrain()
    const interval = setInterval(async () => {
      try {
        await runDrain()
      } catch (err) {
        console.error('[RUNNER] Polling error:', err)
      }
    }, 5000)

    process.on('SIGINT', async () => {
      clearInterval(interval)
      console.log('\n[RUNNER] Shutting down...')
      await pool.end()
      process.exit(0)
    })
  } else {
    try {
      await runDrain()
      await pool.end()
      process.exit(0)
    } catch (err) {
      console.error('[RUNNER] Execution failed:', err)
      await pool.end()
      process.exit(1)
    }
  }
}

main()
