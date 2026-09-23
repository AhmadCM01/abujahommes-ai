'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Lock,
  Envelope,
  PaperPlaneTilt,
  ArrowLeft,
  Eye,
  EyeSlash,
} from '@phosphor-icons/react'
import { AuthCard } from '@/components/auth/AuthCard'
import { Input, Button } from '@/components/ui'
import { ToastProvider, useToast } from '@/components/ui/Toast'
import { authClient } from '@/lib/auth/client'

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tokenParam = searchParams.get('token')
  const { addToast } = useToast()

  const [step, setStep] = useState<1 | 2 | 3>(tokenParam ? 3 : 1)
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (tokenParam) {
      setStep(3)
    }
  }, [tokenParam])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (step === 2 && countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [step, countdown])

  const handleSendResetLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    try {
      const res = await authClient.requestPasswordReset({
        email: email.trim().toLowerCase(),
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (res.error) {
        addToast({
          title: 'Request failed',
          message: res.error.message || 'Unable to request password reset.',
          type: 'error',
        })
        return
      }

      setStep(2)
      setCountdown(60)
    } catch (err: unknown) {
      addToast({
        title: 'Error',
        message: err instanceof Error ? err.message : 'An unexpected error occurred.',
        type: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword.length < 10) {
      addToast({
        title: 'Password too short',
        message: 'Password must be at least 10 characters long.',
        type: 'error',
      })
      return
    }

    if (newPassword !== confirmPassword) {
      addToast({
        title: 'Error',
        message: 'Passwords do not match.',
        type: 'error',
      })
      return
    }

    const resetToken = tokenParam || searchParams.get('token')
    if (!resetToken) {
      addToast({
        title: 'Invalid link',
        message: 'Missing or expired reset token. Please request a new link.',
        type: 'error',
      })
      setStep(1)
      return
    }

    setIsLoading(true)
    try {
      const res = await authClient.resetPassword({
        newPassword,
        token: resetToken,
      })

      if (res.error) {
        addToast({
          title: 'Reset failed',
          message: res.error.message || 'This reset link is invalid or has already been used.',
          type: 'error',
        })
        return
      }

      addToast({
        title: 'Password updated',
        message: 'All other sessions have been revoked. Please sign in with your new password.',
        type: 'success',
      })
      router.push('/auth/login?reset=success')
    } catch (err: unknown) {
      addToast({
        title: 'Error',
        message: err instanceof Error ? err.message : 'Failed to update password.',
        type: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthCard
      title={
        step === 1
          ? 'Reset your password'
          : step === 2
          ? 'Check your email'
          : 'Create new password'
      }
      subtitle={
        step === 1
          ? 'Enter your registered email and we will queue a secure reset link'
          : step === 2
          ? `We queued a password reset link for ${email}`
          : 'Choose a strong password with at least 10 characters'
      }
    >
      {step === 1 && (
        <form onSubmit={handleSendResetLink} className="space-y-4">
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 rounded-full bg-[#F0F4EC] text-[#2D5A3D] flex items-center justify-center text-xl">
              <Lock size={24} weight="fill" />
            </div>
          </div>
          <Input
            label="Email Address"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Envelope size={18} />}
            required
          />
          <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isLoading}>
            Send Reset Link
          </Button>
          <div className="text-center pt-2">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5C5C5C] hover:text-[#2D5A3D]"
            >
              <ArrowLeft size={16} />
              <span>Back to sign in</span>
            </Link>
          </div>
        </form>
      )}

      {step === 2 && (
        <div className="text-center space-y-5">
          <div className="flex justify-center">
            <div className="w-14 h-14 rounded-full bg-[#F0F4EC] text-[#2D5A3D] flex items-center justify-center text-2xl">
              <PaperPlaneTilt size={32} weight="fill" />
            </div>
          </div>
          <p className="text-xs text-[#5C5C5C]">
            Did not receive the email? Check your spam folder or request a new link below.
          </p>
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              size="md"
              disabled={countdown > 0}
              onClick={async () => {
                setCountdown(60)
                try {
                  await authClient.requestPasswordReset({
                    email: email.trim().toLowerCase(),
                    redirectTo: `${window.location.origin}/auth/reset-password`,
                  })
                  addToast({ title: 'Link resent', message: 'A fresh reset link has been queued.', type: 'info' })
                } catch {
                  addToast({ title: 'Resend failed', message: 'Could not queue reset link.', type: 'error' })
                }
              }}
            >
              {countdown > 0 ? `Resend link (${countdown}s)` : 'Resend reset link'}
            </Button>
          </div>
          <div className="pt-2">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5C5C5C] hover:text-[#2D5A3D]"
            >
              <ArrowLeft size={16} />
              <span>Back to sign in</span>
            </Link>
          </div>
        </div>
      )}

      {step === 3 && (
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <Input
            label="New Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Min. 10 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            leftIcon={<Lock size={18} />}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[#5C5C5C] hover:text-[#1A1A1A] p-1"
              >
                {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
              </button>
            }
            required
          />
          <Input
            label="Confirm New Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Repeat new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            leftIcon={<Lock size={18} />}
            required
          />
          <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isLoading}>
            Update Password
          </Button>
        </form>
      )}
    </AuthCard>
  )
}

export default function ResetPasswordPage() {
  return (
    <ToastProvider>
      <Suspense fallback={<div className="min-h-screen bg-[#F5EDD6]" />}>
        <ResetPasswordContent />
      </Suspense>
    </ToastProvider>
  )
}
