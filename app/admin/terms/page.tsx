import { createClient } from '@/utils/supabase/server'
import TermsTable from './terms-table'

export default async function AdminTermsPage() {
  const supabase = await createClient()

  const [
    { data: terms },
    { data: termTypes }
  ] = await Promise.all([
    supabase.from('terms').select('*').order('priority', { ascending: false }),
    supabase.from('term_types').select('*')
  ]);

  return (
    <>
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Terms</h1>
      </header>

      <main>
        <TermsTable terms={terms || []} termTypes={termTypes || []} />
      </main>
    </>
  )
}
