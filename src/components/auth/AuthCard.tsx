'use client'

import React from 'react'
import { Logo } from '@/components/logo/Logo'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

export interface AuthCardProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg'
  className?: string
}

export const AuthCard: React.FC<AuthCardProps> = ({
  title,
  subtitle,
  children,
  maxWidth = 'md',
  className,
}) => {
  const maxWidthMap = {
    sm: 'max-w-sm',
    md: 'max-w-[480px]',
    lg: 'max-w-xl',
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-[#F5EDD6]">
      <div className="mb-6 flex justify-center">
        <Logo variant="full" />
      </div>

      <Card
        elevation="2"
        className={cn(
          'w-full bg-white rounded-2xl p-6 sm:p-8 border border-[#D6C9A8]',
          maxWidthMap[maxWidth],
          className
        )}
      >
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[#1A1A1A] tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-sm text-[#5C5C5C] mt-1.5 leading-relaxed">{subtitle}</p>
          )}
        </div>
        {children}
      </Card>
    </div>
  )
}
