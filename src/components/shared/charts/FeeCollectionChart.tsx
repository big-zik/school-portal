'use client'

import * as React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

export interface FeeCollectionChartProps {
  data: {
    category: string
    collected: number
    outstanding: number
  }[]
  className?: string
}

function formatNairaShorthand(val: number): string {
  if (val >= 1_000_000) {
    return `₦${(val / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  }
  if (val >= 1_000) {
    return `₦${(val / 1_000).toFixed(1).replace(/\.0$/, '')}k`
  }
  return `₦${val}`
}

export function FeeCollectionChart({ data, className }: FeeCollectionChartProps) {
  return (
    <div className={className || 'w-full h-80'}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800" />
          <XAxis
            dataKey="category"
            tick={{ fill: 'currentColor' }}
            className="text-xs text-gray-600 dark:text-gray-400"
          />
          <YAxis
            tickFormatter={formatNairaShorthand}
            tick={{ fill: 'currentColor' }}
            className="text-xs text-gray-600 dark:text-gray-400"
          />
          <Tooltip
            formatter={(value: any) => [
              formatNairaShorthand(Number(value) || 0),
            ]}
            contentStyle={{
              backgroundColor: 'var(--tooltip-bg, #111827)',
              borderColor: 'var(--tooltip-border, #374151)',
              borderRadius: '0.5rem',
              color: '#f9fafb',
              fontSize: '0.875rem',
            }}
          />
          <Legend
            wrapperStyle={{
              paddingTop: '10px',
              fontSize: '0.875rem',
            }}
          />
          <Bar
            dataKey="collected"
            name="Collected"
            stackId="feeStack"
            fill="#3b82f6"
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="outstanding"
            name="Outstanding"
            stackId="feeStack"
            fill="#f97316"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
