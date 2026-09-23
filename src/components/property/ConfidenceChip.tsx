import { Sparkle } from '@phosphor-icons/react'
import { PriceConfidence, FraudRiskLevel } from '@/types'
import { cn } from '@/lib/utils'

export interface ConfidenceChipProps {
  confidence?: PriceConfidence | null
  fraudRiskLevel?: FraudRiskLevel
  askingPrice?: number | null
  aiPriceMin?: number | null
  aiPriceMax?: number | null
  className?: string
}

export const ConfidenceChip: React.FC<ConfidenceChipProps> = ({
  confidence,
  fraudRiskLevel,
  askingPrice,
  aiPriceMin,
  aiPriceMax,
  className,
}) => {
  if (!confidence) {
    return null
  }

  let effectiveConfidence: PriceConfidence = confidence

  // Downgrade High confidence if asking price is far outside predicted AI bounds
  // (e.g. asking below 50% of min or above 200% of max)
  if (
    effectiveConfidence === 'high' &&
    typeof askingPrice === 'number' &&
    askingPrice > 0 &&
    typeof aiPriceMin === 'number' &&
    aiPriceMin > 0 &&
    typeof aiPriceMax === 'number' &&
    aiPriceMax > 0
  ) {
    if (askingPrice < 0.5 * aiPriceMin || askingPrice > 2.0 * aiPriceMax) {
      effectiveConfidence = 'low'
    }
  }

  // Never show "High AI Confidence" when fraud_risk_level is high or critical
  if (
    effectiveConfidence === 'high' &&
    (fraudRiskLevel === 'high' || fraudRiskLevel === 'critical')
  ) {
    return null
  }

  const confidenceStyles = {
    high: 'bg-[#E8F5EF] text-[#2D6A4F] border-[#A8D5BE]',
    medium: 'bg-[#FDF8EC] text-[#C9962A] border-[#F0CC77]',
    low: 'bg-[#FEE2E2] text-[#C1121F] border-[#FCA5A5]',
  }

  const labels = {
    high: 'High AI Confidence',
    medium: 'Medium Confidence',
    low: 'Preliminary Estimate',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border tracking-wide select-none',
        confidenceStyles[effectiveConfidence],
        className
      )}
    >
      <Sparkle size={12} weight="fill" />
      <span>{labels[effectiveConfidence]}</span>
    </span>
  )
}

