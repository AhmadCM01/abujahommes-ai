'use client'

import React, { useState } from 'react'
import { Database, ArrowsClockwise, CheckCircle, Cpu } from '@phosphor-icons/react'
import { Card, Button, Badge } from '@/components/ui'
import { useToast } from '@/components/ui/Toast'

export default function AdminDataManagementPage() {
  const { addToast } = useToast()
  const [isSyncing, setIsSyncing] = useState(false)

  const handleTriggerSync = () => {
    setIsSyncing(true)
    setTimeout(() => {
      setIsSyncing(false)
      addToast({
        title: 'Data Ingestion & ML Pipeline Triggered',
        message: 'Successfully parsed and normalized 140 new Abuja real estate records.',
        type: 'success',
      })
    }, 1200)
  }

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1A1A1A] tracking-tight">
            Data Pipelines &amp; ML Model Registry
          </h1>
          <p className="text-xs text-[#5C5C5C] mt-0.5">
            Manage scraped data feeds from PropertyPro, Jiji, and Nigerian Property Centre
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          isLoading={isSyncing}
          onClick={handleTriggerSync}
          leftIcon={<ArrowsClockwise size={16} />}
        >
          Trigger Data Ingestion &amp; Train
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card elevation="1" className="p-5 bg-white border border-[#D6C9A8] space-y-2">
          <span className="text-xs font-bold text-[#5C5C5C] uppercase">PropertyPro Scraper Feed</span>
          <div className="text-2xl font-bold text-[#1A1A1A]">2,410 Records</div>
          <span className="text-xs font-semibold text-[#2D6A4F] block">✓ Synced 1 hour ago</span>
        </Card>

        <Card elevation="1" className="p-5 bg-white border border-[#D6C9A8] space-y-2">
          <span className="text-xs font-bold text-[#5C5C5C] uppercase">Jiji Abuja Feed</span>
          <div className="text-2xl font-bold text-[#1A1A1A]">1,890 Records</div>
          <span className="text-xs font-semibold text-[#2D6A4F] block">✓ Synced 3 hours ago</span>
        </Card>

        <Card elevation="1" className="p-5 bg-white border border-[#D6C9A8] space-y-2">
          <span className="text-xs font-bold text-[#5C5C5C] uppercase">Nigerian Property Centre</span>
          <div className="text-2xl font-bold text-[#1A1A1A]">1,520 Records</div>
          <span className="text-xs font-semibold text-[#2D6A4F] block">✓ Synced 5 hours ago</span>
        </Card>
      </div>

      {/* Model Version Registry */}
      <Card elevation="1" className="p-6 bg-white border border-[#D6C9A8] space-y-4">
        <div className="flex items-center gap-2">
          <Cpu size={20} className="text-[#2D5A3D]" weight="fill" />
          <h3 className="text-sm font-bold text-[#1A1A1A]">
            Active Production ML Model Versions
          </h3>
        </div>

        <div className="space-y-3">
          <div className="p-4 bg-[#F0F4EC] rounded-xl border border-[#A8C192] flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#2D5A3D]">abujahommes-reg-v2.1</span>
                <Badge variant="success">Active Production</Badge>
              </div>
              <p className="text-xs text-[#5C5C5C] mt-1">
                Trained on 4,820 verified Abuja records (MAE: 6.2%, R² Score: 0.94)
              </p>
            </div>
            <span className="text-xs text-[#2D5A3D] font-mono font-bold">Port 8000 (Render)</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
