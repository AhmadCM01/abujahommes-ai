'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { WarningCircle, ArrowsCounterClockwise } from '@phosphor-icons/react'
import { Button, Card } from '@/components/ui'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('App Error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#F5EDD6] flex items-center justify-center p-4">
      <Card elevation="2" className="max-w-md w-full p-8 bg-white border border-[#D6C9A8] text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#FEE2E2] text-[#C1121F] flex items-center justify-center mx-auto">
          <WarningCircle size={36} weight="fill" />
        </div>

        <h1 className="text-xl font-bold text-[#1A1A1A]">
          Something Went Wrong
        </h1>
        <p className="text-xs text-[#5C5C5C] leading-relaxed">
          An unexpected error occurred while loading this page. Our technical team has been notified.
        </p>

        <div className="flex gap-3 pt-2">
          <Button
            variant="primary"
            size="md"
            className="flex-1"
            onClick={() => reset()}
            leftIcon={<ArrowsCounterClockwise size={16} />}
          >
            Try Again
          </Button>
          <Link href="/" className="flex-1">
            <Button variant="outline" size="md" className="w-full">
              Return Home
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
