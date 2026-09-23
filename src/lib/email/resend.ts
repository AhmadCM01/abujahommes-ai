import { Resend } from 'resend'

export interface SendTransactionalEmailParams {
  recipient: string
  template: 'verify-email' | 'password-reset' | string
  payload: Record<string, unknown>
}

export interface SendTransactionalEmailResult {
  success: boolean
  providerId?: string
  error?: string
  skipped?: boolean
}

/**
 * Task 5 THIN: Resend transactional email sender.
 *
 * Rules:
 * 1. Strictly handles 'verify-email' and 'password-reset' templates only.
 * 2. Brand is always "AbujaHommes AI", never "AbujaHommes" alone.
 * 3. From display name: "AbujaHommes AI".
 * 4. Subjects:
 *    - Verify your AbujaHommes AI email
 *    - Reset your AbujaHommes AI password
 * 5. In development only, if EMAIL_FROM_TRANSACTIONAL is empty, falls back to Resend's
 *    onboarding sender ('AbujaHommes AI <onboarding@resend.dev>').
 * 6. If RESEND_API_KEY is missing, returns cleanly with skipped=true (does not throw,
 *    does not pretend sent, leaves row queued).
 */
export async function sendTransactionalEmail({
  recipient,
  template,
  payload,
}: SendTransactionalEmailParams): Promise<SendTransactionalEmailResult> {
  // Only verify-email and password-reset are permitted in this pass
  if (template !== 'verify-email' && template !== 'password-reset') {
    return {
      success: false,
      skipped: true,
      error: `Template "${template}" is not enabled for transactional sending in Phase 1 Task 5.`,
    }
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey || apiKey.includes('placeholder') || apiKey.trim() === '') {
    return {
      success: false,
      skipped: true,
      error: 'RESEND_API_KEY is not configured.',
    }
  }

  // Resolve From address with "AbujaHommes AI" display name
  let fromAddress = process.env.EMAIL_FROM_TRANSACTIONAL?.trim()
  if (!fromAddress) {
    if (process.env.NODE_ENV === 'development') {
      fromAddress = 'AbujaHommes AI <onboarding@resend.dev>'
    } else {
      return {
        success: false,
        error: 'EMAIL_FROM_TRANSACTIONAL must be configured in production.',
      }
    }
  } else {
    // Ensure display name is always "AbujaHommes AI"
    const match = fromAddress.match(/<([^>]+)>/)
    if (match) {
      fromAddress = `AbujaHommes AI <${match[1]}>`
    } else if (fromAddress.includes('@')) {
      fromAddress = `AbujaHommes AI <${fromAddress}>`
    }
  }

  const actionUrl = (payload.url as string) || (payload.token as string) || ''

  // Greeting with first name if available
  const rawName = (payload.name as string)?.trim()
  const firstName = rawName ? rawName.split(/\s+/)[0] : ''
  const greeting = firstName ? `Hello ${firstName},` : 'Hello,'

  let subject = ''
  let html = ''
  let text = ''

  if (template === 'verify-email') {
    subject = 'Verify your AbujaHommes AI email'
    text = `${greeting}\n\nConfirm this email to activate your AbujaHommes AI account:\n\n${actionUrl}\n\nIf you did not create an account, ignore the email.`
    html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F5EDD6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F5EDD6; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #FFFFFF; border: 1px solid #D6C9A8; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="background-color: #2D5A3D; padding: 24px 32px; text-align: left;">
              <h1 style="margin: 0; color: #FFFFFF; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">
                AbujaHommes AI
              </h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 16px 0; color: #1A1A1A; font-size: 15px; line-height: 1.5;">
                ${greeting}
              </p>
              <p style="margin: 0 0 24px 0; color: #5C5C5C; font-size: 14px; line-height: 1.5;">
                Confirm this email to activate your AbujaHommes AI account.
              </p>
              <!-- Action Button -->
              <table border="0" cellspacing="0" cellpadding="0" style="margin: 24px 0;">
                <tr>
                  <td align="center" style="background-color: #2D5A3D; border-radius: 8px;">
                    <a href="${actionUrl}" target="_blank" style="display: inline-block; padding: 12px 28px; font-size: 14px; font-weight: 700; color: #FFFFFF; text-decoration: none; border-radius: 8px;">
                      Verify email
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 8px 0; color: #78716C; font-size: 12px; line-height: 1.5;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin: 0 0 24px 0; word-break: break-all; font-size: 11px; color: #2D5A3D; background: #F0F4EC; padding: 10px 12px; border-radius: 6px;">
                ${actionUrl}
              </p>
              <hr style="border: none; border-top: 1px solid #E6E1D3; margin: 24px 0;" />
              <p style="margin: 0; color: #A8A29E; font-size: 12px; line-height: 1.4;">
                If you did not create an account, ignore the email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
  } else if (template === 'password-reset') {
    subject = 'Reset your AbujaHommes AI password'
    text = `${greeting}\n\nSomeone requested a password reset for this AbujaHommes AI account.\n\nReset password:\n${actionUrl}\n\nThis link expires in 1 hour. Resetting your password will sign out all other active sessions.\n\nIf you did not ask for this, ignore the email.`
    html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F5EDD6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F5EDD6; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #FFFFFF; border: 1px solid #D6C9A8; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="background-color: #2D5A3D; padding: 24px 32px; text-align: left;">
              <h1 style="margin: 0; color: #FFFFFF; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">
                AbujaHommes AI
              </h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 16px 0; color: #1A1A1A; font-size: 15px; line-height: 1.5;">
                ${greeting}
              </p>
              <p style="margin: 0 0 24px 0; color: #5C5C5C; font-size: 14px; line-height: 1.5;">
                Someone requested a password reset for this AbujaHommes AI account.
              </p>
              <!-- Action Button -->
              <table border="0" cellspacing="0" cellpadding="0" style="margin: 24px 0;">
                <tr>
                  <td align="center" style="background-color: #2D5A3D; border-radius: 8px;">
                    <a href="${actionUrl}" target="_blank" style="display: inline-block; padding: 12px 28px; font-size: 14px; font-weight: 700; color: #FFFFFF; text-decoration: none; border-radius: 8px;">
                      Reset password
                    </a>
                  </td>
                </tr>
              </table>
              <div style="background-color: #FEF3C7; border: 1px solid #F59E0B; border-radius: 8px; padding: 12px 16px; margin-bottom: 24px;">
                <p style="margin: 0; color: #92400E; font-size: 12px; line-height: 1.5;">
                  This link expires in 1 hour. Resetting your password will sign out all other active sessions.
                </p>
              </div>
              <p style="margin: 0 0 8px 0; color: #78716C; font-size: 12px; line-height: 1.5;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin: 0 0 24px 0; word-break: break-all; font-size: 11px; color: #2D5A3D; background: #F0F4EC; padding: 10px 12px; border-radius: 6px;">
                ${actionUrl}
              </p>
              <hr style="border: none; border-top: 1px solid #E6E1D3; margin: 24px 0;" />
              <p style="margin: 0; color: #A8A29E; font-size: 12px; line-height: 1.4;">
                If you did not ask for this, ignore the email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
  }

  try {
    const resend = new Resend(apiKey)
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: recipient,
      subject,
      html,
      text,
    })

    if (error) {
      return {
        success: false,
        error: error.message || 'Resend rejected email dispatch.',
      }
    }

    return {
      success: true,
      providerId: data?.id,
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    return {
      success: false,
      error: errorMessage,
    }
  }
}
