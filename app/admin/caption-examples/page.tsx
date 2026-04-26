import { createClient } from '@/utils/supabase/server'
import ExamplesTable from './caption-examples-table'

export default async function AdminCaptionExamplesPage() {
  const supabase = await createClient()
  const { data: examples } = await supabase
    .from('caption_examples')
    .select('*')
    .order('priority', { ascending: false });

  return (
    <>
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Caption Examples</h1>
      </header>

      <main>
        <ExamplesTable examples={examples || []} />
      </main>
    </>
  )
}
