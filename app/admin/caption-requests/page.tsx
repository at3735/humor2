import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Database } from '@/types/supabase'

// --- DEVELOPER BACKDOOR ---
const DEVELOPER_EMAIL = 'at3735@columbia.edu'

// --- TYPE DEFINITIONS ---
type CaptionRequest = Database['public']['Tables']['caption_requests']['Row'] & {
  profiles: { email: string | null } | null
  images: { url: string | null } | null
}

// --- PAGE ---

export default async function AdminCaptionRequestsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 1. Authorization checks
  if (!user) return redirect('/')
  const isDeveloper = user.email === DEVELOPER_EMAIL
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('is_superadmin')
    .eq('id', user.id)
    .single()
  const isSuperAdmin = userProfile?.is_superadmin === true
  if (!isDeveloper && !isSuperAdmin) {
    return (
      <div className="p-4 text-center">
        <h1 className="text-xl font-bold">Access Denied</h1>
        <p>You are not authorized to view this page.</p>
      </div>
    )
  }

  // 2. Fetch data: Get all caption requests and their related profile/image data
  const { data: captionRequests } = await supabase
    .from('caption_requests')
    .select(`
      *,
      profiles ( email ),
      images ( url )
    `)
    .order('created_datetime_utc', { ascending: false })
    .limit(200)

  // 3. Render the page
  return (
    <div className="p-4 md:p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Caption Requests</h1>
        <Link href="/admin">
          <span className="px-4 py-2 rounded-md bg-[#d5245f] text-[#eee5e0]">&larr; Back to Dashboard</span>
        </Link>
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
    </div>
  )
}
