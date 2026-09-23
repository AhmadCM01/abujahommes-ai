'use client'

import React, { useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card } from '@/components/ui/Card'
import { formatNGN } from '@/lib/utils'

const DATA_6M = [
  { month: 'Feb', AMAC: 2800000, Bwari: 1200000, Gwagwalada: 800000 },
  { month: 'Mar', AMAC: 2950000, Bwari: 1250000, Gwagwalada: 820000 },
  { month: 'Apr', AMAC: 3100000, Bwari: 1300000, Gwagwalada: 850000 },
  { month: 'May', AMAC: 3250000, Bwari: 1350000, Gwagwalada: 900000 },
  { month: 'Jun', AMAC: 3400000, Bwari: 1400000, Gwagwalada: 920000 },
  { month: 'Jul', AMAC: 3600000, Bwari: 1500000, Gwagwalada: 950000 },
]

export const PriceTrendChart: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'3M' | '6M' | '1Y'>('6M')

  return (
    <Card elevation="1" className="p-5 md:p-6 bg-white border border-[#D6C9A8]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="text-base font-bold text-[#1A1A1A]">
            Abuja Average Property Price Trends
          </h3>
          <p className="text-xs text-[#5C5C5C] mt-0.5">
            Quarterly average asking prices across key councils
          </p>
        </div>

        <div className="flex items-center gap-1 bg-[#F5EDD6] p-1 rounded-lg self-start">
          {(['3M', '6M', '1Y'] as ('3M' | '6M' | '1Y')[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                timeRange === range
                  ? 'bg-[#2D5A3D] text-white shadow-xs'
                  : 'text-[#5C5C5C] hover:text-[#1A1A1A]'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={DATA_6M}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorAMAC" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2D5A3D" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#2D5A3D" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorBwari" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C9962A" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#C9962A" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#EDE0C4" vertical={false} />
            <XAxis
              dataKey="month"
              stroke="#9A9A9A"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#9A9A9A"
              fontSize={11}
              tickFormatter={(val) => formatNGN(val, true)}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              formatter={(val: unknown) => [formatNGN(Number(val)), 'Avg Price']}
              contentStyle={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #D6C9A8',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                fontSize: '12px',
                fontWeight: 'bold',
              }}
            />
            <Area
              type="monotone"
              dataKey="AMAC"
              stroke="#2D5A3D"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorAMAC)"
              name="AMAC (Maitama/Wuse/Gwarinpa)"
            />
            <Area
              type="monotone"
              dataKey="Bwari"
              stroke="#C9962A"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorBwari)"
              name="Bwari (Kubwa/Dutse)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-[#EDE0C4] text-xs font-semibold">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#2D5A3D]" />
          <span>AMAC Council (High Demand)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#C9962A]" />
          <span>Bwari Council (Emerging Growth)</span>
        </div>
      </div>
    </Card>
  )
}
