import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Database } from '@/types/supabase'

// --- DEVELOPER BACKDOOR ---
const DEVELOPER_EMAIL = 'at3735@columbia.edu'

type ModelResponse = Database['public']['Tables']['llm_model_responses']['Row'] & {
  profiles: { email: string | null } | null
  llm_models: { name: string | null } | null
}

// --- PAGE ---

export default async function AdminLlmModelResponsesPage() {
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

  // 2. Fetch data
  const { data: responses } = await supabase
    .from('llm_model_responses')
    .select(`
      *,
      profiles!llm_model_responses_profile_id_fkey ( email ),
      llm_models ( name )
    `)
    .order('created_datetime_utc', { ascending: false })
    .limit(100);

  // 3. Render the page
  return (
    <div className="p-4 md:p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">LLM Model Responses</h1>
        <Link href="/admin">
          <span className="px-4 py-2 rounded-md bg-[#d5245f] text-[#eee5e0]">&larr; Back to Dashboard</span>
        </Link>
      </header>

      <main>
        <div className="bg-white p-4 rounded-lg shadow-sm overflow-x-auto">
          <p className="text-sm text-gray-500 mb-4">
            Showing the 100 most recent model responses.
          </p>
          <table className="min-w-full divide-y divide-gray-200 table-fixed">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-4/12 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Response</th>
                <th className="w-2/12 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Model</th>
                <th className="w-2/12 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="w-4/12 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">User Prompt</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(responses as ModelResponse[])?.map((res) => (
                <tr key={res.id}>
                  <td className="px-4 py-3 align-top text-sm text-gray-500 break-words">{res.llm_model_response}</td>
                  <td className="px-4 py-3 align-top text-sm">{res.llm_models?.name ?? 'Unknown'}</td>
                  <td className="px-4 py-3 align-top text-sm">{res.profiles?.email ?? 'Unknown'}</td>
                  <td className="px-4 py-3 align-top text-sm text-gray-500 break-words">{res.llm_user_prompt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
