'use client'

import React from 'react'
import { HouseSimple, Buildings, Check } from '@phosphor-icons/react'
import { UserRole } from '@/types'
import { cn } from '@/lib/utils'

export interface RoleSelectorProps {
  selectedRole: UserRole
  onSelectRole: (role: UserRole) => void
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  selectedRole,
  onSelectRole,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
      {/* Buyer / Investor Card */}
      <div
        onClick={() => onSelectRole('buyer')}
        className={cn(
          'p-5 rounded-2xl cursor-pointer transition-all duration-200 text-left border-2 flex flex-col justify-between bg-white shadow-1 hover:shadow-2',
          selectedRole === 'buyer'
            ? 'border-[#2D5A3D] bg-[#F0F4EC]'
            : 'border-transparent hover:border-[#D6C9A8]'
        )}
      >
        <div>
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-[#2D5A3D] mb-4 shadow-xs">
            <HouseSimple size={28} weight="fill" />
          </div>
          <h3 className="text-base font-bold text-[#1A1A1A]">Buyer / Investor</h3>
          <p className="text-xs text-[#5C5C5C] mt-1 mb-4">
            Looking to buy, rent, or invest in Abuja properties.
          </p>
          <ul className="space-y-2 text-xs text-[#1A1A1A]">
            <li className="flex items-center gap-2">
              <Check size={14} className="text-[#2D6A4F] shrink-0" weight="bold" />
              <span>Search properties with AI</span>
            </li>
            <li className="flex items-center gap-2">
              <Check size={14} className="text-[#2D6A4F] shrink-0" weight="bold" />
              <span>Instant fair price estimates</span>
            </li>
            <li className="flex items-center gap-2">
              <Check size={14} className="text-[#2D6A4F] shrink-0" weight="bold" />
              <span>Fraud risk detection</span>
            </li>
          </ul>
        </div>
        <div className="mt-5 flex items-center justify-end">
          <span
            className={cn(
              'w-5 h-5 rounded-full border-2 flex items-center justify-center',
              selectedRole === 'buyer'
                ? 'border-[#2D5A3D] bg-[#2D5A3D] text-white'
                : 'border-[#D6C9A8]'
            )}
          >
            {selectedRole === 'buyer' && <Check size={12} weight="bold" />}
          </span>
        </div>
      </div>

      {/* Seller / Landowner Card */}
      <div
        onClick={() => onSelectRole('seller')}
        className={cn(
          'p-5 rounded-2xl cursor-pointer transition-all duration-200 text-left border-2 flex flex-col justify-between bg-white shadow-1 hover:shadow-2',
          selectedRole === 'seller'
            ? 'border-[#C9962A] bg-[#FDF8EC]'
            : 'border-transparent hover:border-[#D6C9A8]'
        )}
      >
        <div>
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-[#C9962A] mb-4 shadow-xs">
            <Buildings size={28} weight="fill" />
          </div>
          <h3 className="text-base font-bold text-[#1A1A1A]">Seller / Owner</h3>
          <p className="text-xs text-[#5C5C5C] mt-1 mb-4">
            Direct property owner or private land developer.
          </p>
          <ul className="space-y-2 text-xs text-[#1A1A1A]">
            <li className="flex items-center gap-2">
              <Check size={14} className="text-[#2D6A4F] shrink-0" weight="bold" />
              <span>List your property for free</span>
            </li>
            <li className="flex items-center gap-2">
              <Check size={14} className="text-[#2D6A4F] shrink-0" weight="bold" />
              <span>Direct diaspora buyers</span>
            </li>
            <li className="flex items-center gap-2">
              <Check size={14} className="text-[#2D6A4F] shrink-0" weight="bold" />
              <span>AI valuation comps</span>
            </li>
          </ul>
        </div>
        <div className="mt-5 flex items-center justify-end">
          <span
            className={cn(
              'w-5 h-5 rounded-full border-2 flex items-center justify-center',
              selectedRole === 'seller'
                ? 'border-[#C9962A] bg-[#C9962A] text-white'
                : 'border-[#D6C9A8]'
            )}
          >
            {selectedRole === 'seller' && <Check size={12} weight="bold" />}
          </span>
        </div>
      </div>
    </div>
  )
}
