import { createClient } from '@/utils/supabase/server'
import type { Database } from '@/types/supabase'

type CaptionRequest = Database['public']['Tables']['caption_requests']['Row'] & {
  profiles: { email: string | null } | null
  images: { url: string | null } | null
}

export default async function AdminCaptionRequestsPage() {
  const supabase = await createClient()
  const { data: captionRequests } = await supabase
    .from('caption_requests')
    .select(`
      *,
      profiles!caption_requests_profile_id_fkey ( email ),
      images ( url )
    `)
    .order('created_datetime_utc', { ascending: false })
    .limit(200)

  return (
    <>
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Caption Requests</h1>
      </header>

      <main>
        <div className="bg-white p-4 rounded-lg shadow-sm overflow-x-auto">
          <p className="text-sm text-gray-500 mb-4">
            Showing the 200 most recent caption requests.
          </p>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(captionRequests as CaptionRequest[])?.map((req) => (
                <tr key={req.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{req.profiles?.email ?? 'Unknown User'}</td>
                  <td className="px-6 py-4">
                    {req.images?.url && <img src={req.images.url} alt="Caption request" className="h-16 w-16 object-cover rounded"/>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(req.created_datetime_utc).toLocaleString()}
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
