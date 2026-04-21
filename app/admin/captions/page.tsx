import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Database } from '@/types/supabase'

// --- DEVELOPER BACKDOOR ---
const DEVELOPER_EMAIL = 'at3735@columbia.edu'

// --- TYPE DEFINITIONS ---
type Caption = Database['public']['Tables']['captions']['Row']

// --- PAGE ---

export default async function AdminCaptionsPage() {
  const supabase = await createClient()

  // Use the more secure `getUser()` method on the server
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

  // 2. Fetch data, explicitly limiting to the most recent 200
  const { data: captions } = await supabase
    .from('captions')
    .select('*')
    .order('created_datetime_utc', { ascending: false })
    .limit(200)

  // 3. Render the page
  return (
    <div className="p-4 md:p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Captions</h1>
        <Link href="/admin">
          <span className="px-4 py-2 rounded-md bg-[#d5245f] text-[#eee5e0]">&larr; Back to Dashboard</span>
        </Link>
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
                    {/* Add fallback text for empty content */}
                    {cap.content || <span className="text-gray-400">[No Content]</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cap.profile_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {/* Ensure created_datetime_utc is not null before creating a Date */}
                    {cap.created_datetime_utc ? new Date(cap.created_datetime_utc).toLocaleDateString() : ''}
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
