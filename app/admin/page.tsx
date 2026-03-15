import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

// --- DEVELOPER BACKDOOR ---
const DEVELOPER_EMAIL = 'at3735@columbia.edu'

// --- UI COMPONENTS ---

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
    </div>
  )
}

function NavLink({ href, title, description }: { href: string; title: string; description: string }) {
  return (
    <Link href={href}>
      <div className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full">
        <h3 className="font-bold text-lg text-blue-600">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </Link>
  )
}

// --- PAGE ---

export default async function Admin() {
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
        <a href="/" className="mt-4 inline-block text-blue-500 hover:underline">
          Return to Home
        </a>
      </div>
    )
  }

  // 2. Fetch statistics
  const [
    { count: totalUsers },
    { count: totalImages },
    { count: totalCaptions },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('images').select('*', { count: 'exact', head: true }),
    supabase.from('captions').select('*', { count: 'exact', head: true }),
  ])

  // 3. Render the dashboard
  return (
    <div className="p-4 md:p-8 space-y-10">
      <header>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome, {user.email}!</p>
        {isDeveloper && !isSuperAdmin && (
          <p className="mt-2 text-yellow-600 bg-yellow-100 p-2 rounded-md">
            Note: Accessing via developer backdoor.
          </p>
        )}
      </header>

      <section>
        <h2 className="text-xl font-semibold">Overall Statistics</h2>
        <div className="grid grid-cols-1 gap-4 mt-4 sm:grid-cols-3">
          <StatCard title="Total Users" value={totalUsers ?? 0} />
          <StatCard title="Total Images" value={totalImages ?? 0} />
          <StatCard title="Total Captions" value={totalCaptions ?? 0} />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Management Sections</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
          <NavLink href="/admin/users" title="1. READ Users" description="View a list of all user profiles." />
          <NavLink href="/admin/images" title="2. CRUD Images" description="Create, read, update, and delete images." />
          <NavLink href="/admin/captions" title="3. READ Captions" description="View a list of all captions." />
          <NavLink href="/admin/humor-flavors" title="4. READ Humor Flavors" description="View humor flavors and their steps." />
          <NavLink href="/admin/humor-mix" title="5. R/U Humor Mix" description="Read and update humor flavor mixes." />
          <NavLink href="/admin/terms" title="6. CRUD Terms" description="Create, read, update, and delete terms." />
          <NavLink href="/admin/caption-requests" title="7. READ Caption Requests" description="View caption requests from users." />
          <NavLink href="/admin/caption-examples" title="8. CRUD Caption Examples" description="Manage caption examples." />
          <NavLink href="/admin/llm-models" title="9. CRUD LLM Models" description="Manage LLM models." />
          <NavLink href="/admin/llm-providers" title="10. CRUD LLM Providers" description="Manage LLM providers." />
          <NavLink href="/admin/llm-prompt-chains" title="11. READ Prompt Chains" description="View LLM prompt chains." />
          <NavLink href="/admin/llm-model-responses" title="12. READ Model Responses" description="View LLM model responses." />
          <NavLink href="/admin/allowed-signup-domains" title="13. CRUD Signup Domains" description="Manage allowed signup domains." />
          <NavLink href="/admin/whitelist-email-addresses" title="14. CRUD Whitelisted Emails" description="Manage whitelisted email addresses." />
        </div>
      </section>
    </div>
  )
}