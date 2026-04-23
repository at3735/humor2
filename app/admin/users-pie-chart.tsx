'use client'

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { Database } from '@/types/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']

const COLORS = {
  'columbia.edu': '#60A5FA', // blue-400
  'barnard.edu': '#d5245f',
  'other': '#9CA3AF',      // gray-400
}

export default function UsersPieChart({ profiles }: { profiles: Profile[] }) {
  const data = [
    { name: 'Columbia', value: 0 },
    { name: 'Barnard', value: 0 },
    { name: 'Other', value: 0 },
  ]

  profiles.forEach(p => {
    if (p.email?.endsWith('@columbia.edu')) {
      data[0].value += 1
    } else if (p.email?.endsWith('@barnard.edu')) {
      data[1].value += 1
    } else {
      data[2].value += 1
    }
  })

  const chartColors = [COLORS['columbia.edu'], COLORS['barnard.edu'], COLORS['other']];

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow h-full flex flex-col">
      <h3 className="text-sm font-medium text-gray-500">Total Users by School</h3>
      <div className="flex-grow w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={(entry) => `${entry.name}: ${entry.value}`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
