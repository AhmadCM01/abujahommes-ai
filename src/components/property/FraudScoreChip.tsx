import React from 'react'
import { ShieldCheck, ShieldWarning, WarningCircle, Check } from '@phosphor-icons/react'
import { FraudRiskLevel } from '@/types'
import { cn } from '@/lib/utils'

export interface FraudScoreChipProps {
  score: number
  riskLevel: FraudRiskLevel
  showScore?: boolean
  className?: string
}

export const FraudScoreChip: React.FC<FraudScoreChipProps> = ({
  score,
  riskLevel,
  showScore = false,
  className,
}) => {
  const getRiskInfo = () => {
    switch (riskLevel) {
      case 'low':
        return {
          bg: 'bg-[#E8F5EF] border-[#A8D5BE] text-[#2D6A4F]',
          dot: 'bg-[#2D6A4F]',
          label: 'Low Fraud Risk',
          icon: <ShieldCheck size={14} weight="fill" />,
        }
      case 'medium':
        return {
          bg: 'bg-[#FDF8EC] border-[#F0CC77] text-[#C9962A]',
          dot: 'bg-[#C9962A]',
          label: 'Proceed with Caution',
          icon: <WarningCircle size={14} weight="fill" />,
        }
      case 'high':
        return {
          bg: 'bg-[#FEE2E2] border-[#FCA5A5] text-[#C1121F]',
          dot: 'bg-[#C1121F]',
          label: 'High Risk — Verify Title',
          icon: <ShieldWarning size={14} weight="fill" />,
        }
      case 'critical':
        return {
          bg: 'bg-[#FCE8E8] border-[#F87171] text-[#7C0000]',
          dot: 'bg-[#7C0000]',
          label: 'Critical Risk — Do Not Proceed',
          icon: <ShieldWarning size={14} weight="fill" />,
        }
      default:
        return {
          bg: 'bg-[#F5EDD6] border-[#D6C9A8] text-[#5C5C5C]',
          dot: 'bg-[#5C5C5C]',
          label: 'Risk Unassessed',
          icon: <WarningCircle size={14} weight="fill" />,
        }
    }
  }

  const info = getRiskInfo()

  return (
    <div
      className={cn(
        'w-full px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center justify-between transition-all select-none',
        info.bg,
        className
      )}
    >
      <div className="flex items-center gap-1.5">
        <span className={cn('w-2 h-2 rounded-full shrink-0', info.dot)} />
        <span>{info.label}</span>
      </div>
      {showScore && (
        <span className="font-mono text-[11px] font-bold opacity-85">
          Score {score}/100
        </span>
      )}
    </div>
  )
}
