import { createClient } from '@/utils/supabase/server'
import type { Database } from '@/types/supabase'

type HumorFlavorWithSteps = Database['public']['Tables']['humor_flavors']['Row'] & {
  humor_flavor_steps: Database['public']['Tables']['humor_flavor_steps']['Row'][]
}

export default async function AdminHumorFlavorsPage() {
  const supabase = await createClient()
  const { data: humorFlavors } = await supabase
    .from('humor_flavors')
    .select(`
      *,
      humor_flavor_steps (
        *
      )
    `)
    .order('order_by', { referencedTable: 'humor_flavor_steps', ascending: true })

  return (
    <>
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Humor Flavors</h1>
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
    </>
  )
}
