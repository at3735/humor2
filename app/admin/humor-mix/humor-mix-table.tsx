'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import type { Database } from '@/types/supabase'

type HumorFlavorMix = Database['public']['Tables']['humor_flavor_mix']['Row'] & {
  humor_flavors: { slug: string } | null
}

export default function HumorMixTable({ mixes }: { mixes: HumorFlavorMix[] }) {
  const router = useRouter()
  const [captionCounts, setCaptionCounts] = useState<Record<number, number>>(
    mixes.reduce((acc, mix) => {
      acc[mix.id] = mix.caption_count
      return acc
    }, {} as Record<number, number>)
  )
  const [isSaving, setIsSaving] = useState<Record<number, boolean>>({})
  const [error, setError] = useState<string | null>(null)

  const handleCountChange = (id: number, value: string) => {
    const newCount = parseInt(value, 10)
    if (!isNaN(newCount)) {
      setCaptionCounts((prev) => ({ ...prev, [id]: newCount }))
    }
  }

  const handleSave = async (mix: HumorFlavorMix) => {
    setIsSaving((prev) => ({ ...prev, [mix.id]: true }))
    setError(null)

    const supabase = createClient()
    const { error: dbError } = await supabase
      .from('humor_flavor_mix')
      .update({ caption_count: captionCounts[mix.id] })
      .eq('id', mix.id)

    if (dbError) {
      setError(`Failed to update mix ${mix.id}: ${dbError.message}`)
    }

    setIsSaving((prev) => ({ ...prev, [mix.id]: false }))
    // Optionally, you can add a success message or just refresh
    router.refresh()
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm overflow-x-auto">
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Flavor</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Caption Count</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {mixes.map((mix) => (
            <tr key={mix.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{mix.humor_flavors?.slug ?? 'Unknown'}</td>
              <td className="px-6 py-4">
                <input
                  type="number"
                  value={captionCounts[mix.id] ?? 0}
                  onChange={(e) => handleCountChange(mix.id, e.target.value)}
                  className="w-24 p-2 border border-gray-300 rounded-md"
                />
              </td>
              <td className="px-6 py-4">
                <button
                  onClick={() => handleSave(mix)}
                  disabled={isSaving[mix.id]}
                  className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400"
                >
                  {isSaving[mix.id] ? 'Saving...' : 'Save'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}