'use client'

import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Card } from '@/components/ui/Card'
import { formatNGN } from '@/lib/utils'

const LGA_DATA = [
  { lga: 'Maitama', median: 6500000, status: 'above' },
  { lga: 'Wuse 2', median: 5500000, status: 'above' },
  { lga: 'Guzape', median: 4200000, status: 'above' },
  { lga: 'Gwarinpa', median: 2400000, status: 'within' },
  { lga: 'Lokogoma', median: 1200000, status: 'within' },
  { lga: 'Lugbe', median: 850000, status: 'within' },
  { lga: 'Kubwa', median: 950000, status: 'within' },
]

export const LGAComparisonChart: React.FC<{ userBudget?: number }> = ({
  userBudget = 2500000,
}) => {
  return (
    <Card elevation="1" className="p-5 md:p-6 bg-white border border-[#D6C9A8]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-base font-bold text-[#1A1A1A]">
            Budget vs District Medians
          </h3>
          <p className="text-xs text-[#5C5C5C] mt-0.5">
            Your target budget of {formatNGN(userBudget)} compared across districts
          </p>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={LGA_DATA}
            layout="vertical"
            margin={{ top: 10, right: 20, left: 20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#EDE0C4" horizontal={false} />
            <XAxis
              type="number"
              stroke="#9A9A9A"
              fontSize={11}
              tickFormatter={(val) => formatNGN(val, true)}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              type="category"
              dataKey="lga"
              stroke="#1A1A1A"
              fontSize={12}
              fontWeight="bold"
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              formatter={(val: unknown) => [formatNGN(Number(val)), 'Median Rent']}
              contentStyle={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #D6C9A8',
                fontSize: '12px',
                fontWeight: 'bold',
              }}
            />
            <Bar dataKey="median" radius={[0, 6, 6, 0]}>
              {LGA_DATA.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.median <= userBudget ? '#2D6A4F' : '#C9962A'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-6 mt-3 pt-3 border-t border-[#EDE0C4] text-xs font-semibold">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#2D6A4F]" />
          <span>Within your budget</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#C9962A]" />
          <span>Above budget target</span>
        </div>
      </div>
    </Card>
  )
}
