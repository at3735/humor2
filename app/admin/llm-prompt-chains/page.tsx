import { createClient } from '@/utils/supabase/server'
import type { Database } from '@/types/supabase'

type PromptChain = Database['public']['Tables']['llm_prompt_chains']['Row']

export default async function AdminLlmPromptChainsPage() {
  const supabase = await createClient()
  const { data: chains } = await supabase
    .from('llm_prompt_chains')
    .select('*')
    .order('created_datetime_utc', { ascending: false })
    .limit(200);

  return (
    <>
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">LLM Prompt Chains</h1>
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
    </>
  )
}
