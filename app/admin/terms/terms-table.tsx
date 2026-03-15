'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import type { Database } from '@/types/supabase'

type Term = Database['public']['Tables']['terms']['Row']
type TermType = Database['public']['Tables']['term_types']['Row']

// A modal form for creating and editing terms
function TermForm({ term, termTypes, onSave, onCancel, isSaving }: {
  term: Partial<Term> | null,
  termTypes: TermType[],
  onSave: (term: Partial<Term>) => void,
  onCancel: () => void,
  isSaving: boolean
}) {
  // FIX: Ensure all form fields are initialized to non-undefined values
  const [formData, setFormData] = useState<Partial<Term>>({
    term: term?.term || '',
    definition: term?.definition || '',
    example: term?.example || '',
    priority: term?.priority || 0,
    term_type_id: term?.term_type_id || null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const isNumeric = ['priority', 'term_type_id'].includes(name);
    setFormData(prev => ({ ...prev, [name]: isNumeric ? (value ? parseInt(value, 10) : null) : value }));
  };

  const handleSaveClick = () => {
    // Pass the current form data up to the parent to handle the save
    onSave(formData);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">{term?.id ? 'Edit Term' : 'Create New Term'}</h2>
        <div className="space-y-4">
          <input name="term" value={formData.term ?? ''} onChange={handleChange} placeholder="Term" className="w-full p-2 border rounded" />
          <textarea name="definition" value={formData.definition ?? ''} onChange={handleChange} placeholder="Definition" className="w-full p-2 border rounded" />
          <textarea name="example" value={formData.example ?? ''} onChange={handleChange} placeholder="Example" className="w-full p-2 border rounded" />
          <input name="priority" type="number" value={formData.priority ?? 0} onChange={handleChange} placeholder="Priority" className="w-full p-2 border rounded" />
          <select name="term_type_id" value={formData.term_type_id ?? ''} onChange={handleChange} className="w-full p-2 border rounded">
            <option value="">Select Term Type</option>
            {termTypes.map(type => <option key={type.id} value={type.id}>{type.name}</option>)}
          </select>
        </div>
        <div className="mt-6 flex justify-end gap-4">
          <button onClick={onCancel} className="py-2 px-4 rounded bg-gray-200 hover:bg-gray-300" disabled={isSaving}>Cancel</button>
          <button onClick={handleSaveClick} className="py-2 px-4 rounded bg-green-500 text-white hover:bg-green-600 disabled:bg-gray-400" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

// The main table component
export default function TermsTable({ terms, termTypes }: { terms: Term[], termTypes: TermType[] }) {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTerm, setEditingTerm] = useState<Partial<Term> | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async (termData: Partial<Term>) => {
    setIsSaving(true)
    const supabase = createClient()

    // FIX: Base the decision on `editingTerm.id` instead of `termData.id`
    const dataToSave = { ...termData };

    const { error } = editingTerm?.id
      ? await supabase.from('terms').update(dataToSave).eq('id', editingTerm.id)
      : await supabase.from('terms').insert(dataToSave)

    if (!error) {
      setIsModalOpen(false)
      setEditingTerm(null)
      router.refresh()
    }
    setIsSaving(false)
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this term?')) return
    const supabase = createClient()
    await supabase.from('terms').delete().eq('id', id)
    router.refresh()
  }

  return (
    <>
      <div className="mb-4">
        <button onClick={() => { setEditingTerm({}); setIsModalOpen(true); }} className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
          Create New Term
        </button>
      </div>

      {isModalOpen && (
        <TermForm
          term={editingTerm}
          termTypes={termTypes}
          onSave={handleSave}
          onCancel={() => { setIsModalOpen(false); setEditingTerm(null); }}
          isSaving={isSaving}
        />
      )}

      <div className="bg-white p-4 rounded-lg shadow-sm overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Term</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Definition</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {terms.map(term => (
              <tr key={term.id}>
                <td className="px-6 py-4 font-medium">{term.term}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{term.definition}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button onClick={() => { setEditingTerm(term); setIsModalOpen(true); }} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                  <button onClick={() => handleDelete(term.id)} className="ml-4 text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}