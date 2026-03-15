'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import type { Database } from '@/types/supabase'

type Model = Database['public']['Tables']['llm_models']['Row']
type Provider = Database['public']['Tables']['llm_providers']['Row']

function ModelForm({ model, providers, onSave, onCancel, isSaving }: {
  model: Partial<Model> | null,
  providers: Provider[],
  onSave: (model: Partial<Model>) => void,
  onCancel: () => void,
  isSaving: boolean
}) {
  const [formData, setFormData] = useState<Partial<Model>>(model || { name: '', provider_model_id: '', is_temperature_supported: false });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: name === 'llm_provider_id' ? parseInt(value, 10) : value }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">{model?.id ? 'Edit Model' : 'Create New Model'}</h2>
        <div className="space-y-4">
          <input name="name" value={formData.name} onChange={handleChange} placeholder="Model Name (e.g., GPT-4 Turbo)" className="w-full p-2 border rounded" />
          <input name="provider_model_id" value={formData.provider_model_id} onChange={handleChange} placeholder="Provider Model ID (e.g., gpt-4-1106-preview)" className="w-full p-2 border rounded" />
          <select name="llm_provider_id" value={formData.llm_provider_id ?? ''} onChange={handleChange} className="w-full p-2 border rounded">
            <option value="">Select Provider</option>
            {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <label className="flex items-center gap-2">
            <input name="is_temperature_supported" type="checkbox" checked={formData.is_temperature_supported} onChange={handleChange} className="h-4 w-4" />
            <span>Temperature Supported</span>
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-4">
          <button onClick={onCancel} className="py-2 px-4 rounded bg-gray-200 hover:bg-gray-300" disabled={isSaving}>Cancel</button>
          <button onClick={() => onSave(formData)} className="py-2 px-4 rounded bg-green-500 text-white hover:bg-green-600 disabled:bg-gray-400" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ModelsTable({ models, providers }: { models: Model[], providers: Provider[] }) {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingModel, setEditingModel] = useState<Partial<Model> | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async (modelData: Partial<Model>) => {
    setIsSaving(true)
    const supabase = createClient()
    const { error } = editingModel?.id
      ? await supabase.from('llm_models').update(modelData).eq('id', editingModel.id)
      : await supabase.from('llm_models').insert(modelData)

    if (!error) {
      setIsModalOpen(false)
      setEditingModel(null)
      router.refresh()
    }
    setIsSaving(false)
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this model?')) return
    const supabase = createClient()
    await supabase.from('llm_models').delete().eq('id', id)
    router.refresh()
  }

  return (
    <>
      <div className="mb-4">
        <button onClick={() => { setEditingModel({}); setIsModalOpen(true); }} className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
          Create New Model
        </button>
      </div>

      {isModalOpen && (
        <ModelForm
          model={editingModel}
          providers={providers}
          onSave={handleSave}
          onCancel={() => { setIsModalOpen(false); setEditingModel(null); }}
          isSaving={isSaving}
        />
      )}

      <div className="bg-white p-4 rounded-lg shadow-sm overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th>Name</th>
              <th>Provider Model ID</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {models.map(model => (
              <tr key={model.id}>
                <td className="px-6 py-4 font-medium">{model.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{model.provider_model_id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button onClick={() => { setEditingModel(model); setIsModalOpen(true); }} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                  <button onClick={() => handleDelete(model.id)} className="ml-4 text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}