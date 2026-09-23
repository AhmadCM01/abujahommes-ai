import { Metadata } from 'next'
import { AuthCard } from '@/components/auth/AuthCard'
import { LoginForm } from '@/components/auth/LoginForm'
import { ToastProvider } from '@/components/ui/Toast'

export const metadata: Metadata = {
  title: 'Sign In — AbujaHommes AI',
  description: 'Sign in to access Abuja property intelligence, fair price predictions, and saved searches.',
}

export default function LoginPage() {
  return (
    <ToastProvider>
      <AuthCard
        title="Welcome back"
        subtitle="Sign in to your AbujaHommes AI account"
      >
        <LoginForm />
      </AuthCard>
    </ToastProvider>
  )
}
