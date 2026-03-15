import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import TermsTable from './terms-table'

// --- DEVELOPER BACKDOOR ---
const DEVELOPER_EMAIL = 'at3735@columbia.edu'

// --- PAGE ---

export default async function AdminTermsPage() {
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

  // 2. Fetch data on the server
  const [
    { data: terms },
    { data: termTypes }
  ] = await Promise.all([
    supabase.from('terms').select('*').order('priority', { ascending: false }),
    supabase.from('term_types').select('*')
  ]);

  // 3. Render the page, passing the data to the client component
  return (
    <div className="p-4 md:p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Terms</h1>
        <Link href="/admin">
          <span className="text-blue-500 hover:underline">&larr; Back to Dashboard</span>
        </Link>
      </header>

      <main>
        <TermsTable terms={terms || []} termTypes={termTypes || []} />
      </main>
    </div>
  )
}