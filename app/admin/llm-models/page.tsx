import { createClient } from '@/utils/supabase/server'
import ModelsTable from './llm-models-table'

export default async function AdminLlmModelsPage() {
  const supabase = await createClient()

  const [
    { data: models },
    { data: providers }
  ] = await Promise.all([
    supabase.from('llm_models').select('*').order('name', { ascending: true }),
    supabase.from('llm_providers').select('*')
  ]);

  return (
    <>
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage LLM Models</h1>
      </header>

      <main>
        <ModelsTable models={models || []} providers={providers || []} />
      </main>
    </>
  )
}
