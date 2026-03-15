'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import type { Database } from '@/types/supabase'

type Provider = Database['public']['Tables']['llm_providers']['Row']

function ProviderForm({ provider, onSave, onCancel, isSaving }: {
  provider: Partial<Provider> | null,
  onSave: (provider: Partial<Provider>) => void,
  onCancel: () => void,
  isSaving: boolean
}) {
  const [name, setName] = useState(provider?.name || '')

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{provider?.id ? 'Edit Provider' : 'Create New Provider'}</h2>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Provider Name" className="w-full p-2 border rounded" />
        <div className="mt-6 flex justify-end gap-4">
          <button onClick={onCancel} className="py-2 px-4 rounded bg-gray-200 hover:bg-gray-300" disabled={isSaving}>Cancel</button>
          <button onClick={() => onSave({ ...provider, name })} className="py-2 px-4 rounded bg-green-500 text-white hover:bg-green-600 disabled:bg-gray-400" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ProvidersTable({ providers }: { providers: Provider[] }) {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProvider, setEditingProvider] = useState<Partial<Provider> | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async (providerData: Partial<Provider>) => {
    setIsSaving(true)
    const supabase = createClient()
    const { error } = editingProvider?.id
      ? await supabase.from('llm_providers').update(providerData).eq('id', editingProvider.id)
      : await supabase.from('llm_providers').insert(providerData)

    if (!error) {
      setIsModalOpen(false)
      setEditingProvider(null)
      router.refresh()
    }
    setIsSaving(false)
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this provider?')) return
    const supabase = createClient()
    await supabase.from('llm_providers').delete().eq('id', id)
    router.refresh()
  }

  return (
    <>
      <div className="mb-4">
        <button onClick={() => { setEditingProvider({}); setIsModalOpen(true); }} className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
          Create New Provider
        </button>
      </div>

      {isModalOpen && (
        <ProviderForm
          provider={editingProvider}
          onSave={handleSave}
          onCancel={() => { setIsModalOpen(false); setEditingProvider(null); }}
          isSaving={isSaving}
        />
      )}

      <div className="bg-white p-4 rounded-lg shadow-sm overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {providers.map(provider => (
              <tr key={provider.id}>
                <td className="px-6 py-4 font-medium">{provider.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button onClick={() => { setEditingProvider(provider); setIsModalOpen(true); }} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                  <button onClick={() => handleDelete(provider.id)} className="ml-4 text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}