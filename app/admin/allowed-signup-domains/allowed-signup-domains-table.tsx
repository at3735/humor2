'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import type { Database } from '@/types/supabase'

type Domain = Database['public']['Tables']['allowed_signup_domains']['Row']

function DomainForm({ domain, onSave, onCancel, isSaving }: {
  domain: Partial<Domain> | null,
  onSave: (domain: Partial<Domain>) => void,
  onCancel: () => void,
  isSaving: boolean
}) {
  const [apexDomain, setApexDomain] = useState(domain?.apex_domain || '')

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{domain?.id ? 'Edit Domain' : 'Create New Domain'}</h2>
        <input value={apexDomain} onChange={(e) => setApexDomain(e.target.value)} placeholder="e.g., columbia.edu" className="w-full p-2 border rounded" />
        <div className="mt-6 flex justify-end gap-4">
          <button onClick={onCancel} className="py-2 px-4 rounded bg-gray-200 hover:bg-gray-300" disabled={isSaving}>Cancel</button>
          <button onClick={() => onSave({ ...domain, apex_domain: apexDomain })} className="py-2 px-4 rounded bg-green-500 text-white hover:bg-green-600 disabled:bg-gray-400" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function DomainsTable({ domains }: { domains: Domain[] }) {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDomain, setEditingDomain] = useState<Partial<Domain> | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async (domainData: Partial<Domain>) => {
    setIsSaving(true)
    const supabase = createClient()
    const { error } = editingDomain?.id
      ? await supabase.from('allowed_signup_domains').update(domainData).eq('id', editingDomain.id)
      : await supabase.from('allowed_signup_domains').insert(domainData)

    if (!error) {
      setIsModalOpen(false)
      setEditingDomain(null)
      router.refresh()
    }
    setIsSaving(false)
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this domain?')) return
    const supabase = createClient()
    await supabase.from('allowed_signup_domains').delete().eq('id', id)
    router.refresh()
  }

  return (
    <>
      <div className="mb-4">
        <button onClick={() => { setEditingDomain({}); setIsModalOpen(true); }} className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
          Create New Domain
        </button>
      </div>

      {isModalOpen && (
        <DomainForm
          domain={editingDomain}
          onSave={handleSave}
          onCancel={() => { setIsModalOpen(false); setEditingDomain(null); }}
          isSaving={isSaving}
        />
      )}

      <div className="bg-white p-4 rounded-lg shadow-sm overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Apex Domain</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {domains.map(domain => (
              <tr key={domain.id}>
                <td className="px-6 py-4 font-medium">{domain.apex_domain}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button onClick={() => { setEditingDomain(domain); setIsModalOpen(true); }} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                  <button onClick={() => handleDelete(domain.id)} className="ml-4 text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}