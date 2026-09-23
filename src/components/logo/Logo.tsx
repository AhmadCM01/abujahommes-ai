'use client'

import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export interface LogoProps {
  variant?: 'full' | 'vertical' | 'icon' | 'white' | 'icon-white'
  width?: number | string
  height?: number | string
  href?: string
  className?: string
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'full',
  width,
  height,
  href = '/',
  className = '',
}) => {
  // Exact Favicon / Monogram Mark
  const renderIcon = (isWhite = false, size = 36) => (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
      style={{
        width: width ? (variant === 'icon' || variant === 'icon-white' ? width : size) : size,
        height: height ? (variant === 'icon' || variant === 'icon-white' ? height : size) : size,
      }}
    >
      {/* Left Golden Amber Chevron */}
      <path
        d="M34 30 L24 20 L24 80 L60 44"
        stroke={isWhite ? '#F0CC77' : '#DA9126'}
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Right Forest Green Chevron (180deg symmetric) */}
      <path
        d="M66 70 L76 80 L76 20 L40 56"
        stroke={isWhite ? '#FFFFFF' : '#1E5936'}
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )

  const renderContent = () => {
    switch (variant) {
      case 'icon':
        return renderIcon(false, 36)

      case 'icon-white':
        return renderIcon(true, 36)

      case 'vertical':
        return (
          <div className={cn('inline-flex flex-col items-center justify-center gap-2.5 text-center select-none', className)}>
            <div className="w-14 h-14 flex items-center justify-center">
              {renderIcon(false, 54)}
            </div>
            <div className="text-xl sm:text-2xl font-bold tracking-tight leading-tight">
              <span className="text-[#1E5936]">Abuja</span>
              <span className="text-[#1A1A1A]">Hommes</span>
              <span className="text-[#DA9126] font-extrabold"> AI</span>
            </div>
          </div>
        )

      case 'white':
        return (
          <div className={cn('inline-flex items-center gap-2.5 select-none whitespace-nowrap', className)}>
            {renderIcon(true, 36)}
            <div className="text-lg sm:text-xl font-bold tracking-tight leading-none whitespace-nowrap">
              <span className="text-white">Abuja</span>
              <span className="text-[#F5EDD6]">Hommes</span>
              <span className="text-[#F0CC77] font-extrabold"> AI</span>
            </div>
          </div>
        )

      case 'full':
      default:
        return (
          <div className={cn('inline-flex items-center gap-2.5 select-none whitespace-nowrap', className)}>
            {renderIcon(false, 36)}
            <div className="text-lg sm:text-xl font-bold tracking-tight leading-none whitespace-nowrap">
              <span className="text-[#1E5936]">Abuja</span>
              <span className="text-[#1A1A1A]">Hommes</span>
              <span className="text-[#DA9126] font-extrabold"> AI</span>
            </div>
          </div>
        )
    }
  }

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center focus:outline-none hover:opacity-95 transition-opacity whitespace-nowrap">
        {renderContent()}
      </Link>
    )
  }

  return renderContent()
}

export default Logo
