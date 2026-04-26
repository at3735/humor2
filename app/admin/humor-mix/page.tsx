import { createClient } from '@/utils/supabase/server'
import HumorMixTable from './humor-mix-table'

export default async function AdminHumorMixPage() {
  const supabase = await createClient()
  const { data: mixes } = await supabase
    .from('humor_flavor_mix')
    .select(`
      *,
      humor_flavors (
        slug
      )
    `)
    .order('created_datetime_utc', { ascending: false })

  return (
    <>
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Humor Flavor Mix</h1>
      </header>

      <main>
        <HumorMixTable mixes={mixes || []} />
      </main>
    </>
  )
}
