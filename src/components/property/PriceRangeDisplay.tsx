import React from 'react'
import { formatNGN, cn } from '@/lib/utils'
import { PriceConfidence, FraudRiskLevel } from '@/types'

export interface PriceRangeDisplayProps {
  minPrice?: number | null
  maxPrice?: number | null
  askingPrice?: number | null
  confidence?: PriceConfidence | null
  fraudRiskLevel?: FraudRiskLevel
  transactionType?: 'rent' | 'sale'
  className?: string
}

export const PriceRangeDisplay: React.FC<PriceRangeDisplayProps> = ({
  minPrice,
  maxPrice,
  askingPrice,
  confidence,
  fraudRiskLevel,
  transactionType = 'rent',
  className,
}) => {
  // 1. Missing or non-positive bounds -> hide
  if (!minPrice || !maxPrice || minPrice <= 0 || maxPrice <= 0) return null

  // 2. Low confidence or high/critical fraud risk -> do not imply a precise market price
  if (
    confidence === 'low' ||
    fraudRiskLevel === 'high' ||
    fraudRiskLevel === 'critical'
  ) {
    return null
  }

  // 3. Asking price far outside predicted bounds (e.g. asking below 50% min or above 200% max) -> hide
  if (
    typeof askingPrice === 'number' &&
    askingPrice > 0 &&
    (askingPrice < 0.5 * minPrice || askingPrice > 2.0 * maxPrice)
  ) {
    return null
  }

  return (
    <div className={cn('text-xs text-[#5C5C5C] flex items-center gap-1', className)}>
      <span className="font-medium">Fair range:</span>
      <span className="font-semibold text-[#1A1A1A]">
        {formatNGN(minPrice, true)} – {formatNGN(maxPrice, true)}
      </span>
      <span className="text-[10px] text-[#9A9A9A]">
        {transactionType === 'rent' ? '/yr' : ''}
      </span>
    </div>
  )
}

