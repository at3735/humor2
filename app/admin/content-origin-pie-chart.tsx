'use client'

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface CaptionOrigin {
  profile_id: string
  profiles: {
    is_superadmin: boolean
  } | null
}

interface ContentOriginPieChartProps {
  captions: CaptionOrigin[]
}

const COLORS = {
  superadmin: '#d5245f',
  user: '#60A5FA',
}

export default function ContentOriginPieChart({ captions }: ContentOriginPieChartProps) {
  const data = [
    { name: 'Superadmin', value: 0 },
    { name: 'User', value: 0 },
  ]

  captions.forEach(caption => {
    if (caption.profiles?.is_superadmin) {
      data[0].value += 1
    } else {
      data[1].value += 1
    }
  })

  const chartColors = [COLORS.superadmin, COLORS.user];

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow h-80 flex flex-col min-h-0">
      <h3 className="text-lg font-medium text-gray-500">Content Origin</h3>
      <p className="mt-1 text-3xl font-semibold text-gray-900">{captions.length}</p>
      <div className="flex-1 w-full mt-4">
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
