/**
 * AbujaHommes AI — Email Subsystem
 *
 * Task 5 THIN:
 * - queueEmail: Inserts into email_messages (status=queued, 15-min bucket dedupe).
 * - sendTransactionalEmail: Dispatches verify-email and password-reset via Resend.
 * - processEmailMessage / processQueuedEmails: Updates status to 'sent' or 'failed'.
 * - triggerBackgroundEmailProcessing: Asynchronous, fire-and-forget in-process dispatcher.
 */

export * from './queue'
export * from './resend'
export * from './processor'
