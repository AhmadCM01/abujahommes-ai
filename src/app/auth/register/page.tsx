import { Metadata } from 'next'
import { AuthCard } from '@/components/auth/AuthCard'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { ToastProvider } from '@/components/ui/Toast'

export const metadata: Metadata = {
  title: 'Create Account — AbujaHommes AI',
  description: 'Transparent property search and listings across Abuja.',
}

export default function RegisterPage() {
  return (
    <ToastProvider>
      <AuthCard
        title="Welcome to AbujaHommes AI"
        subtitle="Property intelligence designed specifically for Abuja"
        maxWidth="lg"
      >
        <RegisterForm />
      </AuthCard>
    </ToastProvider>
  )
}
