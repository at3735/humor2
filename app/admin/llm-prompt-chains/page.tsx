import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Database } from '@/types/supabase'

// --- DEVELOPER BACKDOOR ---
const DEVELOPER_EMAIL = 'at3735@columbia.edu'

type PromptChain = Database['public']['Tables']['llm_prompt_chains']['Row']

// --- PAGE ---

export default async function AdminLlmPromptChainsPage() {
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
  const { data: chains } = await supabase
    .from('llm_prompt_chains')
    .select('*')
    .order('created_datetime_utc', { ascending: false })
    .limit(200);

  // 3. Render the page
  return (
    <div className="p-4 md:p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">LLM Prompt Chains</h1>
        <Link href="/admin">
          <span className="text-blue-500 hover:underline">&larr; Back to Dashboard</span>
        </Link>
      </header>

      <main>
        <div className="bg-white p-4 rounded-lg shadow-sm overflow-x-auto">
          <p className="text-sm text-gray-500 mb-4">
            Showing the 200 most recent prompt chains.
          </p>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chain ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Caption Request ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(chains as PromptChain[])?.map((chain) => (
                <tr key={chain.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{chain.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{chain.caption_request_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(chain.created_datetime_utc).toLocaleString()}
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