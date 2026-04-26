import { createClient } from '@/utils/supabase/server'
import ImagesTable from './images-table'

export default async function AdminImagesPage() {
  const supabase = await createClient()
  const { data: images } = await supabase
    .from('images')
    .select('*')
    .order('created_datetime_utc', { ascending: false })

  return (
    <>
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Images</h1>
      </header>

      <main>
        <ImagesTable images={images || []} />
      </main>
    </>
  )
}
