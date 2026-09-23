import { pool } from '@/lib/db/users'
import { triggerBackgroundEmailProcessing } from './processor'

export type EmailTemplate =
  | 'verify-email'
  | 'password-reset'
  | 'welcome'
  | 'security-new-login'
  | string

export interface QueueEmailParams {
  userId?: string | null
  recipient: string
  template: EmailTemplate
  payload: Record<string, unknown>
  dedupeKey?: string
}

export interface QueuedEmailResult {
  id?: string
  status: 'queued'
  dedupeKey: string
  alreadyQueued?: boolean
}

/**
 * Queue an email message in the email_messages table.
 * Rules:
 * 1. Resend is NEVER called in the request path (zero synchronous HTTP calls).
 * 2. dedupe_key uses a 15-minute time bucket to avoid blocking resends forever.
 * 3. In development only, outputs console.info with the verification/reset URL for testing.
 * 4. Fails cleanly if the database pool is unconfigured or unreachable (no fake success).
 * 5. Dispatches asynchronous, fire-and-forget background processing.
 */
export async function queueEmail({
  userId = null,
  recipient,
  template,
  payload,
  dedupeKey,
}: QueueEmailParams): Promise<QueuedEmailResult> {
  const normalizedRecipient = recipient.trim().toLowerCase()

  // 15-minute time bucket so user is not blocked forever on resend
  const timeBucket = Math.floor(Date.now() / (15 * 60 * 1000))
  const finalDedupeKey = dedupeKey || `${template}:${normalizedRecipient}:${timeBucket}`

  // In development only, log the URL for direct testing without waiting for Task 5 worker
  if (process.env.NODE_ENV !== 'production') {
    const actionUrl = payload.url || payload.token
    console.info(
      `[DEV EMAIL QUEUE] Template: "${template}" | To: ${normalizedRecipient} | URL: ${actionUrl || 'N/A'}`
    )
  }

  if (!pool) {
    throw new Error(
      'Database connection pool not initialized. Please configure DATABASE_URL in .env.local to persist queued emails.'
    )
  }

  try {
    const res = await pool.query<{ id: string; status: string; dedupe_key: string }>(
      `INSERT INTO email_messages (user_id, recipient, template, status, dedupe_key, payload, created_at)
       VALUES ($1, $2, $3, 'queued', $4, $5, NOW())
       ON CONFLICT (dedupe_key) DO UPDATE
         SET status = 'queued',
             payload = EXCLUDED.payload,
             created_at = NOW()
       RETURNING id, status, dedupe_key`,
      [userId, normalizedRecipient, template, finalDedupeKey, JSON.stringify(payload)]
    )

    const row = res.rows[0]

    // Trigger asynchronous fire-and-forget background processing
    if (row?.id) {
      triggerBackgroundEmailProcessing(row.id)
    }

    return {
      id: row?.id,
      status: 'queued',
      dedupeKey: row?.dedupe_key || finalDedupeKey,
    }
  } catch (error) {
    console.error(`[EMAIL QUEUE] Failed to queue "${template}" for ${normalizedRecipient}:`, error)
    throw error
  }
}
