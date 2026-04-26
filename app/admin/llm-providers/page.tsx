import { createClient } from '@/utils/supabase/server'
import ProvidersTable from './llm-providers-table'

export default async function AdminLlmProvidersPage() {
  const supabase = await createClient()
  const { data: providers } = await supabase
    .from('llm_providers')
    .select('*')
    .order('name', { ascending: true });

  return (
    <>
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage LLM Providers</h1>
      </header>

      <main>
        <ProvidersTable providers={providers || []} />
      </main>
    </>
  )
}
