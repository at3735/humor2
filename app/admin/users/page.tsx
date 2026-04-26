import { createClient } from '@/utils/supabase/server'
import type { Database } from '@/types/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']

function renderValue(value: any) {
  if (value === null || value === undefined) {
    return <span className="text-gray-400">NULL</span>
  }
  if (typeof value === 'boolean') {
    const text = value ? 'True' : 'False'
    const bgColor = value ? 'bg-green-100' : 'bg-red-100'
    const textColor = value ? 'text-green-800' : 'text-red-800'
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${bgColor} ${textColor}`}>
        {text}
      </span>
    )
  }
  return String(value)
}

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_datetime_utc', { ascending: false })

  return (
    <>
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Users</h1>
      </header>

      <main>
        <div className="bg-white p-4 rounded-lg shadow-sm overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">First Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Is Superadmin</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(profiles as Profile[])?.map((p) => (
                <tr key={p.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{renderValue(p.id)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{renderValue(p.first_name)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{renderValue(p.last_name)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{renderValue(p.email)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{renderValue(p.is_superadmin)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  )
}
