'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Envelope, Lock, Eye, EyeSlash, WarningCircle } from '@phosphor-icons/react'
import { Input, Button, Divider } from '@/components/ui'
import { GoogleButton } from './GoogleButton'
import { useAuthStore } from '@/store/auth'
import { useToast } from '@/components/ui/Toast'
import { authClient } from '@/lib/auth/client'

function getSafeRedirect(target: string | null | undefined): string {
  if (!target) return '/dashboard'
  if (target.startsWith('/') && !target.startsWith('//')) {
    return target
  }
  return '/dashboard'
}

export const LoginForm: React.FC = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectParam = searchParams.get('redirect')
  const safeRedirect = getSafeRedirect(redirectParam)

  const { setUser } = useAuthStore()
  const { addToast } = useToast()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(() => {
    if (searchParams.get('error') === 'suspended') {
      return 'Your account has been suspended. Please contact support.'
    }
    return null
  })

  React.useEffect(() => {
    if (searchParams.get('reset') === 'success') {
      addToast({ title: 'Password updated', message: 'You can now sign in with your new password.', type: 'success' })
    }
    if (searchParams.get('verified') === 'true') {
      addToast({ title: 'Email verified', message: 'Your email has been verified. Welcome!', type: 'success' })
    }
  }, [searchParams, addToast])

  const isAccountNotLinked = searchParams.get('error') === 'account_not_linked'

  const handleResendVerification = async () => {
    if (!email) {
      router.push('/auth/verify-email')
      return
    }
    try {
      const res = await authClient.sendVerificationEmail({
        email: email.trim().toLowerCase(),
        callbackURL: '/dashboard',
      })
      if (res.error) {
        addToast({ title: 'Resend failed', message: res.error.message || 'Unable to queue verification email.', type: 'error' })
        return
      }
      addToast({ title: 'Verification email queued', message: `Queued for ${email}`, type: 'info' })
    } catch {
      addToast({ title: 'Error', message: 'Failed to resend verification email.', type: 'error' })
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const res = await authClient.signIn.social({
        provider: 'google',
        callbackURL: safeRedirect,
        errorCallbackURL: '/auth/login',
      })
      if (res?.error) {
        setErrorMessage(res.error.message || 'Google OAuth failed. Ensure GOOGLE_CLIENT_ID is configured.')
        setIsLoading(false)
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Google OAuth is not configured or missing credentials.'
      setErrorMessage(message)
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!email || !password) {
      setErrorMessage('Please fill in both email and password.')
      return
    }

    setIsLoading(true)

    try {
      const res = await authClient.signIn.email({
        email: email.trim().toLowerCase(),
        password,
      })

      if (res.error) {
        setErrorMessage(res.error.message || 'Invalid email or password.')
        setIsLoading(false)
        return
      }

      if (res.data?.user) {
        setUser({
          id: res.data.user.id,
          full_name: res.data.user.name || email.split('@')[0],
          email: res.data.user.email,
          role: 'buyer',
          status: res.data.user.emailVerified ? 'active' : 'pending',
          is_verified: res.data.user.emailVerified,
        })
      }

      addToast({ title: 'Welcome back', message: 'Signed in successfully', type: 'success' })
      router.push(safeRedirect)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred during sign-in.'
      setErrorMessage(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full space-y-4">
      {isAccountNotLinked && (
        <div className="p-4 rounded-xl bg-[#FEF3C7] border border-[#F59E0B] text-xs text-[#92400E] space-y-2 text-left animate-fadeIn">
          <div className="flex items-start gap-2.5">
            <WarningCircle size={22} weight="fill" className="text-[#D97706] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-sm text-[#78350F]">Account Connection Required</p>
              <p className="leading-relaxed">
                This email already has a password account. Verify your email, then sign in with Google to connect it.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-1 pl-8">
            <Link
              href={`/auth/verify-email${email ? `?email=${encodeURIComponent(email)}` : ''}`}
              className="font-bold text-[#B45309] underline hover:text-[#78350F]"
            >
              Verify your email
            </Link>
            <span>•</span>
            <button
              type="button"
              onClick={handleResendVerification}
              className="font-bold text-[#B45309] underline hover:text-[#78350F]"
            >
              Resend verification
            </button>
          </div>
        </div>
      )}

      <GoogleButton onClick={handleGoogleLogin} isLoading={isLoading} />

      <Divider label="or sign in with email" />

      {errorMessage && !isAccountNotLinked && (
        <div className="p-3 rounded-lg bg-[#FEE2E2] border border-[#FCA5A5] flex items-center gap-2 text-xs text-[#C1121F] animate-shake">
          <WarningCircle size={18} weight="fill" className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Envelope size={18} />}
          required
        />

        <div>
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock size={18} />}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[#5C5C5C] hover:text-[#1A1A1A] p-2 min-h-[44px] flex items-center justify-center"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
              </button>
            }
            required
          />
          <div className="flex justify-end mt-1.5">
            <Link
              href="/auth/reset-password"
              className="text-xs font-semibold text-[#2D5A3D] hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-2 min-h-[48px]"
          isLoading={isLoading}
        >
          Sign In
        </Button>
      </form>

      <p className="text-center text-xs text-[#5C5C5C] pt-1">
        Don&apos;t have an account?{' '}
        <Link href="/auth/register" className="font-bold text-[#2D5A3D] hover:underline">
          Create one for free
        </Link>
      </p>
    </div>
  )
}
