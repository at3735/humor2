'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function CaptionsRatedCard() {
  const [timeframe, setTimeframe] = useState('24h')
  const [count, setCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRatedCount = async () => {
      setLoading(true)
      const supabase = createClient()
      let fromDate: Date | null = null

      switch (timeframe) {
        case '24h':
          fromDate = new Date(Date.now() - 24 * 60 * 60 * 1000)
          break
        case '7d':
          fromDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          break
        case '30d':
          fromDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          break
        case 'all':
          // No date filter for all time
          break
      }

      let query = supabase.from('caption_votes').select('*', { count: 'exact', head: true })

      if (fromDate) {
        query = query.gte('created_datetime_utc', fromDate.toISOString())
      }

      const { count } = await query
      setCount(count)
      setLoading(false)
    }

    fetchRatedCount()
  }, [timeframe])

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow h-80 flex flex-col">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-500">Captions Rated</h3>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="p-1 rounded-md border-gray-300"
        >
          <option value="24h">24 hours</option>
          <option value="7d">7 days</option>
          <option value="30d">30 days</option>
          <option value="all">All time</option>
        </select>
      </div>
      <div className="flex-grow flex justify-center items-center">
        {loading ? (
          <div className="w-12 h-12 border-4 border-t-4 border-gray-200 border-t-[#d5245f] rounded-full animate-spin"></div>
        ) : (
          <p className="text-5xl font-semibold text-gray-900">{count}</p>
        )}
      </div>
    </div>
  )
}
