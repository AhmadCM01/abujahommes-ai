'use client'

import React, { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { WarningCircle, ArrowLeft, EnvelopeSimple } from '@phosphor-icons/react'
import { AuthCard } from '@/components/auth/AuthCard'
import { Button } from '@/components/ui'
import { ToastProvider, useToast } from '@/components/ui/Toast'
import { authClient } from '@/lib/auth/client'

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const error = searchParams.get('error')
  const { addToast } = useToast()
  const [emailInput, setEmailInput] = useState('')
  const [isResending, setIsResending] = useState(false)

  const isAccountNotLinked = error === 'account_not_linked'

  const handleResend = async () => {
    if (!emailInput) {
      router.push('/auth/verify-email')
      return
    }
    setIsResending(true)
    try {
      const res = await authClient.sendVerificationEmail({
        email: emailInput.trim().toLowerCase(),
        callbackURL: '/dashboard',
      })
      if (res.error) {
        addToast({ title: 'Resend failed', message: res.error.message || 'Unable to queue verification email.', type: 'error' })
        return
      }
      addToast({ title: 'Verification email queued', message: `Sent to ${emailInput}`, type: 'info' })
    } catch {
      addToast({ title: 'Error', message: 'Failed to resend verification email.', type: 'error' })
    } finally {
      setIsResending(false)
    }
  }

  return (
    <AuthCard
      title={isAccountNotLinked ? 'Account Connection Required' : 'Authentication Error'}
      subtitle={
        isAccountNotLinked
          ? 'An account already exists with this email address'
          : 'There was a problem signing you into your account'
      }
    >
      <div className="space-y-5 text-left">
        {isAccountNotLinked ? (
          <div className="p-4 rounded-xl bg-[#FEF3C7] border border-[#F59E0B] text-xs text-[#92400E] space-y-3">
            <div className="flex items-start gap-2.5">
              <WarningCircle size={22} weight="fill" className="text-[#D97706] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-sm text-[#78350F]">Email Already Registered</p>
                <p className="leading-relaxed">
                  This email already has a password account. Verify your email, then sign in with Google to connect it.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-[#FCD34D]/60 space-y-2">
              <p className="text-[11px] text-[#78350F]">Need to verify now?</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Link href="/auth/verify-email" className="flex-1">
                  <Button variant="primary" size="sm" className="w-full text-xs">
                    Go to Verify Email
                  </Button>
                </Link>
                <Link href="/auth/login" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    Sign in with Password
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-[#FEE2E2] border border-[#FCA5A5] text-xs text-[#C1121F] flex items-center gap-2.5">
            <WarningCircle size={22} weight="fill" className="shrink-0" />
            <span>{error || 'An unexpected authentication error occurred. Please try again.'}</span>
          </div>
        )}

        <div className="text-center pt-2">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5C5C5C] hover:text-[#2D5A3D]"
          >
            <ArrowLeft size={16} />
            <span>Return to sign in</span>
          </Link>
        </div>
      </div>
    </AuthCard>
  )
}

export default function AuthErrorPage() {
  return (
    <ToastProvider>
      <Suspense fallback={<div className="min-h-screen bg-[#F5EDD6]" />}>
        <AuthErrorContent />
      </Suspense>
    </ToastProvider>
  )
}
