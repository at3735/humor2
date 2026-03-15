import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Database } from '@/types/supabase'

// --- DEVELOPER BACKDOOR ---
const DEVELOPER_EMAIL = 'at3735@columbia.edu'

// --- TYPE DEFINITIONS ---
type HumorFlavorWithSteps = Database['public']['Tables']['humor_flavors']['Row'] & {
  humor_flavor_steps: Database['public']['Tables']['humor_flavor_steps']['Row'][]
}

// --- PAGE ---

export default async function AdminHumorFlavorsPage() {
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
  const { data: humorFlavors } = await supabase
    .from('humor_flavors')
    .select(`
      *,
      humor_flavor_steps (
        *
      )
    `)
    .order('order_by', { referencedTable: 'humor_flavor_steps', ascending: true })

  // 3. Render the page
  return (
    <div className="p-4 md:p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Humor Flavors</h1>
        <Link href="/admin">
          <span className="text-blue-500 hover:underline">&larr; Back to Dashboard</span>
        </Link>
      </header>

      <main className="space-y-8">
        {(humorFlavors as HumorFlavorWithSteps[])?.map((flavor) => (
          <section key={flavor.id} className="p-4 bg-white rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold">{flavor.slug}</h2>
            <p className="text-sm text-gray-600 mb-4">{flavor.description}</p>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 table-fixed">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="w-1/12 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                    <th className="w-4/12 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="w-7/12 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">System Prompt</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {flavor.humor_flavor_steps.map((step) => (
                    <tr key={step.id}>
                      <td className="px-4 py-3 align-top text-sm font-bold">{step.order_by}</td>
                      <td className="px-4 py-3 align-top text-sm break-words">{step.description}</td>
                      {/* Use break-words to allow text to wrap to the next line */}
                      <td className="px-4 py-3 align-top text-sm text-gray-500 break-words" title={step.llm_system_prompt ?? ''}>
                        {step.llm_system_prompt}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </main>
    </div>
  )
}