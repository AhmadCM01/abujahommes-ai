'use client'

import React from 'react'
import Link from 'next/link'
import { HouseSimple, MagnifyingGlass } from '@phosphor-icons/react'
import { Button, Card } from '@/components/ui'
import { Logo } from '@/components/logo/Logo'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#F5EDD6] flex items-center justify-center p-4">
      <Card elevation="2" className="max-w-md w-full p-8 bg-white border border-[#D6C9A8] text-center space-y-4">
        <div className="flex justify-center pb-2">
          <Logo variant="vertical" />
        </div>

        <span className="text-4xl font-extrabold text-[#2D5A3D]">404</span>

        <h1 className="text-xl font-bold text-[#1A1A1A]">
          Page Not Found
        </h1>
        <p className="text-xs text-[#5C5C5C] leading-relaxed">
          The property, dashboard route, or page you are searching for does not exist or may have been moved.
        </p>

        <div className="flex gap-3 pt-2">
          <Link href="/dashboard/buyer/search" className="flex-1">
            <Button variant="primary" size="md" className="w-full" leftIcon={<MagnifyingGlass size={16} />}>
              Search Abuja
            </Button>
          </Link>
          <Link href="/" className="flex-1">
            <Button variant="outline" size="md" className="w-full" leftIcon={<HouseSimple size={16} />}>
              Home
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
