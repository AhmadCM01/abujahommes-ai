'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { EnvelopeOpen, CheckCircle } from '@phosphor-icons/react'
import { AuthCard } from '@/components/auth/AuthCard'
import { Button } from '@/components/ui'
import { ToastProvider, useToast } from '@/components/ui/Toast'
import { authClient } from '@/lib/auth/client'

function VerifyEmailInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialEmail = searchParams.get('email') || ''
  const [email, setEmail] = useState(initialEmail)
  const { addToast } = useToast()

  const [countdown, setCountdown] = useState(60)
  const [devVerificationUrl, setDevVerificationUrl] = useState<string | null>(null)

  const displayEmail = email || 'your email address'

  // If email query parameter was not supplied, try resolving from active session
  useEffect(() => {
    if (!email) {
      authClient
        .getSession()
        .then((res) => {
          if (res?.data?.user?.email) {
            setEmail(res.data.user.email)
          }
        })
        .catch(() => {})
    }
  }, [email])

  // Countdown timer for resend button
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [countdown])

  // In development only: check if a queued or failed email_messages row exists for this address
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return
    if (!email || email === 'your email address') return

    let isMounted = true

    const checkDevVerificationLink = async () => {
      try {
        const res = await fetch(`/api/dev/verification-link?email=${encodeURIComponent(email.trim())}`)
        if (!res.ok) return
        const data = await res.json()
        if (isMounted) {
          setDevVerificationUrl(data?.url || null)
        }
      } catch {
        // Dev helper silent fail
      }
    }

    checkDevVerificationLink()
    const interval = setInterval(checkDevVerificationLink, 2500)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [email])

  const handleResend = async () => {
    setCountdown(60)
    try {
      const targetEmail = email.trim().toLowerCase()
      const res = await authClient.sendVerificationEmail({
        email: targetEmail,
        callbackURL: '/dashboard',
      })
      if (res.error) {
        addToast({
          title: 'Resend failed',
          message: res.error.message || 'Unable to queue verification email.',
          type: 'error',
        })
        return
      }
      addToast({
        title: 'Verification email queued',
        message: `Queued for ${targetEmail}`,
        type: 'info',
      })

      // Promptly re-check the queued link in development
      if (process.env.NODE_ENV !== 'production' && targetEmail) {
        setTimeout(async () => {
          try {
            const checkRes = await fetch(`/api/dev/verification-link?email=${encodeURIComponent(targetEmail)}`)
            if (checkRes.ok) {
              const data = await checkRes.json()
              if (data?.url) setDevVerificationUrl(data.url)
            }
          } catch {
            // ignore
          }
        }, 300)
      }
    } catch (err: unknown) {
      addToast({
        title: 'Error',
        message: err instanceof Error ? err.message : 'Failed to request verification email.',
        type: 'error',
      })
    }
  }

  return (
    <AuthCard
      title="Check your email"
      subtitle={`We sent an activation link to ${displayEmail}`}
    >
      <div className="text-center space-y-5">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-[#F0F4EC] text-[#2D5A3D] flex items-center justify-center text-3xl shadow-sm">
            <EnvelopeOpen size={36} weight="fill" />
          </div>
        </div>

        <p className="text-xs text-[#5C5C5C] leading-relaxed">
          Please click the link inside your email to verify your account and start
          browsing Abuja property intelligence.
        </p>

        <div className="space-y-3 pt-2">
          {process.env.NODE_ENV !== 'production' && devVerificationUrl && (
            <Button
              type="button"
              variant="amber"
              size="md"
              className="w-full font-semibold shadow-sm hover:shadow active:scale-[0.98]"
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey) {
                  window.open(devVerificationUrl, '_blank')
                } else {
                  window.location.href = devVerificationUrl
                }
              }}
            >
              Open verification link (dev)
            </Button>
          )}

          <Button
            variant="outline"
            size="md"
            className="w-full"
            disabled={countdown > 0}
            onClick={handleResend}
          >
            {countdown > 0 ? `Resend email in ${countdown}s` : 'Resend verification email'}
          </Button>

          <Link
            href="/auth/login"
            className="inline-block w-full py-2 text-center text-xs font-semibold text-[#2D5A3D] hover:underline"
          >
            Return to sign in
          </Link>
        </div>

        {process.env.NODE_ENV !== 'production' && (
          <div className="p-3 bg-[#E8F5EF] border border-[#A8D5BE] rounded-lg text-left text-xs text-[#2D5A3D] space-y-1 mt-2">
            <p className="font-bold">🛠️ Development Notice</p>
            <p className="text-[#3E5F48] leading-relaxed">
              Emails are queued asynchronously. When an email is queued or failed, click the{' '}
              <strong>&quot;Open verification link (dev)&quot;</strong> button above to verify directly in dev mode.
            </p>
          </div>
        )}

        <p className="text-xs text-[#5C5C5C] pt-2">
          Wrong email?{' '}
          <Link href="/auth/register" className="font-bold text-[#2D5A3D] hover:underline">
            Register again
          </Link>
        </p>
      </div>
    </AuthCard>
  )
}

export default function VerifyEmailPage() {
  return (
    <ToastProvider>
      <Suspense fallback={<div className="min-h-screen bg-[#F5EDD6]" />}>
        <VerifyEmailInner />
      </Suspense>
    </ToastProvider>
  )
}

