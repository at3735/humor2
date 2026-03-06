'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import type { Database } from '@/types/supabase'

type Image = Database['public']['Tables']['images']['Row']

export default function ImagesTable({ images }: { images: Image[] }) {
  const router = useRouter()
  // State for Create Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  // State for Edit Modal
  const [imageToEdit, setImageToEdit] = useState<Image | null>(null)

  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFile(e.target.files[0])
  }

  const resetState = () => {
    setFile(null)
    setError(null)
    setIsUploading(false)
    setIsCreateModalOpen(false)
    setImageToEdit(null)
  }

  // --- CREATE logic ---
  const handleCreate = async () => {
    if (!file) { setError('Please select a file.'); return }
    setIsUploading(true)
    setError(null)
    const supabase = createClient()
    const filePath = `public/${Date.now()}-${file.name}`
    const { error: uploadError } = await supabase.storage.from('images').upload(filePath, file)
    if (uploadError) { setError(`Upload failed: ${uploadError.message}`); setIsUploading(false); return }
    const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(filePath)
    const { error: dbError } = await supabase.from('images').insert([{ url: publicUrl }])
    if (dbError) { setError(`Database insert failed: ${dbError.message}`); setIsUploading(false); return }
    resetState()
    router.refresh()
  }

  // --- EDIT logic ---
  const handleEdit = (image: Image) => {
    setImageToEdit(image)
  }

  const handleUpdate = async () => {
    if (!file || !imageToEdit) { setError('No file selected or image to edit.'); return }
    setIsUploading(true)
    setError(null)
    const supabase = createClient()

    // 1. Upload new file
    const newFilePath = `public/${Date.now()}-${file.name}`
    const { error: uploadError } = await supabase.storage.from('images').upload(newFilePath, file)
    if (uploadError) { setError(`New image upload failed: ${uploadError.message}`); setIsUploading(false); return }
    const { data: { publicUrl: newPublicUrl } } = supabase.storage.from('images').getPublicUrl(newFilePath)

    // 2. Update database record
    const { error: dbError } = await supabase.from('images').update({ url: newPublicUrl }).eq('id', imageToEdit.id)
    if (dbError) { setError(`Database update failed: ${dbError.message}`); setIsUploading(false); return }

    // 3. Delete old file from storage
    if (imageToEdit.url) {
      const oldFilePath = imageToEdit.url.split('/images/')[1]
      if (oldFilePath) {
        await supabase.storage.from('images').remove([oldFilePath])
      }
    }

    resetState()
    router.refresh()
  }

  // --- DELETE logic ---
  const handleDelete = async (image: Image) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return
    const supabase = createClient()
    if (image.url) {
      const filePath = image.url.split('/images/')[1]
      if (filePath) await supabase.storage.from('images').remove([filePath])
    }
    await supabase.from('images').delete().eq('id', image.id)
    router.refresh()
  }

  return (
    <>
      {/* --- BUTTONS & MODALS --- */}
      <div className="mb-4">
        <button onClick={() => setIsCreateModalOpen(true)} className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">Create New Image</button>
      </div>
      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Upload a New Image</h2>
            <input type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            <div className="mt-6 flex justify-end gap-4">
              <button onClick={resetState} className="py-2 px-4 rounded bg-gray-200 hover:bg-gray-300" disabled={isUploading}>Cancel</button>
              <button onClick={handleCreate} className="py-2 px-4 rounded bg-green-500 text-white hover:bg-green-600 disabled:bg-gray-400" disabled={isUploading}>{isUploading ? 'Uploading...' : 'Upload'}</button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Modal */}
      {imageToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Replace Image</h2>
            <p className="text-sm text-gray-500 mb-2">Current Image:</p>
            <img src={imageToEdit.url ?? ''} alt="Current" className="h-24 w-24 object-cover rounded mb-4"/>
            <input type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            <div className="mt-6 flex justify-end gap-4">
              <button onClick={resetState} className="py-2 px-4 rounded bg-gray-200 hover:bg-gray-300" disabled={isUploading}>Cancel</button>
              <button onClick={handleUpdate} className="py-2 px-4 rounded bg-green-500 text-white hover:bg-green-600 disabled:bg-gray-400" disabled={isUploading}>{isUploading ? 'Updating...' : 'Update'}</button>
            </div>
          </div>
        </div>
      )}

      {/* --- IMAGES TABLE --- */}
      <div className="bg-white p-4 rounded-lg shadow-sm overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">URL</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {images?.map((img) => (
              <tr key={img.id}>
                <td className="px-6 py-4"><img src={img.url ?? ''} alt="User upload" className="h-16 w-16 object-cover rounded"/></td>
                <td className="px-6 py-4 max-w-xs truncate text-sm text-gray-500" title={img.url ?? ''}>{img.url}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-4">
                    <button onClick={() => handleEdit(img)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                    <button onClick={() => handleDelete(img)} className="text-red-600 hover:text-red-900">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}