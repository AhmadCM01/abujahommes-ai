'use client'

import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card } from '@/components/ui/Card'

const PERFORMANCE_DATA = [
  { day: 'Day 1', 'Maitama 4-Bed': 24, 'Wuse 3-Bed': 18, 'Gwarinpa Terrace': 32 },
  { day: 'Day 5', 'Maitama 4-Bed': 42, 'Wuse 3-Bed': 35, 'Gwarinpa Terrace': 60 },
  { day: 'Day 10', 'Maitama 4-Bed': 80, 'Wuse 3-Bed': 70, 'Gwarinpa Terrace': 110 },
  { day: 'Day 15', 'Maitama 4-Bed': 130, 'Wuse 3-Bed': 120, 'Gwarinpa Terrace': 180 },
  { day: 'Day 20', 'Maitama 4-Bed': 190, 'Wuse 3-Bed': 165, 'Gwarinpa Terrace': 240 },
  { day: 'Day 25', 'Maitama 4-Bed': 240, 'Wuse 3-Bed': 210, 'Gwarinpa Terrace': 310 },
  { day: 'Day 30', 'Maitama 4-Bed': 320, 'Wuse 3-Bed': 280, 'Gwarinpa Terrace': 420 },
]

export const ListingPerformanceChart: React.FC = () => {
  return (
    <Card elevation="1" className="p-5 md:p-6 bg-white border border-[#D6C9A8]">
      <div className="mb-4">
        <h3 className="text-base font-bold text-[#1A1A1A]">
          30-Day Listing Views Over Time
        </h3>
        <p className="text-xs text-[#5C5C5C] mt-0.5">
          Cumulative traffic and view growth per active listing
        </p>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={PERFORMANCE_DATA}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#EDE0C4" vertical={false} />
            <XAxis dataKey="day" stroke="#9A9A9A" fontSize={11} tickLine={false} />
            <YAxis stroke="#9A9A9A" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #D6C9A8',
                fontSize: '12px',
                fontWeight: 'bold',
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
            />
            <Line
              type="monotone"
              dataKey="Gwarinpa Terrace"
              stroke="#2D5A3D"
              strokeWidth={3}
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="Maitama 4-Bed"
              stroke="#C9962A"
              strokeWidth={3}
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="Wuse 3-Bed"
              stroke="#1D4ED8"
              strokeWidth={2}
              dot={{ r: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
