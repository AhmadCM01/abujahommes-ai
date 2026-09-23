'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Calculator,
  Coins,
  HouseSimple,
  Receipt,
  TrendUp,
  ShieldCheck,
  ArrowRight,
  Info,
  CheckCircle,
} from '@phosphor-icons/react'
import { Card, Button, Input, Select, Tabs } from '@/components/ui'
import { ABUJA_LGAS, POPULAR_LOCATIONS } from '@/lib/data/locations'
import { formatNGN } from '@/lib/utils'
import { LGA, TransactionType } from '@/types'

export default function BuyerPriceCalculatorPage() {
  const [activeTab, setActiveTab] = useState<'cost' | 'affordability'>('cost')

  // --- Mode 1: Total Cost Calculator State ---
  const [transactionType, setTransactionType] = useState<TransactionType>('rent')
  const [basePrice, setBasePrice] = useState<number>(2500000)
  const [selectedLGA, setSelectedLGA] = useState<LGA>('AMAC')
  const [includeCaution, setIncludeCaution] = useState(true)
  const [includeServiceCharge, setIncludeServiceCharge] = useState(true)

  // Calculations for Mode 1
  const agencyRate = transactionType === 'rent' ? 0.10 : 0.05
  const legalRate = transactionType === 'rent' ? 0.05 : 0.03
  const stampDutyRate = transactionType === 'sale' ? 0.015 : 0

  const agencyFee = Math.round(basePrice * agencyRate)
  const legalFee = Math.round(basePrice * legalRate)
  const stampDutyFee = Math.round(basePrice * stampDutyRate)
  const cautionDeposit = includeCaution && transactionType === 'rent' ? Math.round(basePrice * 0.10) : 0

  // District specific service charge estimates
  const lgaServiceChargeMap: Record<LGA, number> = {
    AMAC: transactionType === 'rent' ? 350000 : 800000,
    Bwari: transactionType === 'rent' ? 180000 : 400000,
    Gwagwalada: transactionType === 'rent' ? 120000 : 250000,
    Kuje: transactionType === 'rent' ? 120000 : 250000,
    Kwali: transactionType === 'rent' ? 80000 : 180000,
    Abaji: transactionType === 'rent' ? 60000 : 150000,
  }

  const estimatedServiceCharge = includeServiceCharge ? (lgaServiceChargeMap[selectedLGA] || 250000) : 0
  const totalCost = basePrice + agencyFee + legalFee + stampDutyFee + cautionDeposit + estimatedServiceCharge

  // --- Mode 2: Income Affordability State ---
  const [incomeType, setIncomeType] = useState<'monthly' | 'annual'>('monthly')
  const [incomeAmount, setIncomeAmount] = useState<number>(800000)
  const [existingDebtMonthly, setExistingDebtMonthly] = useState<number>(0)

  const annualGross = incomeType === 'monthly' ? incomeAmount * 12 : incomeAmount
  const monthlyNetAvailable = Math.max(0, (annualGross / 12) - existingDebtMonthly)

  // 30% rule for rent
  const maxAnnualRent = Math.round(monthlyNetAvailable * 12 * 0.30)
  const maxMonthlyRent = Math.round(maxAnnualRent / 12)

  // Max Purchase Price (assuming 4x annual income or 20% downpayment capability)
  const maxPurchasePrice = Math.round(annualGross * 4.5)

  // Suitable districts based on affordable rent
  const getAffordableDistricts = (rent: number) => {
    if (rent >= 5000000) return ['Maitama', 'Asokoro', 'Wuse 2', 'Guzape', 'Katampe Extension']
    if (rent >= 2200000) return ['Gwarinpa', 'Jabi', 'Utako', 'Mabushi', 'Apo Legislative Quarters']
    if (rent >= 1200000) return ['Lokogoma', 'Lugbe Airport Road', 'Kubwa', 'Dawaki', 'Galadimawa']
    return ['Lugbe Outer', 'Kuje Town', 'Bwari Central', 'Gwagwalada Phase 1']
  }

  const suitableDistricts = getAffordableDistricts(maxAnnualRent)

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] tracking-tight">
          Abuja Property Price &amp; Affordability Calculator
        </h1>
        <p className="text-xs sm:text-sm text-[#5C5C5C] mt-0.5">
          Estimate total move-in costs, statutory fees, or benchmark what property budget fits your income
        </p>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'cost', label: 'Total Transaction Cost Breakdown' },
          { id: 'affordability', label: 'Income & Rent Affordability Analyzer' },
        ]}
        activeTab={activeTab}
        onChange={(tab) => setActiveTab(tab as 'cost' | 'affordability')}
      />

      {/* TAB 1: TOTAL TRANSACTION COST */}
      {activeTab === 'cost' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Inputs (Left 1/3) */}
          <Card elevation="1" className="lg:col-span-1 p-6 bg-white border border-[#D6C9A8] space-y-4">
            <h3 className="text-sm font-bold text-[#1A1A1A] pb-2 border-b border-[#EDE0C4]">
              Property &amp; Transaction Details
            </h3>

            <div>
              <label className="text-xs font-bold text-[#1A1A1A] block mb-1.5">
                Listing Type
              </label>
              <div className="grid grid-cols-2 gap-2 bg-[#F5EDD6] p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setTransactionType('rent')
                    setBasePrice(2500000)
                  }}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    transactionType === 'rent'
                      ? 'bg-[#2D5A3D] text-white shadow-xs'
                      : 'text-[#5C5C5C] hover:text-[#1A1A1A]'
                  }`}
                >
                  For Rent
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTransactionType('sale')
                    setBasePrice(75000000)
                  }}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    transactionType === 'sale'
                      ? 'bg-[#C9962A] text-white shadow-xs'
                      : 'text-[#5C5C5C] hover:text-[#1A1A1A]'
                  }`}
                >
                  Outright Sale
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#1A1A1A] block mb-1.5">
                {transactionType === 'rent' ? 'Annual Rent (NGN)' : 'Asking Purchase Price (NGN)'}
              </label>
              <Input
                type="number"
                value={basePrice.toString()}
                onChange={(e) => setBasePrice(Number(e.target.value))}
                placeholder="2500000"
              />
              <span className="text-[11px] text-[#2D5A3D] font-bold block mt-1">
                {formatNGN(basePrice)}
              </span>
            </div>

            <Select
              label="Area Council (LGA)"
              value={selectedLGA}
              onChange={(e) => setSelectedLGA(e.target.value as LGA)}
            >
              {ABUJA_LGAS.map((lga) => (
                <option key={lga} value={lga}>
                  {lga} Council
                </option>
              ))}
            </Select>

            <div className="pt-2 space-y-2 text-xs">
              {transactionType === 'rent' && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeCaution}
                    onChange={(e) => setIncludeCaution(e.target.checked)}
                    className="accent-[#2D5A3D]"
                  />
                  <span>Include Refundable Caution Deposit (10%)</span>
                </label>
              )}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeServiceCharge}
                  onChange={(e) => setIncludeServiceCharge(e.target.checked)}
                  className="accent-[#2D5A3D]"
                />
                <span>Include Estimated Estate Service Charge</span>
              </label>
            </div>
          </Card>

          {/* Results (Right 2/3) */}
          <div className="lg:col-span-2 space-y-6">
            <Card elevation="2" className="p-6 md:p-8 bg-white border border-[#D6C9A8] space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#EDE0C4]">
                <div>
                  <span className="text-xs font-bold text-[#5C5C5C] uppercase tracking-wider block">
                    Total Estimated Capital Required
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2D5A3D]">
                    {formatNGN(totalCost)}
                  </h2>
                </div>
                <span className="px-3 py-1 bg-[#F0F4EC] text-[#2D5A3D] border border-[#A8C192] rounded-full text-xs font-bold">
                  {selectedLGA} Council Guidelines
                </span>
              </div>

              {/* Itemized Breakdown Table */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
                  Itemized Fee Breakdown
                </h3>
                <div className="divide-y divide-[#EDE0C4] text-xs">
                  <div className="py-2.5 flex justify-between items-center">
                    <span className="font-semibold text-[#1A1A1A]">
                      Base {transactionType === 'rent' ? 'Annual Rent' : 'Purchase Price'}
                    </span>
                    <span className="font-bold text-[#1A1A1A]">{formatNGN(basePrice)}</span>
                  </div>

                  <div className="py-2.5 flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-[#1A1A1A] block">
                        Agency Commission ({transactionType === 'rent' ? '10%' : '5%'})
                      </span>
                      <span className="text-[11px] text-[#5C5C5C]">
                        Standard statutory agent facilitation
                      </span>
                    </div>
                    <span className="font-semibold text-[#1A1A1A]">{formatNGN(agencyFee)}</span>
                  </div>

                  <div className="py-2.5 flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-[#1A1A1A] block">
                        Legal Documentation Fee ({transactionType === 'rent' ? '5%' : '3%'})
                      </span>
                      <span className="text-[11px] text-[#5C5C5C]">
                        Tenancy agreement or deed of transfer execution
                      </span>
                    </div>
                    <span className="font-semibold text-[#1A1A1A]">{formatNGN(legalFee)}</span>
                  </div>

                  {stampDutyFee > 0 && (
                    <div className="py-2.5 flex justify-between items-center">
                      <div>
                        <span className="font-semibold text-[#1A1A1A] block">
                          FCT Stamp Duty &amp; Land Registration (1.5%)
                        </span>
                        <span className="text-[11px] text-[#5C5C5C]">
                          Payable to AGIS/FIRS on outright purchase
                        </span>
                      </div>
                      <span className="font-semibold text-[#1A1A1A]">{formatNGN(stampDutyFee)}</span>
                    </div>
                  )}

                  {cautionDeposit > 0 && (
                    <div className="py-2.5 flex justify-between items-center">
                      <div>
                        <span className="font-semibold text-[#1A1A1A] block">
                          Caution Deposit (Refundable)
                        </span>
                        <span className="text-[11px] text-[#5C5C5C]">
                          Held against potential damages upon exit
                        </span>
                      </div>
                      <span className="font-semibold text-[#1A1A1A]">{formatNGN(cautionDeposit)}</span>
                    </div>
                  )}

                  {estimatedServiceCharge > 0 && (
                    <div className="py-2.5 flex justify-between items-center">
                      <div>
                        <span className="font-semibold text-[#1A1A1A] block">
                          Estimated Annual Estate Service Charge
                        </span>
                        <span className="text-[11px] text-[#5C5C5C]">
                          Security guards, borehole maintenance, generator diesel pool
                        </span>
                      </div>
                      <span className="font-semibold text-[#1A1A1A]">{formatNGN(estimatedServiceCharge)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Banner */}
              <div className="p-4 bg-[#F5EDD6] rounded-2xl border border-[#D6C9A8] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#2D5A3D] text-white flex items-center justify-center shrink-0">
                    <HouseSimple size={22} weight="fill" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1A1A1A]">
                      Find matching properties under {formatNGN(basePrice, true)}
                    </h4>
                    <p className="text-[11px] text-[#5C5C5C]">
                      Explore verified Abuja properties currently listed in this range
                    </p>
                  </div>
                </div>

                <Link
                  href={`/dashboard/buyer/search?maxPrice=${basePrice}&lga=${selectedLGA}&transactionType=${transactionType}`}
                >
                  <Button variant="primary" size="md" rightIcon={<ArrowRight size={16} />}>
                    Search Properties
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: INCOME AFFORDABILITY ANALYZER */}
      {activeTab === 'affordability' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Inputs (Left 1/3) */}
          <Card elevation="1" className="lg:col-span-1 p-6 bg-white border border-[#D6C9A8] space-y-4">
            <h3 className="text-sm font-bold text-[#1A1A1A] pb-2 border-b border-[#EDE0C4]">
              Income &amp; Debt Commitments
            </h3>

            <div>
              <label className="text-xs font-bold text-[#1A1A1A] block mb-1.5">
                Income Frequency
              </label>
              <div className="grid grid-cols-2 gap-2 bg-[#F5EDD6] p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setIncomeType('monthly')
                    setIncomeAmount(800000)
                  }}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    incomeType === 'monthly'
                      ? 'bg-[#2D5A3D] text-white shadow-xs'
                      : 'text-[#5C5C5C] hover:text-[#1A1A1A]'
                  }`}
                >
                  Monthly Income
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIncomeType('annual')
                    setIncomeAmount(9600000)
                  }}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    incomeType === 'annual'
                      ? 'bg-[#2D5A3D] text-white shadow-xs'
                      : 'text-[#5C5C5C] hover:text-[#1A1A1A]'
                  }`}
                >
                  Annual Income
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#1A1A1A] block mb-1.5">
                Gross Income (NGN)
              </label>
              <Input
                type="number"
                value={incomeAmount.toString()}
                onChange={(e) => setIncomeAmount(Number(e.target.value))}
                placeholder="800000"
              />
              <span className="text-[11px] text-[#2D5A3D] font-bold block mt-1">
                {formatNGN(incomeAmount)} {incomeType === 'monthly' ? '/ month' : '/ year'}
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-[#1A1A1A] block mb-1.5">
                Monthly Debt / Loan Repayments (Optional)
              </label>
              <Input
                type="number"
                value={existingDebtMonthly.toString()}
                onChange={(e) => setExistingDebtMonthly(Number(e.target.value))}
                placeholder="0"
              />
            </div>
          </Card>

          {/* Results (Right 2/3) */}
          <div className="lg:col-span-2 space-y-6">
            <Card elevation="2" className="p-6 md:p-8 bg-white border border-[#D6C9A8] space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#EDE0C4]">
                <div>
                  <span className="text-xs font-bold text-[#5C5C5C] uppercase tracking-wider block">
                    Recommended Maximum Annual Rent (30% Rule)
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2D5A3D]">
                    {formatNGN(maxAnnualRent)} <span className="text-sm font-normal text-[#5C5C5C]">/ year ({formatNGN(maxMonthlyRent)}/mo)</span>
                  </h2>
                </div>
                <span className="px-3 py-1 bg-[#F0F4EC] text-[#2D6A4F] border border-[#A8D5BE] rounded-full text-xs font-bold">
                  Financially Safe
                </span>
              </div>

              {/* Key Metrics Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-[#F5EDD6] rounded-xl border border-[#D6C9A8] space-y-1">
                  <span className="text-xs font-bold text-[#5C5C5C] uppercase">
                    Annual Gross Income
                  </span>
                  <span className="text-lg font-extrabold text-[#1A1A1A] block">
                    {formatNGN(annualGross)}
                  </span>
                  <p className="text-[11px] text-[#5C5C5C]">
                    Calculated before debt deductions.
                  </p>
                </div>

                <div className="p-4 bg-[#FDF8EC] rounded-xl border border-[#F0CC77] space-y-1">
                  <span className="text-xs font-bold text-[#C9962A] uppercase">
                    Max Safe Purchase Power
                  </span>
                  <span className="text-lg font-extrabold text-[#1A1A1A] block">
                    {formatNGN(maxPurchasePrice)}
                  </span>
                  <p className="text-[11px] text-[#5C5C5C]">
                    Estimated outright acquisition borrowing capacity.
                  </p>
                </div>
              </div>

              {/* Recommended Abuja Districts */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
                  Recommended Abuja Districts Within Budget
                </h3>
                <p className="text-xs text-[#5C5C5C]">
                  Based on median residential rental prices in the FCT, you can comfortably live in:
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {suitableDistricts.map((district) => (
                    <Link
                      key={district}
                      href={`/dashboard/buyer/search?location=${encodeURIComponent(district)}&maxPrice=${maxAnnualRent}`}
                      className="px-3 py-1.5 bg-[#F0F4EC] text-[#2D5A3D] border border-[#A8C192] hover:bg-[#2D5A3D] hover:text-white rounded-xl text-xs font-bold transition-all"
                    >
                      {district} →
                    </Link>
                  ))}
                </div>
              </div>

              {/* Search CTA */}
              <div className="pt-2 flex justify-end">
                <Link href={`/dashboard/buyer/search?maxPrice=${maxAnnualRent}`}>
                  <Button variant="primary" size="lg" rightIcon={<ArrowRight size={18} />}>
                    Explore All Homes Under {formatNGN(maxAnnualRent, true)}
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
