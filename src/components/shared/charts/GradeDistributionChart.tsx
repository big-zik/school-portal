'use client'

import * as React from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

export interface GradeDistributionChartProps {
  data: {
    grade: string
    count: number
    color: string
  }[]
  className?: string
}

export function GradeDistributionChart({
  data,
  className,
}: GradeDistributionChartProps) {
  return (
    <div className={className || 'w-full h-80'}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip
            formatter={(value: any, name: any) => [`${value} students`, `Grade ${name}`]}
            contentStyle={{
              backgroundColor: 'var(--tooltip-bg, #111827)',
              borderColor: 'var(--tooltip-border, #374151)',
              borderRadius: '0.5rem',
              color: '#f9fafb',
              fontSize: '0.875rem',
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(val) => <span className="text-xs text-gray-700 dark:text-gray-300">Grade {val}</span>}
          />
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
            dataKey="count"
            nameKey="grade"
            label={({ grade, percent }: any) =>
              `${grade} (${((percent || 0) * 100).toFixed(0)}%)`
            }
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
