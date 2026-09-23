'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  User,
  Envelope,
  Phone,
  Lock,
  Eye,
  EyeSlash,
  ArrowLeft,
  WarningCircle,
} from '@phosphor-icons/react'
import { Input, Button, Checkbox, Divider } from '@/components/ui'
import { RoleSelector } from './RoleSelector'
import { GoogleButton } from './GoogleButton'
import { UserRole } from '@/types'
import { useAuthStore } from '@/store/auth'
import { useToast } from '@/components/ui/Toast'
import { authClient } from '@/lib/auth/client'
import { cn } from '@/lib/utils'

export const RegisterForm: React.FC = () => {
  const router = useRouter()
  const { setUser } = useAuthStore()
  const { addToast } = useToast()

  const [step, setStep] = useState<0 | 1>(0)
  const [selectedRole, setSelectedRole] = useState<UserRole>('buyer')

  // Form State
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreedTerms, setAgreedTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0
    let score = 0
    if (pass.length >= 8) score += 1
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1
    if (/[0-9]/.test(pass)) score += 1
    if (/[^A-Za-z0-9]/.test(pass)) score += 1
    return score
  }

  const passwordScore = getPasswordStrength(password)

  const persistIntendedRoleCookie = (role: UserRole) => {
    // Whitelist only buyer | seller. Never agent or admin in this phase.
    const safeRole = role === 'seller' ? 'seller' : 'buyer'
    if (typeof document !== 'undefined') {
      const isSecure = window.location.protocol === 'https:'
      document.cookie = `ah_intended_role=${encodeURIComponent(safeRole)}; path=/; max-age=600; SameSite=Lax${isSecure ? '; Secure' : ''}`
    }
  }

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role)
    persistIntendedRoleCookie(role)
  }

  const handleGoogleSignup = async () => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      // Persist chosen role into ah_intended_role cookie before OAuth redirect
      persistIntendedRoleCookie(selectedRole)

      const res = await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/dashboard',
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

    if (!fullName || !email || !password) {
      setErrorMessage('Please fill in all required fields.')
      return
    }

    if (password.length < 10) {
      setErrorMessage('Password must be at least 10 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.')
      return
    }

    if (!agreedTerms) {
      setErrorMessage('Please agree to the Terms of Service and Privacy Policy.')
      return
    }

    setIsLoading(true)

    try {
      const res = await authClient.signUp.email({
        email: email.trim().toLowerCase(),
        password,
        name: fullName.trim(),
        fetchOptions: {
          body: {
            role: selectedRole,
            phone: phone.trim() || undefined,
          },
        },
      })

      if (res.error) {
        setErrorMessage(res.error.message || 'Failed to create account. Please try again.')
        setIsLoading(false)
        return
      }

      if (res.data?.user) {
        setUser({
          id: res.data.user.id,
          full_name: fullName.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          role: selectedRole,
          status: 'pending',
          is_verified: false,
        })
      }

      addToast({
        title: 'Account created',
        message: 'Please verify your email address to activate your account.',
        type: 'info',
      })

      // Non-negotiable: Email/password users must verify email; route to verification notice
      router.push(`/auth/verify-email?email=${encodeURIComponent(email.trim())}`)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to complete registration.'
      setErrorMessage(message)
    } finally {
      setIsLoading(false)
    }
  }

  if (step === 0) {
    return (
      <div className="w-full space-y-6">
        <RoleSelector selectedRole={selectedRole} onSelectRole={handleRoleSelect} />

        <Button
          variant="primary"
          size="lg"
          className="w-full min-h-[48px]"
          onClick={() => {
            persistIntendedRoleCookie(selectedRole)
            setStep(1)
          }}
        >
          Continue as {selectedRole === 'buyer' ? 'Buyer / Investor' : selectedRole === 'seller' ? 'Seller / Owner' : 'Licensed Agent'}
        </Button>

        <p className="text-center text-xs text-[#5C5C5C]">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-bold text-[#2D5A3D] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between pb-2">
        <button
          type="button"
          onClick={() => setStep(0)}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#5C5C5C] hover:text-[#2D5A3D] min-h-[44px] py-1"
        >
          <ArrowLeft size={16} />
          <span>Change Role ({selectedRole})</span>
        </button>
      </div>

      <GoogleButton
        onClick={handleGoogleSignup}
        text={`Sign up with Google as ${selectedRole === 'seller' ? 'Seller' : 'Buyer'}`}
        isLoading={isLoading}
      />

      <Divider label="or sign up with email" />

      {errorMessage && (
        <div className="p-3 rounded-lg bg-[#FEE2E2] border border-[#FCA5A5] flex items-center gap-2 text-xs text-[#C1121F] animate-shake">
          <WarningCircle size={18} weight="fill" className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          type="text"
          placeholder="e.g. Kelvin Mike"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          leftIcon={<User size={18} />}
          required
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Envelope size={18} />}
          required
        />

        <Input
          label="Phone Number"
          type="tel"
          placeholder="+234 800 000 0000"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          leftIcon={<Phone size={18} />}
        />

        <div>
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Min. 8 characters"
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
          {password.length > 0 && (
            <div className="mt-2 flex items-center gap-1.5">
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={cn(
                    'h-1.5 flex-1 rounded-full transition-all duration-200',
                    passwordScore >= level
                      ? passwordScore === 1
                        ? 'bg-[#C1121F]'
                        : passwordScore === 2
                        ? 'bg-[#C9962A]'
                        : 'bg-[#2D6A4F]'
                      : 'bg-[#EDE0C4]'
                  )}
                />
              ))}
              <span className="text-[11px] font-bold ml-1 text-[#5C5C5C]">
                {passwordScore === 1 && 'Weak'}
                {passwordScore === 2 && 'Fair'}
                {passwordScore === 3 && 'Good'}
                {passwordScore === 4 && 'Strong'}
              </span>
            </div>
          )}
        </div>

        <Input
          label="Confirm Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Repeat your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          leftIcon={<Lock size={18} />}
          required
        />

        <div className="pt-1">
          <Checkbox
            checked={agreedTerms}
            onChange={(e) => setAgreedTerms(e.target.checked)}
            label={
              <span className="text-xs text-[#5C5C5C]">
                I agree to the{' '}
                <Link href="/terms" className="font-semibold text-[#2D5A3D] underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="font-semibold text-[#2D5A3D] underline">
                  Privacy Policy
                </Link>
              </span>
            }
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-2 min-h-[48px]"
          isLoading={isLoading}
        >
          Create {selectedRole === 'seller' ? 'Seller' : 'Buyer'} Account
        </Button>
      </form>

      <p className="text-center text-xs text-[#5C5C5C] pt-2">
        Already have an account?{' '}
        <Link href="/auth/login" className="font-bold text-[#2D5A3D] hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
