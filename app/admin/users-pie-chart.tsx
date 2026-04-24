'use client'

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface UserProfile {
  email: string | null
}

const COLORS = {
  'columbia.edu': '#60A5FA', // blue-400
  'barnard.edu': '#d5245f',
  'other': '#9CA3AF',      // gray-400
}

export default function UsersPieChart({ profiles, totalCount }: { profiles: UserProfile[], totalCount: number }) {
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
    <div className="p-4 bg-gray-100 rounded-lg shadow h-80 flex flex-col min-h-0">
      <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
      <p className="mt-1 text-3xl font-semibold text-gray-900">{totalCount}</p>
      <div className="flex-1 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={60}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
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
