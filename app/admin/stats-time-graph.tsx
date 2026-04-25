'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface TimeGraphProps {
  data: { date: string; count: number }[]
  totalCount: number
  title: string
  lineColor: string
}

export default function StatsTimeGraph({ data, totalCount, title, lineColor }: TimeGraphProps) {
  // Aggregate data by month
  const monthlyData = data.reduce((acc, item) => {
    const month = new Date(item.date).toISOString().slice(0, 7) // YYYY-MM
    if (!acc[month]) {
      acc[month] = 0
    }
    acc[month] += 1
    return acc
  }, {} as Record<string, number>)

  const chartData = Object.keys(monthlyData).map(month => {
    return {
      date: month,
      count: monthlyData[month]
    }
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Create a cumulative count
  let cumulativeCount = 0;
  const cumulativeChartData = chartData.map(item => {
    cumulativeCount += item.count;
    return { ...item, count: cumulativeCount };
  });

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow h-80">
      <h3 className="text-lg font-medium text-gray-500">{title}</h3>
      <p className="mt-1 text-3xl font-semibold text-gray-900">{totalCount}</p>
      <div className="w-full mt-4" style={{ height: '200px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={cumulativeChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="count" stroke={lineColor} activeDot={{ r: 8 }} name="Total over time" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
