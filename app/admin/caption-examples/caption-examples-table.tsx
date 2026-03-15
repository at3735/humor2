'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import type { Database } from '@/types/supabase'

type CaptionExample = Database['public']['Tables']['caption_examples']['Row']

function ExampleForm({ example, onSave, onCancel, isSaving }: {
  example: Partial<CaptionExample> | null,
  onSave: (example: Partial<CaptionExample>) => void,
  onCancel: () => void,
  isSaving: boolean
}) {
  const [formData, setFormData] = useState<Partial<CaptionExample>>(example || { image_description: '', caption: '', explanation: '', priority: 0 });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'priority' ? parseInt(value, 10) : value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">{example?.id ? 'Edit Example' : 'Create New Example'}</h2>
        <div className="space-y-4">
          <textarea name="image_description" value={formData.image_description} onChange={handleChange} placeholder="Image Description" className="w-full p-2 border rounded" />
          <textarea name="caption" value={formData.caption} onChange={handleChange} placeholder="Caption" className="w-full p-2 border rounded" />
          <textarea name="explanation" value={formData.explanation} onChange={handleChange} placeholder="Explanation" className="w-full p-2 border rounded" />
          <input name="priority" type="number" value={formData.priority} onChange={handleChange} placeholder="Priority" className="w-full p-2 border rounded" />
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

export default function ExamplesTable({ examples }: { examples: CaptionExample[] }) {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingExample, setEditingExample] = useState<Partial<CaptionExample> | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async (exampleData: Partial<CaptionExample>) => {
    setIsSaving(true)
    const supabase = createClient()
    const { error } = editingExample?.id
      ? await supabase.from('caption_examples').update(exampleData).eq('id', editingExample.id)
      : await supabase.from('caption_examples').insert(exampleData)

    if (!error) {
      setIsModalOpen(false)
      setEditingExample(null)
      router.refresh()
    }
    setIsSaving(false)
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this example?')) return
    const supabase = createClient()
    await supabase.from('caption_examples').delete().eq('id', id)
    router.refresh()
  }

  return (
    <>
      <div className="mb-4">
        <button onClick={() => { setEditingExample({}); setIsModalOpen(true); }} className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
          Create New Example
        </button>
      </div>

      {isModalOpen && (
        <ExampleForm
          example={editingExample}
          onSave={handleSave}
          onCancel={() => { setIsModalOpen(false); setEditingExample(null); }}
          isSaving={isSaving}
        />
      )}

      <div className="bg-white p-4 rounded-lg shadow-sm overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th>Image Description</th>
              <th>Caption</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {examples.map(example => (
              <tr key={example.id}>
                <td className="px-6 py-4 text-sm text-gray-500">{example.image_description}</td>
                <td className="px-6 py-4 font-medium">{example.caption}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button onClick={() => { setEditingExample(example); setIsModalOpen(true); }} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                  <button onClick={() => handleDelete(example.id)} className="ml-4 text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}