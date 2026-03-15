'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import type { Database } from '@/types/supabase'

type Whitelist = Database['public']['Tables']['whitelist_email_addresses']['Row']

function WhitelistForm({ email, onSave, onCancel, isSaving }: {
  email: Partial<Whitelist> | null,
  onSave: (email: Partial<Whitelist>) => void,
  onCancel: () => void,
  isSaving: boolean
}) {
  const [emailAddress, setEmailAddress] = useState(email?.email_address || '')

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{email?.id ? 'Edit Email' : 'Create New Email'}</h2>
        <input value={emailAddress} onChange={(e) => setEmailAddress(e.target.value)} placeholder="e.g., user@example.com" className="w-full p-2 border rounded" />
        <div className="mt-6 flex justify-end gap-4">
          <button onClick={onCancel} className="py-2 px-4 rounded bg-gray-200 hover:bg-gray-300" disabled={isSaving}>Cancel</button>
          <button onClick={() => onSave({ ...email, email_address: emailAddress })} className="py-2 px-4 rounded bg-green-500 text-white hover:bg-green-600 disabled:bg-gray-400" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function WhitelistTable({ emails }: { emails: Whitelist[] }) {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEmail, setEditingEmail] = useState<Partial<Whitelist> | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async (emailData: Partial<Whitelist>) => {
    setIsSaving(true)
    const supabase = createClient()
    const { error } = editingEmail?.id
      ? await supabase.from('whitelist_email_addresses').update(emailData).eq('id', editingEmail.id)
      : await supabase.from('whitelist_email_addresses').insert(emailData)

    if (!error) {
      setIsModalOpen(false)
      setEditingEmail(null)
      router.refresh()
    }
    setIsSaving(false)
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this email?')) return
    const supabase = createClient()
    await supabase.from('whitelist_email_addresses').delete().eq('id', id)
    router.refresh()
  }

  return (
    <>
      <div className="mb-4">
        <button onClick={() => { setEditingEmail({}); setIsModalOpen(true); }} className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
          Create New Email
        </button>
      </div>

      {isModalOpen && (
        <WhitelistForm
          email={editingEmail}
          onSave={handleSave}
          onCancel={() => { setIsModalOpen(false); setEditingEmail(null); }}
          isSaving={isSaving}
        />
      )}

      <div className="bg-white p-4 rounded-lg shadow-sm overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email Address</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {emails.map(email => (
              <tr key={email.id}>
                <td className="px-6 py-4 font-medium">{email.email_address}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button onClick={() => { setEditingEmail(email); setIsModalOpen(true); }} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                  <button onClick={() => handleDelete(email.id)} className="ml-4 text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}