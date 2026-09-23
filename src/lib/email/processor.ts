import { pool } from '@/lib/db/users'
import { sendTransactionalEmail } from './resend'

export interface EmailMessageRow {
  id: string
  user_id: string | null
  recipient: string
  template: string
  status: 'queued' | 'sent' | 'delivered' | 'failed' | 'bounced'
  provider_id: string | null
  dedupe_key: string | null
  payload: Record<string, unknown>
  error_message: string | null
  created_at: string
  sent_at: string | null
}

export interface ProcessEmailResult {
  id: string
  status: 'sent' | 'failed' | 'queued'
  providerId?: string
  error?: string
  skipped?: string
}

/**
 * Process a single email message row.
 *
 * Rules:
 * 1. If RESEND_API_KEY is missing: leave the row queued, do not throw, do not pretend sent.
 * 2. Templates to send now: verify-email and password-reset only.
 * 3. On Resend success: status=sent, store provider_id, sent_at=NOW().
 * 4. On Resend failure: status=failed, store error_message, keep the row in the table.
 */
export async function processEmailMessage(row: EmailMessageRow): Promise<ProcessEmailResult> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey || apiKey.includes('placeholder') || apiKey.trim() === '') {
    // Leave the row queued, do not throw, do not pretend sent
    return {
      id: row.id,
      status: 'queued',
      skipped: 'missing_resend_api_key',
    }
  }

  if (row.template !== 'verify-email' && row.template !== 'password-reset') {
    // Do NOT send other templates in this pass; keep queued
    return {
      id: row.id,
      status: 'queued',
      skipped: 'unsupported_template',
    }
  }

  if (!pool) {
    console.error('[EMAIL PROCESSOR] Database pool unavailable to update email message status.')
    return {
      id: row.id,
      status: 'queued',
      skipped: 'db_pool_unavailable',
    }
  }

  try {
    const sendResult = await sendTransactionalEmail({
      recipient: row.recipient,
      template: row.template,
      payload: row.payload,
    })

    if (sendResult.success && sendResult.providerId) {
      // On Resend success: status=sent, store provider_id
      await pool.query(
        `UPDATE email_messages
         SET status = 'sent',
             provider_id = $1,
             sent_at = NOW(),
             error_message = NULL
         WHERE id = $2`,
        [sendResult.providerId, row.id]
      )
      return {
        id: row.id,
        status: 'sent',
        providerId: sendResult.providerId,
      }
    } else {
      // On Resend failure: status=failed, store error_message, keep the row
      const failureReason = sendResult.error || 'Unknown email dispatch error'
      await pool.query(
        `UPDATE email_messages
         SET status = 'failed',
             error_message = $1
         WHERE id = $2`,
        [failureReason, row.id]
      )
      return {
        id: row.id,
        status: 'failed',
        error: failureReason,
      }
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.error(`[EMAIL PROCESSOR] Unexpected error processing message ${row.id}:`, errorMsg)
    try {
      await pool.query(
        `UPDATE email_messages
         SET status = 'failed',
             error_message = $1
         WHERE id = $2`,
        [errorMsg, row.id]
      )
    } catch (dbErr) {
      console.error(`[EMAIL PROCESSOR] Failed to record failure status for message ${row.id}:`, dbErr)
    }
    return {
      id: row.id,
      status: 'failed',
      error: errorMsg,
    }
  }
}

/**
 * Fetch and process a single queued email message by its database ID.
 */
export async function processQueuedEmailById(id: string): Promise<ProcessEmailResult | null> {
  if (!pool) return null

  try {
    const res = await pool.query<EmailMessageRow>(
      `SELECT * FROM email_messages WHERE id = $1 AND status = 'queued'`,
      [id]
    )
    if (res.rows.length === 0) return null

    return await processEmailMessage(res.rows[0])
  } catch (err) {
    console.error(`[EMAIL PROCESSOR] Failed to query message ${id}:`, err)
    return null
  }
}

/**
 * Drain and process pending queued emails (for CLI script or batch processor).
 */
export async function processQueuedEmails(limit = 20): Promise<ProcessEmailResult[]> {
  if (!pool) return []

  try {
    const res = await pool.query<EmailMessageRow>(
      `SELECT * FROM email_messages
       WHERE status = 'queued'
         AND template IN ('verify-email', 'password-reset')
       ORDER BY created_at ASC
       LIMIT $1`,
      [limit]
    )

    const results: ProcessEmailResult[] = []
    for (const row of res.rows) {
      const outcome = await processEmailMessage(row)
      results.push(outcome)
    }
    return results
  } catch (err) {
    console.error('[EMAIL PROCESSOR] Batch processing error:', err)
    return []
  }
}

/**
 * Fire-and-forget processor trigger.
 *
 * Rules:
 * 1. Invoked asynchronously after queueing.
 * 2. Never blocks the HTTP request handler.
 * 3. Never throws to caller: catch all errors and log them.
 */
export function triggerBackgroundEmailProcessing(id: string): void {
  const run = async () => {
    try {
      await processQueuedEmailById(id)
    } catch (err) {
      console.error(`[EMAIL PROCESSOR] Asynchronous background task failed for message ${id}:`, err)
    }
  }

  if (typeof setImmediate === 'function') {
    setImmediate(run)
  } else {
    setTimeout(run, 0)
  }
}
