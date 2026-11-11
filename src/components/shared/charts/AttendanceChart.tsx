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

export interface AttendanceChartProps {
  data: {
    month: string
    present: number
    absent: number
    late: number
  }[]
  className?: string
}

export function AttendanceChart({ data, className }: AttendanceChartProps) {
  return (
    <div className={className || 'w-full h-80'}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 0,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800" />
          <XAxis
            dataKey="month"
            tick={{ fill: 'currentColor' }}
            className="text-xs text-gray-600 dark:text-gray-400"
          />
          <YAxis
            tick={{ fill: 'currentColor' }}
            className="text-xs text-gray-600 dark:text-gray-400"
          />
          <Tooltip
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
            dataKey="present"
            name="Present"
            fill="#10b981"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="absent"
            name="Absent"
            fill="#ef4444"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="late"
            name="Late"
            fill="#f59e0b"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
