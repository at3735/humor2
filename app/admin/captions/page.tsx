import { createClient } from '@/utils/supabase/server'
import type { Database } from '@/types/supabase'

type Caption = Database['public']['Tables']['captions']['Row']

export default async function AdminCaptionsPage() {
  const supabase = await createClient()
  const { data: captions } = await supabase
    .from('captions')
    .select('*')
    .order('created_datetime_utc', { ascending: false })
    .limit(200)

  return (
    <>
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Captions</h1>
      </header>

      <main>
        <div className="bg-white p-4 rounded-lg shadow-sm overflow-x-auto">
          <p className="text-sm text-gray-500 mb-4">
            Showing the 200 most recent captions.
          </p>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Content</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profile ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(captions as Caption[])?.map((cap) => (
                <tr key={cap.id}>
                  <td className="px-6 py-4 text-sm">
                    {cap.content || <span className="text-gray-400">[No Content]</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cap.profile_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {cap.created_datetime_utc ? new Date(cap.created_datetime_utc).toLocaleDateString() : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  )
}
